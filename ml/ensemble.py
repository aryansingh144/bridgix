"""Hybrid spam detector — orchestrates the three component predictors.

  score   = w_bert · P_bert + w_graph · P_graphsage + w_xgb · P_xgboost
  is_spam = score >= SPAM_THRESHOLD

Each predictor is independent and can be swapped without touching this file.
"""

from __future__ import annotations
from typing import Optional

from config import Settings
from schemas import (
    BehavioralFeatures,
    GraphFeatures,
    PredictionResult,
)
from models.bert import BertPredictor
from models.graphsage import GraphSagePredictor
from models.xgboost import XgboostPredictor


class HybridSpamDetector:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.w_bert, self.w_graph, self.w_xgb = settings.normalized_weights
        self.threshold = settings.spam_threshold

        self.bert = BertPredictor()
        self.graphsage = GraphSagePredictor()
        self.xgboost = XgboostPredictor()

    def predict(
        self,
        text: str,
        behavioral: Optional[BehavioralFeatures] = None,
        graph: Optional[GraphFeatures] = None,
    ) -> PredictionResult:
        bert = self.bert.predict(text)
        graph_out = self.graphsage.predict(graph)
        xgb = self.xgboost.predict(behavioral, text)

        score = (
            self.w_bert * bert.score
            + self.w_graph * graph_out.score
            + self.w_xgb * xgb.score
        )
        score = max(0.0, min(score, 1.0))
        is_spam = score >= self.threshold

        return PredictionResult(
            is_spam=is_spam,
            score=round(score, 4),
            label="spam" if is_spam else "ham",
            bert_score=round(bert.score, 4),
            graphsage_score=round(graph_out.score, 4),
            xgboost_score=round(xgb.score, 4),
            reasons=[*bert.reasons, *graph_out.reasons, *xgb.reasons],
        )
