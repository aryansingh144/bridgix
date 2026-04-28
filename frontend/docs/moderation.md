# Moderation UI

User-facing surface of the spam detection pipeline.

## Pages & components touched

| Path                                  | What it does                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------- |
| `app/moderation/page.js`              | Admin queue + live tester widget                                                              |
| `components/PostCard.js`              | Shows a "Flagged · N% spam" badge on posts while `moderationStatus !== 'approved'`           |
| `components/Navbar.js` (`AppNavbar`)  | Adds the Moderation link to the in-app nav                                                    |

## `/moderation` page

Three regions:

1. **Stat cards** — counters from `GET /api/moderation/stats` (Pending, Approved, Removed, Total).
2. **Queue** — tabbed list (`pending` / `approved` / `removed` / `all`) backed by `GET /api/moderation`. Each card shows the content text, per-model scores (BERT / GraphSAGE / XGBoost), reasons returned by the detector, and Approve / Remove buttons for pending items. Decisions hit `PUT /api/moderation/:id`.
3. **Tester widget** — paste any text, hit *Classify*, see the verdict + per-model breakdown without persisting any content. Hits `POST /api/moderation/classify`.

## Visual contract

- Spam score rendered as a 0–100 number; turns red at ≥ 50%.
- Per-model bars use the project's component-color palette: BERT `#6C63FF`, GraphSAGE `#2BC0B4`, XGBoost `#FF8C42`.
- Reasons (e.g. *"matched 3 spam keyword(s)"*, *"very new account"*) come straight from the detector and are shown as red pills — these are what the demo / report defense leans on to explain *why* the model decided.

## Auth note

There is no role-gate yet (auth is mocked). Once real roles ship, gate `/moderation` to `admin` users and consider hiding the nav entry for everyone else.
