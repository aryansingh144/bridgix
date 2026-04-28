"""FastAPI entry for the Bridgix spam detection microservice."""

from __future__ import annotations
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel, Field

from config import load_settings
from ensemble import HybridSpamDetector
from schemas import BehavioralFeatures, GraphFeatures

load_dotenv()
settings = load_settings()
detector = HybridSpamDetector(settings)

app = FastAPI(title="Bridgix Spam Detection Service", version="0.1.0")


# ── HTTP schemas ────────────────────────────────────────────────────────────
class BehavioralIn(BaseModel):
    posts_last_hour: int = 0
    posts_last_day: int = 0
    account_age_days: int = 365
    avg_message_length: float = 100.0
    duplicate_message_count: int = 0


class GraphIn(BaseModel):
    out_degree: int = 5
    in_degree: int = 5
    new_connections_last_day: int = 0
    suspicious_neighbor_ratio: float = 0.0


class PredictRequest(BaseModel):
    text: str = Field(..., description="Message or post content to classify")
    user_id: Optional[str] = None
    content_type: Optional[str] = Field(None, description="message | post | discussion")
    behavioral: Optional[BehavioralIn] = None
    graph: Optional[GraphIn] = None


class PredictResponse(BaseModel):
    is_spam: bool
    score: float
    label: str
    bert_score: float
    graphsage_score: float
    xgboost_score: float
    reasons: list[str]


# ── Routes ──────────────────────────────────────────────────────────────────
@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "bridgix-spam-detector",
        "threshold": detector.threshold,
        "weights": {
            "bert": detector.w_bert,
            "graphsage": detector.w_graph,
            "xgboost": detector.w_xgb,
        },
    }


@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    behavioral = (
        BehavioralFeatures(**req.behavioral.model_dump()) if req.behavioral else None
    )
    graph = GraphFeatures(**req.graph.model_dump()) if req.graph else None

    result = detector.predict(req.text, behavioral=behavioral, graph=graph)
    return PredictResponse(**result.__dict__)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=settings.port, reload=True)
