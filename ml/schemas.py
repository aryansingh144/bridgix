"""Shared dataclasses used across predictors and the ensemble.

Pydantic types live in main.py for the HTTP boundary; everything inside the
detector pipeline uses these plain dataclasses to stay framework-free.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class BehavioralFeatures:
    posts_last_hour: int = 0
    posts_last_day: int = 0
    account_age_days: int = 365
    avg_message_length: float = 100.0
    duplicate_message_count: int = 0


@dataclass
class GraphFeatures:
    out_degree: int = 5
    in_degree: int = 5
    new_connections_last_day: int = 0
    suspicious_neighbor_ratio: float = 0.0


@dataclass
class ComponentScore:
    """Output of a single model predictor."""
    score: float
    reasons: list[str] = field(default_factory=list)


@dataclass
class PredictionResult:
    is_spam: bool
    score: float
    label: str
    bert_score: float
    graphsage_score: float
    xgboost_score: float
    reasons: list[str]
