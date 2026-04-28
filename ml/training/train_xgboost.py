"""Train an XGBoost classifier for spam on text-derived behavioral features.

The report frames XGBoost as the "behavioral / structured" component. Since
SMS Spam Collection has no per-account behavioral data, we train on
text-derived behavioral proxies (length, digit ratio, URL count, capitalisation,
punctuation, etc.). When the runtime predictor is given account-level
behavioral features (posts_last_hour, account_age_days, …) those are appended
as additional features at inference time.

Usage (Colab or local):
    !pip install -q -r requirements-train.txt
    !python training/train_xgboost.py --output_dir models/xgboost/saved

Trains in <30 seconds on CPU.
"""

from __future__ import annotations
import argparse
import json
import os
import re

import numpy as np
import pandas as pd
import xgboost as xgb
from datasets import load_dataset
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split


URL_RE = re.compile(r"https?://\S+|www\.\S+|\b[\w-]+\.(com|net|org|in|io|co|me|ru|cn|tk|ml)\b", re.I)
PHONE_RE = re.compile(r"\+?\d[\d\s\-]{7,}\d")


# Same feature names used by the runtime predictor — keep in sync.
TEXT_FEATURE_NAMES = [
    "length",
    "word_count",
    "digit_ratio",
    "upper_ratio",
    "exclamation_count",
    "question_count",
    "url_count",
    "phone_count",
    "currency_count",
    "max_repeat_run",
]

BEHAVIORAL_FEATURE_NAMES = [
    "posts_last_hour",
    "posts_last_day",
    "account_age_days",
    "avg_message_length",
    "duplicate_message_count",
]


def extract_text_features(text: str) -> list[float]:
    if not text:
        return [0.0] * len(TEXT_FEATURE_NAMES)
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


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--output_dir", default="models/xgboost/saved")
    p.add_argument("--n_estimators", type=int, default=200)
    p.add_argument("--max_depth", type=int, default=6)
    p.add_argument("--learning_rate", type=float, default=0.1)
    p.add_argument("--seed", type=int, default=45)
    return p.parse_args()


def main() -> None:
    args = parse_args()

    print("[xgb] loading dataset 'sms_spam'")
    ds = load_dataset("sms_spam")["train"]
    df = pd.DataFrame({"text": ds["sms"], "label": ds["label"]})

    print("[xgb] extracting text features")
    X_text = np.array([extract_text_features(t) for t in df["text"]], dtype=np.float32)

    # Behavioral features at training time are unknown — fill with neutral
    # defaults so the model learns to ignore them. At inference, real values
    # take over.
    X_beh = np.tile(
        np.array([0.0, 0.0, 365.0, 100.0, 0.0], dtype=np.float32),
        (len(df), 1),
    )

    X = np.concatenate([X_text, X_beh], axis=1)
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=args.seed
    )

    print(f"[xgb] train={len(X_train)} test={len(X_test)}")

    clf = xgb.XGBClassifier(
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
        learning_rate=args.learning_rate,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=args.seed,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    probs = clf.predict_proba(X_test)[:, 1]
    preds = (probs >= 0.5).astype(int)

    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test, preds, average="binary", zero_division=0
    )
    acc = accuracy_score(y_test, preds)
    auc = roc_auc_score(y_test, probs)
    cm = confusion_matrix(y_test, preds).tolist()

    os.makedirs(args.output_dir, exist_ok=True)
    clf.get_booster().save_model(os.path.join(args.output_dir, "xgb.json"))
    with open(os.path.join(args.output_dir, "feature_names.json"), "w") as f:
        json.dump(
            {
                "text_features": TEXT_FEATURE_NAMES,
                "behavioral_features": BEHAVIORAL_FEATURE_NAMES,
            },
            f,
            indent=2,
        )
    with open(os.path.join(args.output_dir, "training_metrics.json"), "w") as f:
        json.dump(
            {
                "accuracy": acc,
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "auc": auc,
                "confusion_matrix": cm,
            },
            f,
            indent=2,
        )

    print("[xgb] saved to", args.output_dir)
    print(f"[xgb] accuracy={acc:.4f} precision={precision:.4f} recall={recall:.4f} f1={f1:.4f} auc={auc:.4f}")
    print("[xgb] confusion matrix:", cm)


if __name__ == "__main__":
    main()
