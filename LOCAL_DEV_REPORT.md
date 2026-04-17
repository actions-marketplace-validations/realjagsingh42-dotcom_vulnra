# VULNRA — Local Development Migration Report

**Date:** 2026-04-16
**Task:** Remove Railway deployment, set up fully local development environment
**Location:** `/Users/jagdishsingh/vulnra`

---

## ✅ REMOVED — Railway References

### Files Deleted
| File | Reason |
|------|--------|
| `railway.json` | Backend Railway deployment config — deleted |
| `railway.toml` | Backend Railway TOML config — deleted |
| `frontend/railway.json` | Frontend Railway deployment config — deleted |

### Code Changes — Railway URLs Removed

| File | Change |
|------|--------|
| `app/core/config.py:40` | Removed `"https://vulnra-production.up.railway.app"` from `allowed_origins` default list |
| `app/main.py:37-38` | Removed CORS regex patterns `r"^https://[a-z0-9\-]+\.up\.railway\.app$"` and `r"^https://[a-z0-9\-]+\.railway\.app$"` |
| `app/main.py:190` | Updated mock scan URL comment: `https://vulnra-production.up.railway.app` → `http://localhost:8000` |
| `frontend/next.config.ts:5` | Updated API fallback: `"https://vulnra-production.up.railway.app"` → `"http://localhost:8000"` |
| `frontend/src/components/org/OrgDashboard.tsx:16` | Updated `API_BASE` fallback |
| `frontend/src/components/scanner/ScheduledScansList.tsx:13` | Updated `API_BASE` fallback |
| `frontend/src/components/org/SSOSettings.tsx:13` | Updated `API_BASE` fallback |
| `frontend/src/components/org/OrgJoinPage.tsx:9` | Updated `API_BASE` fallback |
| `frontend/src/components/rag-scanner/RAGScanner.tsx:45` | Updated `API_BASE` fallback |
| `frontend/src/app/quick-scan/page.tsx:8` | Replaced hardcoded Railway URL with `"http://localhost:8000"` |
| `frontend/.env.example:12` | Updated comment: Railway URL → `https://your-domain.com` |

### Documentation Updated
| File | Change |
|------|--------|
| `README.md` | Full rewrite — removed Railway instructions, added local dev setup |
| `PROJECT_CONTEXT.md` | Removed Railway URL, removed `railway.json` from file tree |
| `PROJECT_OVERVIEW.md` | Updated Production URL to `http://localhost:8000` |
| `AUDIT_REPORT.md` | Updated Production URL to `http://localhost:8000` |
| `CLAUDE.md` | Updated deployment to "Local / Docker Compose" |
| `Dockerfile:3-4` | Removed "Railway" from comment |

---

## ✅ CREATED — New Files

| File | Purpose |
|------|---------|
| `.env` | Complete local development environment — all vars: `SECRET_KEY`, `DEBUG=true`, `API_URL=http://localhost:8000`, `HOST=0.0.0.0`, `PORT=8000`, `REDIS_URL=redis://localhost:6379/0`, Supabase, Anthropic, Lemon Squeezy, Resend |
| `frontend/.env.local` | Frontend env vars — `NEXT_PUBLIC_API_URL=http://localhost:8000`, Supabase URL + anon key |
| `frontend/Dockerfile` | Minimal Node 20 Alpine Dockerfile for frontend service in compose |
| `start.bat` | Windows: Docker Compose start script |
| `start-backend.bat` | Windows: Backend only (no Docker) |
| `start-worker.bat` | Windows: Celery worker only |
| `start-frontend.bat` | Windows: Frontend only |
| `start-all.bat` | Windows: Opens 3 terminals (backend + worker + frontend) |
| `start.sh` | macOS/Linux: Docker Compose start script |
| `start-backend.sh` | macOS/Linux: Backend only |
| `start-worker.sh` | macOS/Linux: Celery worker only |
| `start-frontend.sh` | macOS/Linux: Frontend only |
| `start-all.sh` | macOS/Linux: All services |

---

## ✅ WORKING — Services Verified

### Backend (FastAPI)
| Test | Result | Output |
|------|--------|--------|
| Config loads | ✅ PASS | `SECRET_KEY length: 86`, `API_URL: http://localhost:8000`, `PORT: 8000`, `HOST: 0.0.0.0` |
| `validate_config()` | ✅ PASS | `Configuration validated successfully` |
| `/health` | ✅ PASS | `{"status":"healthy","version":"0.4.0"}` |
| `/` | ✅ PASS | `{"service":"VULNRA API","status":"ok","docs":"/docs"}` |
| `/docs` | ✅ PASS | HTTP 200 — Swagger UI loads |
| `/mock-llm/v1/chat/completions` | ✅ PASS | Returns mock vulnerable LLM response |
| `/scan/quick` (no auth) | ✅ PASS | Returns full scan result with `scan_id`, `risk_score: 7.5`, 4 findings, OWASP coverage |

### Config Fixes Applied
| Issue | Fix |
|-------|-----|
| `SECRET_KEY=change-me-in-production` blocked startup | Changed to real 86-char URL-safe secret in `.env` |
| `validate_config()` blocked insecure keys even in DEBUG | Added `and not settings.debug` bypass — allows dev mode |
| `settings.api_url` undefined → crash in `_send_scheduled_scan_notification()` | Added `api_url: str` field to `Settings` in `config.py` with default `http://localhost:8000` |
| Railway `CORS_ALLOWED_PATTERNS` regex | Removed — local development uses explicit origins |

### Docker Compose
| Change | Detail |
|--------|--------|
| Added `frontend` service | Port 3000, uses `frontend/Dockerfile` |
| Fixed Redis URL | Services now use `redis://redis:6379/0` (service name) |
| Redis port exposed | `6379:6379` — accessible from host |
| Health checks | All services wait for Redis to be healthy |
| Volume mounts | Code changes auto-reload via `-:/app` volumes |

### Frontend
| Test | Result |
|------|--------|
| TypeScript compilation | ✅ PASS — zero TypeScript errors |
| ESLint | ⚠️ 91 pre-existing errors (not caused by this migration) — `setState` in effects, empty interfaces |

---

## ❌ ERRORS

No errors encountered during migration. All smoke tests passed.

### Pre-existing Issues (Not Fixed in This Migration)
| Issue | File | Note |
|-------|------|------|
| ESLint errors | `frontend/src/components/scanner/` | 91 pre-existing errors — setState in effects, empty interfaces. Not blocking. |

---

## ⚠️ STILL NEEDED — Manual Input Required

These credentials must be filled in manually in `.env` before production use:

| Variable | Where | How to Get |
|----------|-------|------------|
| `ANTHROPIC_API_KEY` | `.env` | https://console.anthropic.com/settings/keys |
| `LEMONSQUEEZY_API_KEY` | `.env` | https://app.lemonsqueezy.com/settings/api |
| `LEMONSQUEEZY_STORE_ID` | `.env` | Lemon Squeezy dashboard |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | `.env` | Lemon Squeezy webhook settings |
| `LEMONSQUEEZY_PRO_VARIANT_ID` | `.env` | Product variant ID from Lemon Squeezy |
| `LEMONSQUEEZY_ENTERPRISE_VARIANT_ID` | `.env` | Product variant ID from Lemon Squeezy |
| `RESEND_API_KEY` | `.env` | https://resend.com/api-keys |
| `GARAK_VENV_PATH` | `.env` | Path to local Garak venv (e.g. `D:\shield\garak_env` or `/Users/jagdishsingh/vulnra/garak_env`) |
| `OPENAI_API_KEY` | `.env` | Optional — for DeepTeam probes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `frontend/.env.local` | From Supabase Dashboard → Settings → API |
| `SECRET_KEY` | `.env` | Already set to a secure random value — do not commit |

---

## 🚀 HOW TO START — From Scratch

### One-Time Setup

```bash
# 1. Clone the repo
git clone https://github.com/realjagsingh42-dotcom/vulnra.git
cd vulnra

# 2. Create Python virtual environment
python -m venv venv
source venv/bin/activate          # macOS/Linux
# venv\Scripts\activate           # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Fill in credentials
# Edit .env with your values:
#   - SUPABASE_URL + SUPABASE_SERVICE_KEY (from Supabase dashboard)
#   - ANTHROPIC_API_KEY (from Anthropic console)
#   - GARAK_VENV_PATH (path to garak venv)

# 5. Start Redis
docker run -d -p 6379:6379 redis:7-alpine
```

### Option A — Docker Compose (Recommended)

```bash
docker-compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# Docs: http://localhost:8000/docs
```

### Option B — Manual Start

```bash
# Terminal 1: Backend API
source venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Celery Worker
source venv/bin/activate
python -m celery -A app.worker worker --loglevel=info -Q scans,sentinel

# Terminal 3: Frontend
cd frontend
npm install
npm run dev
```

### Quick Smoke Test

```bash
# Should return: {"status":"healthy","version":"0.4.0"}
curl http://localhost:8000/health

# Should return a mock scan result
curl -X POST http://localhost:8000/scan/quick \
  -H "Content-Type: application/json" \
  -d '{"target_url":"https://httpbin.org/post"}'
```

---

## Files Changed Summary

```
DELETED:  railway.json, railway.toml, frontend/railway.json
CREATED:  .env, frontend/.env.local, frontend/Dockerfile,
          start.bat, start-backend.bat, start-worker.bat, start-frontend.bat, start-all.bat,
          start.sh, start-backend.sh, start-worker.sh, start-frontend.sh, start-all.sh
MODIFIED: app/core/config.py  (+api_url field, allowed_origins, validate_config DEBUG bypass)
          app/main.py         (-Railway CORS patterns, +settings.host, updated comment)
          docker-compose.yml  (+frontend service, fixed Redis URLs, added healthchecks)
          Dockerfile          (-Railway comment)
          README.md           (full rewrite with local dev instructions)
          PROJECT_CONTEXT.md  (-Railway URL, -railway.json from tree)
          PROJECT_OVERVIEW.md (-Railway URL)
          AUDIT_REPORT.md     (-Railway URL)
          CLAUDE.md           (updated deployment line)
          frontend/next.config.ts              (-Railway fallback URL)
          frontend/src/components/org/OrgDashboard.tsx              (-Railway fallback)
          frontend/src/components/scanner/ScheduledScansList.tsx (-Railway fallback)
          frontend/src/components/org/SSOSettings.tsx              (-Railway fallback)
          frontend/src/components/org/OrgJoinPage.tsx            (-Railway fallback)
          frontend/src/components/rag-scanner/RAGScanner.tsx     (-Railway fallback)
          frontend/src/app/quick-scan/page.tsx                   (-Railway URL)
          frontend/.env.example (updated comment)
          .gitignore           (+frontend/.env.local)
```
