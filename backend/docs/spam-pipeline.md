# Spam Detection Pipeline (Backend)

How user-generated content flows through the AI moderation layer before becoming visible on the platform.

## Flow

```
client ──POST /api/posts | /api/messages──▶ Express route
                                           │
                                           ├─ gather behavioral context
                                           │     · account age (User.createdAt)
                                           │     · posts/messages in last hour & day
                                           │     · duplicate count (messages)
                                           │     · message length
                                           │
                                           ├─ POST <ML_SERVICE_URL>/predict ──▶ FastAPI (ml/)
                                           │   ◀── { is_spam, score, label, reasons, … }
                                           │
                                           ├─ persist content with:
                                           │     · flagged          = is_spam
                                           │     · spamScore        = score
                                           │     · moderationStatus = 'pending' | 'clean'
                                           │
                                           ├─ insert Detection log (audit trail + queue source)
                                           │
                                           └─ respond { content, moderation }
```

If the ML service is unreachable the helper **fails open** by default (`ML_FAIL_OPEN=true`) — content saves as `clean` and the detection log is skipped. Set `ML_FAIL_OPEN=false` to fail closed (request returns 500).

## Schemas added

**`Post`, `Message`** — gain three fields:

| Field              | Type                                       | Default |
| ------------------ | ------------------------------------------ | ------- |
| `flagged`          | Boolean                                    | false   |
| `spamScore`        | Number `[0..1]`                            | 0       |
| `moderationStatus` | `'clean'\|'pending'\|'approved'\|'removed'` | clean   |

**`Detection`** — new collection. One record per classification (the ERD's "Spam Detection Entity"):

```
{ contentType, contentId, author, text,
  score, label, bertScore, graphsageScore, xgboostScore, reasons,
  status, reviewedBy, reviewedAt, createdAt }
```

`status` mirrors content lifecycle: `pending` (flagged, awaiting review) → `approved` or `removed`.

## Endpoints

### Existing routes — behavior changed

- `POST /api/posts` — now classifies before save, returns `{ post, moderation }`.
- `POST /api/messages` — same, returns `{ message, moderation }`.
- `GET /api/posts` — excludes `moderationStatus: 'removed'` by default. Pass `?includeRemoved=true` to include them.

### New `/api/moderation`

| Method | Path                | Purpose                                            |
| ------ | ------------------- | -------------------------------------------------- |
| GET    | `/`                 | Queue. `?status=pending\|approved\|removed\|all`    |
| GET    | `/stats`            | Counters for dashboard widgets                     |
| POST   | `/classify`         | Run text through detector ad-hoc (admin/test tool) |
| PUT    | `/:id`              | `{ decision: 'approve'\|'remove', reviewerId }`     |

`PUT /:id` updates both the `Detection` record and the underlying content's `moderationStatus`.

## Environment

`backend/.env`:

```
ML_SERVICE_URL=http://localhost:8000
ML_TIMEOUT_MS=4000
ML_FAIL_OPEN=true
```
