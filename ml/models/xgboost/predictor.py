"""XGBoost predictor — behavioral / structured spam signal.

Loads a trained xgb.Booster from `models/xgboost/saved/xgb.json`. Falls back
to a rule-based stub if no trained model is present.
"""

from __future__ import annotations
import os
import re
import logging
from typing import Optional

from schemas import ComponentScore, BehavioralFeatures

log = logging.getLogger("xgb_predictor")

SAVED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved")
MODEL_PATH = os.path.join(SAVED_DIR, "xgb.json")


URL_RE = re.compile(
    r"https?://\S+|www\.\S+|\b[\w-]+\.(com|net|org|in|io|co|me|ru|cn|tk|ml)\b",
    re.IGNORECASE,
)
PHONE_RE = re.compile(r"\+?\d[\d\s\-]{7,}\d")


def _extract_text_features(text: str) -> list[float]:
    """Same feature order as training/train_xgboost.py — keep in sync."""
    if not text:
        return [0.0] * 10
    n = max(len(text), 1)
    digits = sum(c.isdigit() for c in text)
    uppers = sum(c.isupper() for c in text)
    max_run = 1
    cur = 1
    for i in range(1, len(text)):
        if text[i] == text[i - 1]:
            cur += 1
            max_run = max(max_run, cur)
        else:
            cur = 1
    return [
        float(len(text)),
        float(len(text.split())),
        digits / n,
        uppers / n,
        float(text.count("!")),
        float(text.count("?")),
        float(len(URL_RE.findall(text))),
        float(len(PHONE_RE.findall(text))),
        float(text.count("$") + text.count("₹") + text.count("£") + text.count("€")),
        float(max_run),
    ]


def _behavioral_vector(b: Optional[BehavioralFeatures]) -> list[float]:
    if b is None:
        return [0.0, 0.0, 365.0, 100.0, 0.0]
    return [
        float(b.posts_last_hour),
        float(b.posts_last_day),
        float(b.account_age_days),
        float(b.avg_message_length),
        float(b.duplicate_message_count),
    ]


class XgboostPredictor:
    name = "xgboost"

    def __init__(self) -> None:
        self.booster = None
        self.ready = False

        if os.path.exists(MODEL_PATH):
            try:
                import xgboost as xgb

                booster = xgb.Booster()
                booster.load_model(MODEL_PATH)
                self.booster = booster
                self.ready = True
                print(f"[xgb] loaded trained model from {MODEL_PATH}")
            except Exception as e:  # pragma: no cover
                log.warning("Failed to load XGBoost model: %s", e)
                print(f"[xgb] load failed ({e}); using rule-based stub")
        else:
            print(f"[xgb] no trained model at {MODEL_PATH}; using rule-based stub")

    def predict(
        self, behavioral: Optional[BehavioralFeatures], text: str
    ) -> ComponentScore:
        if self.ready:
            return self._predict_trained(behavioral, text)
        return self._predict_stub(behavioral, text)

    def _predict_trained(
        self, behavioral: Optional[BehavioralFeatures], text: str
    ) -> ComponentScore:
        import numpy as np
        import xgboost as xgb

        feats = _extract_text_features(text) + _behavioral_vector(behavioral)
        dmat = xgb.DMatrix(np.asarray([feats], dtype=np.float32))
        prob = float(self.booster.predict(dmat)[0])

        reasons: list[str] = []
        if behavioral is not None:
            if behavioral.posts_last_hour > 10:
                reasons.append("very high posting frequency")
            if behavioral.account_age_days < 1:
                reasons.append("brand new account")
            elif behavioral.account_age_days < 7:
                reasons.append("very new account")
            if behavioral.duplicate_message_count >= 3:
                reasons.append("repeated identical messages")
        if prob >= 0.7:
            reasons.append("xgboost: structured features match spam pattern")
        return ComponentScore(score=prob, reasons=reasons)

    def _predict_stub(
        self, behavioral: Optional[BehavioralFeatures], text: str
    ) -> ComponentScore:
        if behavioral is None:
            return ComponentScore(score=0.0)
        score = 0.0
        reasons: list[str] = []
        if behavioral.posts_last_hour > 10:
            score += 0.35
            reasons.append("very high posting frequency")
        elif behavioral.posts_last_hour > 5:
            score += 0.15
            reasons.append("elevated posting frequency")
        if behavioral.account_age_days < 1:
            score += 0.3
            reasons.append("brand new account")
        elif behavioral.account_age_days < 7:
            score += 0.15
            reasons.append("very new account")
        if behavioral.duplicate_message_count >= 3:
            score += 0.3
            reasons.append("repeated identical messages")
        if text and len(text) < 5:
            score += 0.05
        return ComponentScore(score=min(score, 1.0), reasons=reasons)
