# Spam Detection Service — Architecture

A standalone FastAPI microservice the Express backend calls before persisting any user-generated content. Returns a spam probability and a flagging decision.

## Layout

```
ml/
├── main.py                    FastAPI app + HTTP schemas + routes
├── ensemble.py                HybridSpamDetector — combines the three predictors
├── config.py                  Settings loaded from env
├── schemas.py                 Internal dataclasses (BehavioralFeatures, GraphFeatures, …)
├── requirements.txt
├── .env.example
└── models/
    ├── bert/predictor.py      Contextual / semantic
    ├── graphsage/predictor.py Relational / network
    └── xgboost/predictor.py   Behavioral / structured
```

Each predictor is fully self-contained — its own folder, its own `__init__.py`. When the trained version of a model lands, drop weights into `models/<name>/saved/` and update only that predictor. The ensemble and the HTTP layer don't change.

## Hybrid model

| Predictor   | Input                          | What it captures                                          |
| ----------- | ------------------------------ | --------------------------------------------------------- |
| BERT        | message text                   | Contextual semantic patterns (the dominant signal)        |
| GraphSAGE   | per-user graph features        | Coordinated / bot-network detection                       |
| XGBoost     | behavioral features            | Posting frequency, account age, duplicates, length        |

```
score   = w_bert · P_bert + w_graph · P_graphsage + w_xgb · P_xgboost
is_spam = score >= SPAM_THRESHOLD
```

Weights and threshold are env-configurable (`.env.example`). Defaults: `0.5 / 0.2 / 0.3`, threshold `0.5`. Weights are normalized to sum to 1.

## Predictor contract

Each predictor exposes a `predict(...)` method returning `ComponentScore(score, reasons)`. Signatures differ because the inputs differ:

```python
BertPredictor.predict(text)                        -> ComponentScore
GraphSagePredictor.predict(graph)                  -> ComponentScore
XgboostPredictor.predict(behavioral, text)         -> ComponentScore
```

`reasons` is a list of human-readable strings — these power the "why was this flagged" UI in the moderation queue and are what the demo / report defense leans on to explain decisions.

## Current status — stub classifiers

Each predictor currently returns a rule-based probability so the rest of the system (backend hook, moderation queue, flagged-content UI) can be developed and tested end-to-end. **Nothing about the contract changes when real models replace the stubs.**

To swap in a trained model, replace the body of `predict()` in `models/<name>/predictor.py`. Adding new models in the future means adding a new folder under `models/`, a new weight in `config.py`, and one line in `ensemble.py`.

## Endpoints

- `GET /health` — service status, current threshold + ensemble weights
- `POST /predict` — classify a piece of content

### `POST /predict` request

```json
{
  "text": "...",
  "user_id": "<optional>",
  "content_type": "message | post | discussion",
  "behavioral": { "posts_last_hour": 0, "account_age_days": 365, ... },
  "graph":      { "out_degree": 5, "in_degree": 5, ... }
}
```

`behavioral` and `graph` are optional — the corresponding component contributes 0 if omitted.

### Response

```json
{
  "is_spam": false,
  "score": 0.12,
  "label": "ham",
  "bert_score": 0.0,
  "graphsage_score": 0.0,
  "xgboost_score": 0.4,
  "reasons": ["very new account"]
}
```

## Run locally

```
cd ml
python -m venv .venv
.venv\Scripts\activate            # Windows
pip install -r requirements.txt
copy .env.example .env
python main.py
```

Service listens on `http://localhost:8000` by default.
