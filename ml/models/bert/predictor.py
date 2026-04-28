"""BERT predictor — contextual / semantic spam signal.

Loads `bert-base-uncased` fine-tuned on SMS Spam Collection from
`models/bert/saved/`. If the saved directory is missing (no training has
been run yet), falls back to a rule-based stub so the pipeline keeps
working end-to-end during development.
"""

from __future__ import annotations
import os
import re
import logging

from schemas import ComponentScore

log = logging.getLogger("bert_predictor")

SAVED_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved")


SPAM_KEYWORDS = [
    "buy now", "click here", "free money", "make money fast", "viagra",
    "winner", "congratulations you won", "claim your prize", "limited time offer",
    "act now", "100% free", "risk free", "guarantee", "no obligation",
    "earn $", "work from home", "investment opportunity", "double your income",
    "lottery", "bitcoin", "crypto investment", "telegram channel", "whatsapp",
    "dm me", "increase followers", "buy followers", "cheap loans",
]

URL_PATTERN = re.compile(
    r"https?://\S+|www\.\S+|\b[\w-]+\.(com|net|org|in|io|co|me|ru|cn|tk|ml)\b",
    re.IGNORECASE,
)
PHONE_PATTERN = re.compile(r"\+?\d[\d\s\-]{7,}\d")
REPEAT_PATTERN = re.compile(r"(.)\1{4,}")


class BertPredictor:
    name = "bert"

    def __init__(self) -> None:
        self.tokenizer = None
        self.model = None
        self.ready = False

        if os.path.isdir(SAVED_DIR) and os.path.exists(os.path.join(SAVED_DIR, "config.json")):
            try:
                import torch  # noqa: F401  (ensures torch is available)
                from transformers import AutoModelForSequenceClassification, AutoTokenizer

                self.tokenizer = AutoTokenizer.from_pretrained(SAVED_DIR)
                self.model = AutoModelForSequenceClassification.from_pretrained(SAVED_DIR)
                self.model.eval()
                self.ready = True
                log.info("BERT loaded from %s", SAVED_DIR)
                print(f"[bert] loaded fine-tuned model from {SAVED_DIR}")
            except Exception as e:  # pragma: no cover
                log.warning("Failed to load BERT model: %s — falling back to stub", e)
                print(f"[bert] load failed ({e}); using rule-based stub")
        else:
            print(f"[bert] no trained weights at {SAVED_DIR}; using rule-based stub")

    # ── Inference ───────────────────────────────────────────────────────────
    def predict(self, text: str) -> ComponentScore:
        if not text:
            return ComponentScore(score=0.0)
        if self.ready:
            return self._predict_trained(text)
        return self._predict_stub(text)

    def _predict_trained(self, text: str) -> ComponentScore:
        import torch

        with torch.no_grad():
            inputs = self.tokenizer(
                text,
                return_tensors="pt",
                truncation=True,
                max_length=128,
                padding=True,
            )
            logits = self.model(**inputs).logits
            prob = torch.softmax(logits, dim=-1)[0, 1].item()

        reasons: list[str] = []
        if prob >= 0.85:
            reasons.append("bert: very high spam likelihood")
        elif prob >= 0.6:
            reasons.append("bert: high spam likelihood")
        elif prob >= 0.4:
            reasons.append("bert: moderate spam likelihood")
        return ComponentScore(score=float(prob), reasons=reasons)

    def _predict_stub(self, text: str) -> ComponentScore:
        score = 0.0
        reasons: list[str] = []
        lowered = text.lower()

        keyword_hits = sum(1 for kw in SPAM_KEYWORDS if kw in lowered)
        if keyword_hits:
            score += min(0.25 * keyword_hits, 0.7)
            reasons.append(f"matched {keyword_hits} spam keyword(s)")

        urls = URL_PATTERN.findall(text)
        if len(urls) >= 2:
            score += 0.25
            reasons.append("multiple URLs")
        elif len(urls) == 1 and keyword_hits:
            score += 0.15
            reasons.append("URL alongside promotional language")

        if PHONE_PATTERN.search(text) and keyword_hits:
            score += 0.15
            reasons.append("phone number with promotional language")

        if REPEAT_PATTERN.search(text):
            score += 0.1
            reasons.append("excessive character repetition")

        if len(text) > 25:
            upper_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
            if upper_ratio > 0.6:
                score += 0.15
                reasons.append("predominantly uppercase")

        return ComponentScore(score=min(score, 1.0), reasons=reasons)
