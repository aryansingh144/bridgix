# Bridgix — AI-Enhanced Alumni–Student Networking Platform

Full-stack platform connecting alumni and students for mentorship, placement assistance, and career guidance, with an **AI-driven hybrid spam-detection layer (BERT + GraphSAGE + XGBoost)** moderating every piece of user-generated content.

## Stack

| Layer | Tech |
| --- | --- |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, Redux Toolkit, Chart.js, Axios |
| **Backend** | Express.js, MongoDB Atlas, Mongoose, bcryptjs + JWT |
| **ML service** | FastAPI (Python), HuggingFace Transformers, PyTorch, XGBoost, PyTorch Geometric |
| **Models** | `bert-base-uncased` (fine-tuned on SMS Spam, 99.1% acc), XGBoost (98.3% acc), GraphSAGE (synthetic graph) |

## Repo Layout

```
bridgix/
├── backend/                Express API + Mongoose models
│   ├── models/             User, Post, Message, Discussion, Connection, Event, College, Detection
│   ├── routes/             auth, users, posts, messages, discussions, connections,
│   │                       events, leaderboard, colleges, stats, moderation
│   ├── services/
│   │   ├── auth.js              bcrypt + JWT helpers
│   │   └── spamClient.js        Calls the FastAPI ML service before persisting content
│   ├── middleware/auth.js       requireAuth / optionalAuth Bearer-token guard
│   ├── server.js
│   ├── seed.js                  Seeds users / college / posts / discussions / messages / connections
│   └── docs/spam-pipeline.md
├── frontend/               Next.js 14 app
│   ├── app/                pages (App Router) — home, chat, discussion, moderation,
│   │                       profile, leaderboard, college-dashboard, login, signup, …
│   ├── components/         Navbar, Sidebar, PostCard, UserCard, ReduxProvider, …
│   ├── lib/api.js          Axios instance with Bearer interceptor
│   ├── store/              Redux slices (user, app)
│   └── docs/moderation.md
└── ml/                     FastAPI spam-detection microservice
    ├── main.py             HTTP layer (POST /predict, GET /health)
    ├── ensemble.py         HybridSpamDetector (BERT · GraphSAGE · XGBoost weighted)
    ├── config.py / schemas.py
    ├── models/
    │   ├── bert/{predictor.py, saved/}
    │   ├── graphsage/{predictor.py, saved/}
    │   └── xgboost/{predictor.py, saved/}
    ├── training/           Colab-runnable scripts (train_bert.py, train_xgboost.py, train_graphsage.py)
    └── docs/{architecture.md, training.md}
```

## Prerequisites

- Node.js ≥ 18 (npm 9+)
- Python ≥ 3.10 (for the ML service)
- A MongoDB Atlas cluster (free M0 tier works) or local MongoDB on `:27017`

## First-time Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd bridgix

# Install backend + frontend deps in one go
npm run install:all

# Install ML service deps (FastAPI + inference libs)
cd ml
python -m venv .venv             # optional but recommended
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Configure environments

Create three env files (sample values shown — replace `MONGODB_URI` with your Atlas string):

**`backend/.env`:**
```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/bridgix?retryWrites=true&w=majority

# Auth
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d

# Spam detection microservice (ml/)
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
cd ..
```

Creates 9 users (4 students + 4 alumni + 1 college admin), 1 college, 3 events, 10 posts, 6 discussions, 20 messages, 10 connections.

All seeded accounts share the password **`password123`**. Try:
- `aryan.singh@example.com` (student)
- `mohit.singh@example.com` (alumni)
- `admin@iitd.ac.in` (college admin → lands on `/college-dashboard`)

## Running the app (3 terminals)

You need three processes running locally. Open three terminals from the repo root:

```bash
# Terminal 1 — ML service (FastAPI on :8000)
cd ml
python main.py

# Terminal 2 — Backend (Express on :5000)
npm run dev:backend

# Terminal 3 — Frontend (Next.js on :3000)
npm run dev:frontend
```

Open `http://localhost:3000` and sign in with one of the demo accounts above.

### Common issues

- **`EADDRINUSE :::5000`** — A previous backend is still bound. Kill it:
  - Windows (PowerShell): `Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`
  - macOS/Linux: `lsof -ti:5000 | xargs kill -9`
- **MongoDB connection error** — Verify `MONGODB_URI` is correct and your IP is whitelisted in Atlas (Network Access → Add IP).
- **ML service unreachable** — `ML_FAIL_OPEN=true` lets the backend persist content uncensored when the ML service is down. Toggle to `false` once you require the gate.
- **GraphSAGE not loaded** — Expected if `torch_geometric` isn't installed; the predictor falls back to a heuristic stub. Install `torch-geometric` if you want the trained head.
- **Login bounces back to `/login`** — A stale token from a previous session got cleared by an in-flight `/me` request. Open DevTools → Application → Storage → "Clear site data" once, then log in fresh.

When everything is up the ML logs will show:

```
[bert] loaded fine-tuned model from .../models/bert/saved
[xgb] loaded trained model from .../models/xgboost/saved/xgb.json
[gs]  loaded trained model from .../models/graphsage/saved/model.pt    # (if torch_geometric installed)
```

## How the Spam Detection Pipeline Works

```
client → POST /api/posts | /api/messages | /api/discussions → Express route
                                                ├─ gather behavioral context (account age, post frequency, …)
                                                ├─ POST <ML_SERVICE_URL>/predict ──▶ FastAPI
                                                │   ◀── { is_spam, score, label, reasons, per-model breakdown }
                                                ├─ persist content with flagged / spamScore / moderationStatus
                                                └─ insert Detection record (audit log + moderation queue source)
```

Visit `/moderation` for the admin queue, per-model score visualisation, and a live tester widget. Flagged posts, messages, and discussions render with a red ring + spam-score badge in the regular feed/chat too. See [`backend/docs/spam-pipeline.md`](./backend/docs/spam-pipeline.md) and [`ml/docs/architecture.md`](./ml/docs/architecture.md) for details.

Spam-flagged content does **not** earn leaderboard points — only clean contributions are rewarded.

## Key Pages

| Route | Description |
| --- | --- |
| `/` | Landing page |
| `/login`, `/signup` | Real auth (bcrypt + JWT). College users are routed to `/college-dashboard` after login. |
| `/college-login` | Dedicated entry-point for college admins (same auth as `/login`, with a college-only landing page). |
| `/home` | Feed with posts, post-creation runs through the spam detector. Tabs: Feed / Placement / Academic / Webinar. |
| `/chat` | Direct messaging, polls every 5 s. Every send runs through the spam detector. People list filterable by role. |
| `/discussion` | Discussion forum — every new thread + reply gated by the spam detector. |
| `/moderation` | Admin queue + live ML tester widget (BERT / GraphSAGE / XGBoost score bars). |
| `/profile/[id]` | User profile with About / Posts / Connections tabs. Editable when viewing your own. Connect / Pending / Connected state machine on others' profiles. |
| `/leaderboard` | Points ranking driven by real activity (posts +5, comments +2, discussions +5, replies +2). |
| `/college-dashboard` | College admin dashboard — pulls real stats, events, and top contributors from the DB. |

## Key API Endpoints

| Method | Endpoint | Notes |
| --- | --- | --- |
| POST / GET | `/api/auth/signup`, `/api/auth/login`, `/api/auth/me` | JWT issued on signup/login, `/me` requires `Authorization: Bearer <token>` |
| GET / POST / PUT | `/api/users` | CRUD; PUT updates the editable profile fields |
| GET / POST | `/api/posts` | POST runs spam detector; GET hides removed; awards `+5 pts` on clean posts |
| PUT / POST | `/api/posts/:id/like`, `/api/posts/:id/comment` | `+2 pts` on each clean comment |
| GET / POST | `/api/messages`, `/api/messages/:userId`, `/api/messages/:userId/:otherId` | POST runs spam detector |
| GET / POST | `/api/discussions`, `/api/discussions/:id`, `/api/discussions/:id/reply` | Both create paths run the spam detector; `+5` on threads, `+2` on replies |
| GET / POST / PUT | `/api/connections`, `/api/connections/:userId` | Validates ObjectIds; status flow `pending → accepted / declined` |
| GET / POST | `/api/events`, `/api/events/:id` | |
| PUT | `/api/events/:id/register` | Real attendee persistence (used by the Webinar tab) |
| GET | `/api/leaderboard` | Returns ranked students + alumni by `points`, with role + college |
| GET / POST / PUT | `/api/colleges`, `/api/colleges/:id` | |
| GET | `/api/stats` | Aggregate counters (students, alumni, connections, posts, events, discussions) used by the college dashboard |
| GET | `/api/moderation`, `/api/moderation/stats` | Admin queue + counters (pending / approved / removed / total) |
| POST | `/api/moderation/classify` | Ad-hoc text classification (used by the live tester widget) |
| PUT | `/api/moderation/:id` | `{ decision: 'approve' \| 'remove', reviewerId }` |

## Roles & Flows

- **Student / Alumni** — sign up via `/signup`, log in via `/login`, lands on `/home`. Can post, chat, discuss, send connection requests, register for webinars, and earn leaderboard points.
- **College admin** — log in via `/college-login` (or `/login`), automatically redirected to `/college-dashboard`. Their navbar swaps to *Dashboard / Moderation / Leaderboard / Discussion* — no chat or feed clutter, since the role exists for oversight rather than peer networking. Connect/Message buttons are hidden between college accounts and other users.

## Connection Requests

- Click **+ Connect** on any profile → `POST /api/connections` with `status: 'pending'`.
- The recipient sees the request live in the navbar's bell icon (polled every 15 s) with **Accept** / **Decline** buttons.
- After accept → both profiles flip to **✓ Connected** and the new contact appears in each user's Connections tab.

## Development Status

- ✅ Frontend, backend, ML service all running end-to-end
- ✅ Spam detection pipeline live across `/home`, `/chat`, and `/discussion`
- ✅ BERT (99.1%) and XGBoost (98.3%) trained on SMS Spam Collection
- ✅ Real auth (bcrypt + JWT) with role-aware redirect (college → dashboard)
- ✅ Discussion forum wired to backend with moderation banner
- ✅ Profile editing via PUT `/api/users/:id`
- ✅ Profile *Posts* tab pulls each user's real authored posts
- ✅ Connection request flow (Connect → Pending → Accept/Decline) with live notifications
- ✅ College dashboard pulls real platform stats, events, and top contributors
- ✅ Leaderboard reactive — points auto-increment on non-spam posts (+5), discussions (+5), comments / replies (+2)
- ✅ Webinar registration persists real attendees via `PUT /api/events/:id/register`
- ⚠️ GraphSAGE trained on a synthetic graph (replace with real interaction data later)
- 🔜 Resume upload (multer + storage)
