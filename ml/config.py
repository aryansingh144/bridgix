"""Environment-driven configuration for the spam detection service."""

from __future__ import annotations
import os
from dataclasses import dataclass


@dataclass
class Settings:
    port: int
    spam_threshold: float
    bert_weight: float
    graphsage_weight: float
    xgboost_weight: float

    @property
    def normalized_weights(self) -> tuple[float, float, float]:
        total = self.bert_weight + self.graphsage_weight + self.xgboost_weight
        if total <= 0:
            return (1.0, 0.0, 0.0)
        return (
            self.bert_weight / total,
            self.graphsage_weight / total,
            self.xgboost_weight / total,
        )


def load_settings() -> Settings:
    return Settings(
        port=int(os.getenv("PORT", "8000")),
        spam_threshold=float(os.getenv("SPAM_THRESHOLD", "0.5")),
        bert_weight=float(os.getenv("BERT_WEIGHT", "0.5")),
        graphsage_weight=float(os.getenv("GRAPHSAGE_WEIGHT", "0.2")),
        xgboost_weight=float(os.getenv("XGBOOST_WEIGHT", "0.3")),
    )
