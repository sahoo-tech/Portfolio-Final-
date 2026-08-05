# Cyberpunk Contact Terminal — Backend

Node.js + Express backend for the portfolio's AI Communication Terminal contact form.

## Features

- ✅ **Express** REST API — single `POST /api/contact` endpoint
- ✅ **Rate Limiting** — 5 requests per IP per 15 minutes
- ✅ **Input Validation & Sanitization** — `express-validator`
- ✅ **Two HTML Emails** — owner notification + sender confirmation
- ✅ **Cyberpunk-styled HTML emails** — compatible with major email clients
- ✅ **Unique Transmission ID** per submission
- ✅ **Console logging** — every submission logged server-side
- ✅ **Health check** endpoint — `GET /health`
- ✅ **CORS** configured for your portfolio origin
- ✅ **No database** — stateless, data is never stored

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `SMTP_USER` | Your Gmail address |
| `SMTP_PASS` | Gmail **App Password** (not your login password) |
| `OWNER_EMAIL` | Email address to receive new contact messages |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs allowed by CORS |

> **How to get a Gmail App Password:**  
> Google Account → Security → 2-Step Verification → App Passwords → Create  
> See: https://support.google.com/accounts/answer/185833

### 3. Run the backend

Development (auto-restart on changes):
```bash
npm run dev
```

Production:
```bash
npm start
```

---

## API

### `POST /api/contact`

**Request body (JSON):**
```json
{
  "txId":         "TX-LK3MQ-8ZXF",
  "name":         "John Doe",
  "email":        "john@example.com",
  "organization": "Acme Corp",
  "category":     "Job Opportunity",
  "subject":      "Senior Developer Role",
  "message":      "Hi Sayantan, I'd like to discuss..."
}
```

**Success response:**
```json
{ "success": true, "txId": "TX-LK3MQ-8ZXF" }
```

**Error responses:**
- `422` — Validation failed
- `429` — Rate limit exceeded
- `500` — Email dispatch failed

### `GET /health`
```json
{ "status": "ONLINE", "timestamp": "2026-08-01T16:00:00.000Z" }
```

---

## Frontend Integration

The frontend (`app.js`) already calls this backend at:
```
http://localhost:5000/api/contact
```

For production, update `app.js` to use your deployed backend URL — search for `fetch('http://localhost:5000/api/contact'` and replace with your server URL.

---

## Deployment

You can deploy this backend on:
- **Render** (free tier) — push to GitHub → connect repo → set env vars
- **Railway** — `railway up`
- **Heroku** — `git push heroku main`
- **VPS / DigitalOcean** — run with `pm2 start server.js`

Remember to set all `.env` variables in your hosting platform's environment settings.
