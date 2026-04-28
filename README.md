# Bridgix — AI-Enhanced Alumni–Student Networking Platform

Full-stack platform connecting alumni and students for mentorship, placement assistance, and career guidance, with an **AI-driven hybrid spam-detection layer (BERT + GraphSAGE + XGBoost)** moderating every piece of user-generated content.

See [`Bridgix.md`](./Bridgix.md) for the project overview that mirrors the report.

## Stack

| Layer | Tech |
| --- | --- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Redux Toolkit, Chart.js, Axios |
| **Backend** | Express.js, MongoDB Atlas, Mongoose |
| **ML service** | FastAPI (Python), HuggingFace Transformers, PyTorch, XGBoost, PyTorch Geometric |
| **Models** | `bert-base-uncased` (fine-tuned on SMS Spam, 99.1% acc), XGBoost (98.3% acc), GraphSAGE (synthetic graph) |

## Repo Layout

```
bridgix/
├── backend/                Express API + Mongoose models
│   ├── models/             User, Post, Message, Discussion, Connection, Event, College, Detection
│   ├── routes/             users, posts, messages, discussions, connections, events,
│   │                       leaderboard, colleges, moderation
│   ├── services/spamClient.js   Calls the FastAPI ML service before persisting content
│   ├── server.js
│   ├── seed.js             Seed real users / posts / messages
│   └── docs/spam-pipeline.md
├── frontend/               Next.js 14 app
│   ├── app/                pages (App Router) — home, chat, discussion, moderation, profile, …
│   ├── components/         Navbar, Sidebar, PostCard, RoleSwitcher, ReduxProvider, …
│   ├── store/              Redux slices (user, app)
│   └── docs/moderation.md
├── ml/                     FastAPI spam detection microservice
│   ├── main.py             HTTP layer (POST /predict, GET /health)
│   ├── ensemble.py         HybridSpamDetector (BERT · GraphSAGE · XGBoost weighted)
│   ├── config.py / schemas.py
│   ├── models/
│   │   ├── bert/{predictor.py, saved/}
│   │   ├── graphsage/{predictor.py, saved/}
│   │   └── xgboost/{predictor.py, saved/}
│   ├── training/           Colab-runnable scripts (train_bert.py, train_xgboost.py, train_graphsage.py)
│   └── docs/{architecture.md, training.md}
└── Bridgix.md              Project narrative (matches the report)
```

## Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10 (for the ML service)
- A MongoDB Atlas cluster (free M0 tier works) or local MongoDB on `:27017`

## First-time Setup

### 1. Install dependencies

```bash
npm run install:all                 # backend + frontend
cd ml && pip install -r requirements.txt
```

### 2. Configure environments

**`backend/.env`:**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/bridgix?retryWrites=true&w=majority

# Spam detection microservice
ML_SERVICE_URL=http://localhost:8000
ML_TIMEOUT_MS=4000
ML_FAIL_OPEN=true
```

**`frontend/.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**`ml/.env`:**
```
PORT=8000
SPAM_THRESHOLD=0.5
BERT_WEIGHT=0.5
GRAPHSAGE_WEIGHT=0.2
XGBOOST_WEIGHT=0.3
```

### 3. Train (or download) the ML models

The runtime predictors auto-load trained artifacts from `ml/models/<name>/saved/`. If absent they fall back to rule-based stubs so the pipeline still works end-to-end.

To train on Colab (~7–10 min on a T4 GPU), follow [`ml/docs/training.md`](./ml/docs/training.md). Drop the resulting `saved/` folders into `ml/models/<name>/saved/`.

### 4. Seed the database

```bash
cd backend
npm run seed
```

Creates 8 users (4 students + 4 alumni), 1 college, 3 events, 10 posts, 6 discussions, 20 messages, 10 connections.

## Running (3 terminals)

```bash
# Terminal 1 — ML service
cd ml && python main.py             # http://localhost:8000

# Terminal 2 — Backend
npm run dev:backend                 # http://localhost:5000

# Terminal 3 — Frontend
npm run dev:frontend                # http://localhost:3000
```

When everything is up the ML logs will show:

```
[bert] loaded fine-tuned model from .../models/bert/saved
[xgb] loaded trained model from .../models/xgboost/saved/xgb.json
[gs]  loaded trained model from .../models/graphsage/saved/model.pt    # (if torch_geometric installed)
```

## How the Spam Detection Pipeline Works

```
client → POST /api/posts | /api/messages → Express route
                                          ├─ gather behavioral context (account age, post frequency, …)
                                          ├─ POST <ML_SERVICE_URL>/predict ──▶ FastAPI
                                          │   ◀── { is_spam, score, label, reasons, per-model breakdown }
                                          ├─ persist content with flagged / spamScore / moderationStatus
                                          └─ insert Detection record (audit log + moderation queue source)
```

Visit `/moderation` for the admin queue, per-model score visualisation, and a live tester widget. Flagged posts and messages render with a red ring + spam-score badge in the regular feed/chat too. See [`backend/docs/spam-pipeline.md`](./backend/docs/spam-pipeline.md) and [`ml/docs/architecture.md`](./ml/docs/architecture.md) for details.

## Key Pages

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/login`, `/signup` | Auth (currently mocked — no password persistence yet) |
| `/home` | Feed with posts, post-creation runs through spam detector |
| `/chat` | DMs, polls every 5s, every send runs through spam detector |
| `/discussion` | Discussion forum |
| `/moderation` | Admin queue + live ML tester |
| `/profile/[id]` | User profile |
| `/leaderboard` | Points-based leaderboard |
| `/college-dashboard` | College admin dashboard |

## Key API Endpoints

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET / POST / PUT | `/api/users` | CRUD |
| GET / POST | `/api/posts` | POST runs spam detector; GET hides removed |
| PUT | `/api/posts/:id/like`, `POST /api/posts/:id/comment` | |
| GET / POST | `/api/messages`, `/api/messages/:userId`, `/api/messages/:userId/:otherId` | POST runs spam detector |
| GET / POST | `/api/discussions`, `/api/discussions/:id`, `/api/discussions/:id/reply` | |
| GET / POST | `/api/events`, `/api/connections`, `/api/leaderboard`, `/api/colleges` | |
| GET | `/api/moderation`, `/api/moderation/stats` | Admin queue + counters |
| POST | `/api/moderation/classify` | Ad-hoc text classification (used by tester widget) |
| PUT | `/api/moderation/:id` | `{ decision: 'approve' \| 'remove', reviewerId }` |

## Role Switcher

A sticky role switcher at the top of in-app pages lets you flip the active identity (Student / Alumni / College) without auth. On boot the frontend hydrates the mock identities to the first seeded student (Aryan Singh) and first seeded alumni (Mohit Singh) so backend writes go against real Mongo ObjectIds.

## Development Status

- ✅ Frontend, backend, ML service all running end-to-end
- ✅ Spam detection pipeline live across `/home` and `/chat`
- ✅ BERT (99.1%) and XGBoost (98.3%) trained on SMS Spam Collection
- ⚠️ GraphSAGE trained on a synthetic graph (replace with real interaction data later)
- 🔜 Real auth (bcrypt + JWT)
- 🔜 Discussion ↔ backend wiring (currently uses mock data)
- 🔜 Profile editing + resume upload

See [`Bridgix.md`](./Bridgix.md) for the full project narrative.
