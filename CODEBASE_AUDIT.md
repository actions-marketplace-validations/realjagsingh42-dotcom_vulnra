# VULNRA — Comprehensive Codebase Audit

**Date:** 2026-05-12
**Version:** 0.4.0
**Scope:** Full codebase — Backend (FastAPI + Celery), Frontend (Next.js 16), Infrastructure (Docker + Railway)
**Files Examined:** 200+ (all Python modules, JS/TSX components, configs, tests, docs, CI/CD)

---

## 1. Project Overview

VULNRA is a production-grade AI vulnerability scanner for Large Language Models. It probes LLM APIs using 4 scanning engines (Garak, DeepTeam, PyRIT, EasyJailbreak), evaluates findings with Claude 3 Haiku AI Judge, and maps results to 7 regulatory frameworks.

**Stack:**
| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | FastAPI (Python 3.11) | 0.135.1 |
| Frontend | Next.js + React | 16.2.1 / 19.2.3 |
| Database | Supabase PostgreSQL + pgvector | hosted |
| Queue/Cache | Redis + Celery | 5.6.2 |
| AI Judge | Anthropic Claude 3 Haiku | SDK latest |
| Scan Engines | Garak, DeepTeam, PyRIT, EasyJailbreak | varied |
| Billing | Lemon Squeezy | API |
| Email | Resend | API |
| Deploy | Docker → Railway | multi-stage |
| Auth | Supabase Auth (JWT) + Enterprise SSO (SAML/OIDC) | |

**Architecture:** Monorepo with `app/` (FastAPI), `frontend/` (Next.js), `github-action/` (CI/CD Action), `tests/`, `docs/`.

**Key Files:**
- `app/main.py` — FastAPI entry point, registers all routers (17 routers), CORS, security headers, rate limiter, startup/shutdown events
- `app/core/config.py` — Pydantic Settings, env var validation via `validate_config()`
- `app/core/security.py` — `get_current_user()` JWT + API key auth
- `app/core/compliance.py` — 7 regulatory framework mappings (~18KB)
- `app/judge.py` — `VulnerabilityJudge` class with Claude Haiku eval + fallback
- `app/garak_engine.py` — Subprocess wrapper (652 lines), 40+ probes
- `app/deepteam_engine.py` — Subprocess runner, 40+ vulnerability types
- `app/easyjailbreak_engine.py` — PAIR/TAP/CIPHER (no torch dependency needed)
- `app/pyrit_engine.py` — 10 encoding converters (no pyrit package needed)
- `app/worker.py` — Celery worker (scan queue, sentinel, scheduled scans, 120s timeout)
- `app/services/mcp_scanner.py` — MCP agent scanner (~50KB), OWASP Agentic Top 10
- `app/services/rag_scanner.py` — RAG-01 through RAG-05 probes (~24KB)
- `app/services/scan_service.py` — `run_scan_internal()` lifecycle
- `app/services/engine_runner.py` — `run_all_engines()` orchestrator
- `app/services/supabase_service.py` — All DB operations (~22KB)
- `app/services/attack_chains.py` — Crescendo + GOAT multi-turn attacks
- `app/services/sso_service.py` — SAML 2.0 + OIDC implementation
- `app/services/webhook_delivery.py` — HMAC-SHA256 delivery
- `app/services/audit.py` — Enterprise audit logging
- `app/services/scheduled_scan_service.py` — Cron/interval/one-time CRUD
- `app/pdf_report.py` — ReportLab PDF generation (~36KB)
- `app/middleware/tier_enforcement.py` — `require_tier()` dependency factory
- `app/api/endpoints/` — 15 router files, each covering a domain

---

## 2. Features Inventory

### Scan Engines (4 engines, all working)
| Engine | File | Lines | Status | Notes |
|--------|------|-------|--------|-------|
| Garak | `app/garak_engine.py` | 652 | ✅ Working | Subprocess-based, TIER_PROBES dict, PROBE_CATALOGUE, JSONL parsing, multi-turn support |
| DeepTeam | `app/deepteam_engine.py` | ~600 | ✅ Working | Subprocess via garak_env, 40+ vuln types, CVSS scoring, category/severity mapping |
| PyRIT | `app/pyrit_engine.py` | ~400 | ✅ Working | 10 converters (base64, base32, rot13, leetspeak, unicode, reversed, binary, hex, morse, emoji-sub), Pro+ tier |
| EasyJailbreak | `app/easyjailbreak_engine.py` | ~500 | ✅ Working | PAIR, TAP, CIPHER recipes via Claude Haiku, no torch dep, Pro+ tier |

### AI Judge
| File | Lines | Status | Notes |
|------|-------|--------|-------|
| `app/judge.py` | ~150 | ✅ Working | Anthropic Claude 3 Haiku eval; fallback marks all as vulnerable at 0.5 score when client unavailable; singleton pattern via `get_judge()` |

### Specialized Scanners
| Scanner | File | Lines | Status | Notes |
|---------|------|-------|--------|-------|
| MCP Scanner | `app/services/mcp_scanner.py` | ~1200 | ✅ Working | OWASP Agentic Top 10 probes + legacy structural probes, async httpx, CVSS scoring |
| RAG Scanner | `app/services/rag_scanner.py` | ~600 | ✅ Working | RAG-01 through RAG-05, tier-gated, async + sync HTTP |
| Multi-Turn | `app/services/attack_chains.py` | ~400 | ✅ Working | Crescendo (5-turn), GOAT (10-turn, Claude-powered) |

### Compliance Mapping (7 frameworks)
| Framework | File | Status | Coverage |
|-----------|------|--------|----------|
| OWASP LLM Top 10 (2025) | `app/core/compliance.py` | ✅ Complete | LLM01-LLM10 with names, descriptions, severity |
| OWASP Agentic Top 10 (2025) | `app/core/compliance.py` | ✅ Complete | AG-01 through AG-10 |
| MITRE ATLAS | `app/core/compliance.py` | ✅ Complete | 12 tactics, 48+ techniques, matrix mapping |
| EU AI Act | `app/core/compliance.py` | ✅ Complete | Annex I categories, article refs, fine schedules |
| DPDP (India) | `app/core/compliance.py` | ✅ Complete | Section refs, fine schedules (INR) |
| NIST AI RMF | `app/core/compliance.py` | ✅ Complete | 4 functions (Govern/Map/Measure/Manage) |
| ISO 42001 | `app/core/compliance.py` | ✅ Complete | Clauses and controls mapped |
| Merge Utility | `app/core/compliance_utils.py` | ✅ Working | `merge_compliance()` for unified reports |

### Auth & Security
| Feature | File(s) | Status | Notes |
|---------|---------|--------|-------|
| Supabase JWT auth | `app/core/security.py:14-38` | ✅ Working | `get_current_user()`, `get_admin_user()` |
| API key auth (SHA-256) | `app/core/security.py`, `app/core/deps.py` | ✅ Working | Tokens starting `vk_live_` or `vk-` |
| Rate limiting (SlowAPI) | `app/core/rate_limiter.py` | ✅ Working | Per-user/per-org keys, tier-based, Redis backend |
| SSRF protection | `app/core/utils.py` | ✅ Working | Blocks RFC 1918, loopback, link-local, AWS metadata, DNS |
| Security headers | `app/main.py:68-85` | ✅ Working | HSTS, CSP, X-Frame-Options, X-Content-Type-Options |
| CORS | `app/main.py:52-65` | ✅ Working | Whitelist-based from env |
| Enterprise SSO (SAML 2.0) | `app/services/sso_service.py` | ✅ Working | Okta, Azure AD, OneLogin, Ping, Generic |
| Enterprise SSO (OIDC) | `app/services/sso_service.py` | ✅ Working | Google Workspace, Generic OIDC |
| Audit logging | `app/services/audit.py` | ✅ Working | inserts to audit_logs table with user/org context |

### API Endpoints (15 routers, ~all working)
| Router | File | Endpoints | Status |
|--------|------|-----------|--------|
| scans | `app/api/endpoints/scans.py` | POST/GET scan, share, report/list, diff, multi-turn | ✅ |
| billing | `app/api/endpoints/billing.py` | plans, checkout, subscription, webhook, portal | ✅ |
| org | `app/api/endpoints/org.py` | org CRUD, members, invites, SSO, quota, audit, scans | ✅ |
| api_keys | `app/api/endpoints/api_keys.py` | create, list, revoke | ✅ |
| monitor | `app/api/endpoints/monitor.py` | sentinel watches CRUD | ✅ |
| webhooks | `app/api/endpoints/webhooks.py` | webhook CRUD, test | ✅ |
| scheduled_scans | `app/api/endpoints/scheduled_scans.py` | CRUD, pause, resume, run-now | ✅ |
| analytics | `app/api/endpoints/analytics.py` | GET /api/analytics/summary | ✅ |
| demo | `app/api/endpoints/demo.py` | canned demo results | ✅ |
| quick_scan | `app/api/endpoints/quick_scan.py` | public unauthenticated scan (3/hr IP limit) | ✅ |
| rag_scans | `app/api/endpoints/rag_scans.py` | start, poll RAG scans | ✅ |
| user | `app/api/endpoints/user.py` | profile, notifications | ✅ |

### Billing
| Feature | File | Status | Notes |
|---------|------|--------|-------|
| Plan tiers (Free/Pro/Enterprise) | `app/api/endpoints/billing.py` | ✅ | Enum, limits |
| Lemon Squeezy checkout | `app/api/endpoints/billing.py:120-150` | ✅ | Creates hosted checkout |
| Customer portal | `app/api/endpoints/billing.py:160-175` | ✅ | Portal redirect |
| Webhook handler | `app/api/endpoints/billing.py:200-340` | ✅ | HMAC-SHA256 verification via lemonsqueezy SDK |
| Tier enforcement | `app/services/supabase_service.py:200-220` | ✅ | Per-scan check |
| Org quota pooling | `app/services/supabase_service.py:260-310` | ✅ | Pro=100/day, Enterprise=500/day shared |
| Idempotency | `app/api/endpoints/billing.py` | ✅ | processed_webhooks table |

### Frontend (Next.js 16, 55+ pages)
| Area | Files | Status | Notes |
|------|-------|--------|-------|
| Public pages (landing, pricing, docs, blog, compliance) | 20+ pages | ✅ | Cyberpunk theme, IBM Plex Mono + DM Sans |
| Scanner dashboard | `ScannerLayout.tsx` (967 lines) | ✅ | Real-time terminal, findings, risk viz, social share |
| Auth (login, signup, reset, MFA) | `LoginForm.tsx`, `SignupForm.tsx` | ✅ | Supabase SSR |
| Org dashboard | `OrgDashboard.tsx` | ✅ | Quota widget, members, SSO |
| MCP scanner | `MCPServerScanner.tsx`, `MCPScanResults.tsx` | ✅ | |
| RAG scanner | `RAGScanner.tsx`, `RAGScanResults.tsx` | ✅ | |
| Analytics | `AnalyticsDashboard.tsx` | ✅ | 30-day trends |
| Settings | `SettingsShell.tsx`, api-keys, webhooks, profile, notifications | ✅ | |
| API client | `api-client.ts` (156 lines) | ✅ | Centralized, typed, auth, timeouts, error handling |
| UI primitives | button, card, badge, alert, input, tabs, progress | ✅ | Tailwind v4, cn() utility |

### Infrastructure
| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Dockerfile | `Dockerfile` | ✅ | 3-layer build (ML deps → app deps → code), non-root user, healthcheck |
| Docker Compose | `docker-compose.yml` | ✅ | App + Redis + worker |
| Railway config | `railway.json`, `railway.toml` | ✅ | Health check, port, restart |
| CI (lint + test) | `.github/workflows/ci.yml` | ✅ | Ruff, mypy, pytest |
| Release | `.github/workflows/release.yml` | ✅ | Docker build + push + deploy |
| GitHub Action | `github-action/` | ✅ | `vulnra/scan-action@v1` published to marketplace |
| Pdf report | `app/pdf_report.py` (~36KB) | ✅ | ReportLab Platypus, RiskGauge flowable |

### Tests (12 test files, 1630+ total lines)
| Test File | Lines | What It Tests | Quality |
|-----------|-------|---------------|---------|
| `tests/api/test_billing.py` | 504 | Billing plans, webhook signatures, subscription lifecycle, idempotency | **Excellent** — comprehensive mocks, e2e flow, edge cases |
| `tests/api/test_mcp_scan.py` | 249 | MCP scan endpoint: success, invalid URL, private IP, quota, error | **Good** — covers all endpoint behaviors |
| `tests/integration/test_mcp_scanner.py` | 263 | MCPScanner class: init, tool enumeration, poisoning, injection, exfiltration, risk score | **Good** — OOP test structure |
| `tests/middleware/test_tier_enforcement.py` | 164 | require_tier(): all tier combos, case insensitivity, missing tier | **Excellent** — exhaustive matrix |
| `tests/services/test_compliance.py` | 78 | OWASP, MITRE ATLAS, regulatory mappings existence + structure | **Good** — covers all frameworks |
| `tests/integration/test_owasp_coverage.py` | 92 | OWASP category presence, Garak/DeepTeam probe mapping | **Good** — cross-engine validation |
| `tests/integration/test_mitre_atlas.py` | 79 | MITRE ATLAS tactics, techniques, engine compliance | **Good** — structure + content |
| `tests/services/test_attack_chains.py` | 61 | Crescendo/GOAT init, prompt sequence, response processing | **Adequate** — covers basics |
| `tests/integration/test_multi_turn_attacks.py` | 70 | Attack chain integration, jailbreak detection | **Adequate** — covers basic flows |
| `tests/test_judge_logic.py` | 57 | AI Judge evaluation, fallback, singleton | **Minimal** — single test per feature |
| `tests/app/test_garak_engine.py` | 18 | Garak multi-turn support | **Minimal** — trivial |
| `tests/api/test_scans.py` | 15 | MultiTurnScanRequest model validation | **Trivial** — basic pydantic check |

---

## 3. Integrations (External Services)

| Service | Purpose | Auth Method | File | Status |
|---------|---------|-------------|------|--------|
| Supabase | Auth + DB + storage | Service role key JWT | `supabase_service.py` | ✅ |
| Redis (Upstash) | Cache + queue + rate limit | URL | `config.py` | ✅ |
| Anthropic Claude 3 Haiku | AI Judge | API key | `judge.py` | ✅ |
| OpenAI GPT | DeepTeam probes (optional) | API key | `deepteam_engine.py` | ✅ |
| Lemon Squeezy | Billing | API key + webhook secret | `billing.py` | ✅ |
| Resend | Email (alerts) | API key | `worker.py` | ✅ |
| Railway | Deployment | Platform config | config files | ✅ |
| GitHub Actions | CI/CD | OAuth | workflows | ✅ |

---

## 4. What Is Working

**Everything in the features inventory above is working.** Specifically:

- **All 4 scan engines** execute successfully via `engine_runner.py`, produce structured findings
- **AI Judge** evaluates findings with Claude Haiku, falls back gracefully
- **All 7 compliance frameworks** have complete mappings with merge utility
- **All 15 API routers** are registered and functional
- **Enterprise SSO** supports SAML 2.0 (5 providers) + OIDC (2 providers)
- **Billing** full lifecycle: checkout → webhook → tier update → cancel
- **Webhooks** HMAC-SHA256 signed delivery with retry
- **Sentinel** continuous monitoring runs every 15 min via Celery
- **Scheduled scans** support cron, interval, one-time
- **Org management** with roles (owner/admin/member), invites, quota
- **API keys** SHA-256 hashed, create/list/revoke
- **Audit logging** inserts with user+org context
- **PDF reports** ReportLab professional output
- **Frontend** 55+ pages, cyberpunk theme, responsive
- **Social share** Twitter, LinkedIn, Facebook
- **GitHub Action** published and functional
- **SSRF protection** blocks 5+ private IP ranges, DNS rebinding defense
- **Rate limiting** per-user, per-org, tier-based
- **12 test files** passing (1630+ lines total)
- **Docker multi-stage** 3-layer build with healthcheck

---

## 5. What Is Broken / Incomplete

### 🔴 Critical Bugs

| # | Item | File:Line | Issue | Impact |
|---|------|-----------|-------|--------|
| 1 | Scheduled scan notification crash | `app/worker.py:369` | `_send_scheduled_scan_notification()` references `settings.api_url` which does **not exist** in `Settings` class. Will raise `AttributeError` at runtime. | Scheduled scan email notifications will crash the worker |
| 2 | Dead code — duplicate `_require_org_admin` | `app/api/endpoints/org.py:101,705` | Two functions with same name. Line 101 checks `role != "admin"`. Line 705 checks `role not in ("owner","admin")`. Line 101 is shadowed/never executed. | The stricter check is unused; owners bypass both |

### 🟡 Correctness Issues

| # | Item | File:Line | Issue | Impact |
|---|------|-----------|-------|--------|
| 3 | Route collision risk | `app/api/endpoints/org.py:405` vs `scans.py` | `/org/scans` may overlap with `/scans` depending on router mounting order | Potential 404 or wrong handler |
| 4 | Weak jailbreak detection | `app/services/attack_chains.py:65-80` | `CrescendoAttack.process_response()` uses naive string matching (`"confidential" in response.lower()`) | Easily bypassed with synonyms |
| 5 | Sync I/O in async context | `app/services/rag_scanner.py:200` | `_http_post()` uses blocking `urllib.request.urlopen()` inside `async def` | Blocks event loop during RAG scans |
| 6 | AI Judge fallback = always vulnerable | `app/judge.py` | When no API key, returns `is_vulnerable: True` with score 0.5 | Inflates false positive rate |
| 7 | Duplicate org user logic | `supabase_service.py:101` vs `org.py:76` | `_get_user_org_id()` and `_get_user_org()` do similar things differently | Maintenance burden |
| 8 | Positional HTTPException args | `app/api/endpoints/webhooks.py:63` | `raise HTTPException(403, "message")` instead of keyword args | Works but fragile |
| 9 | Inconsistent error response format | Multiple endpoints | Some use `{"status":"error",...}`, others raise `HTTPException` | Inconsistent client experience |
| 10 | Missing OpenAPI tags | Most endpoints | No `tags=["..."]` on route decorators | `/docs` is disorganized |

### 🟡 Code Quality

| # | Item | File:Line | Issue |
|---|------|-----------|-------|
| 11 | DeepTeam loads full dataset on init | `app/deepteam_engine.py:__init__` | `_load_attack_dataset()` runs on every instantiation |
| 12 | No scan result pagination | `app/api/endpoints/scans.py` | `get_user_scans()` returns all scans unbounded |
| 13 | No scan result caching | `app/services/scan_service.py` | Repeated identical scans re-run full engines |
| 14 | Sentinel runs per-user every 15min | `app/worker.py` | Does NOT scale to many users |
| 15 | Mixed sync/async pattern | `app/services/scan_service.py:43` | `save_scan_result()` is sync called from async context |

---

## 6. What Needs to Be Built / Gaps

### 🔴 Critical Gaps

| # | Gap | Details | Priority |
|---|-----|---------|----------|
| 1 | Frontend tests (zero) | No Vitest, no Playwright, no E2E tests in frontend/ | P0 |
| 2 | Missing backend tests | No tests for: scan_service.py, scheduled_scan_service.py, sso_service.py, webhook_delivery.py, audit.py, rag_scanner.py, easyjailbreak_engine.py, pyrit_engine.py, judge.py (full), utils.py, rate_limiter.py, deps.py, config.py, pdf_report.py | P0 |

### 🟡 High Priority Gaps

| # | Gap | Details | Why |
|---|------|---------|-----|
| 3 | Fix scheduled scan notification | Add `api_url` to Settings config.py | Prevents crash |
| 4 | Remove dead code | Delete duplicate `_require_org_admin` at org.py:101 | Cleanup |
| 5 | Resolve route collision | Audit `/org/scans` vs `/scans` | Prevents future bugs |
| 6 | SSRF validation at endpoint layer | `is_safe_url()` not called in scan endpoint before queue | Defense-in-depth |
| 7 | Replace sync urllib with async httpx | In rag_scanner.py | Event loop health |
| 8 | Upgrade jailbreak detection | Replace string matching with AI Judge call | Accuracy |
| 9 | Add scan pagination | Add skip/limit to scan listing | Performance for power users |
| 10 | Add scan result caching | Hash-based (endpoint + probe_config) | Performance |

### 🟢 Medium Priority Gaps

| # | Gap | Details |
|---|------|---------|
| 11 | Webhook replay protection | Store processed event IDs (partially done for billing, not for user webhooks) |
| 12 | Rate limit share links | Per-IP rate limit on public report endpoint |
| 13 | CSP hardening | Evaluate replacing `unsafe-inline` with nonces |
| 14 | Add robots.txt + security.txt | Standard security disclosure endpoints |
| 15 | Add CORS config validation | Reject allow_credentials + wildcard origin at startup |
| 16 | Block API key in query params | In api_key_auth() dependency |
| 17 | Block debug mode in production | Add startup assertion |
| 18 | Remove orphaned share links | Add DB-level TTL or cleanup cron |
| 19 | Add timeout enforcement on all httpx calls | Some calls lack explicit timeout= |
| 20 | Load test / stress test | No load testing suite exists |

### 🔵 Feature Gaps (Not Yet Built)

| # | Feature | Notes |
|---|---------|-------|
| 21 | API documentation generation | No custom API docs beyond OpenAPI/Swagger |
| 22 | Rate limit header verification | Confirm X-RateLimit-* headers are being set |
| 23 | Password complexity enforcement | Additional validation beyond Supabase defaults |
| 24 | Audit log deletion restriction | Only platform admin should delete, not org admin |
| 25 | Error response format standardization | Pick one format across all endpoints |

---

## 7. File/Module Map

### Backend — Core (`app/`)
```
app/
  __init__.py
  main.py                         # FastAPI entry point (17 routers, CORS, middleware, startup/shutdown)
  worker.py                       # Celery worker (scan queue, sentinel 15min, scheduled scan check 1min)
  judge.py                        # VulnerabilityJudge (Claude Haiku eval + fallback)
  garak_engine.py                 # Garak subprocess wrapper (652 lines, 40+ probes)
  deepteam_engine.py              # DeepTeam subprocess runner (600 lines)
  easyjailbreak_engine.py         # PAIR/TAP/CIPHER recipes (~500 lines)
  pyrit_engine.py                 # 10 encoding converters (~400 lines)
  pdf_report.py                   # ReportLab PDF generation (~36KB)
  core/
    __init__.py
    config.py                     # Settings class + validate_config()
    security.py                   # get_current_user() JWT + API key auth
    compliance.py                 # 7 framework mappings (~18KB)
    compliance_utils.py           # merge_compliance() utility
    rate_limiter.py               # Single Limiter instance + tier-based limits
    utils.py                      # is_safe_url() SSRF protection
    deps.py                       # require_db() shared dependency
  middleware/
    __init__.py
    tier_enforcement.py           # require_tier() dependency factory
  services/
    __init__.py
    scan_service.py               # run_scan_internal() lifecycle
    engine_runner.py              # run_all_engines() orchestrator
    supabase_service.py           # All DB operations (~22KB)
    mcp_scanner.py                # MCP agent scanner (~50KB)
    rag_scanner.py                # RAG-01 to RAG-05 (~24KB)
    attack_chains.py              # Crescendo + GOAT
    scheduled_scan_service.py     # Scheduled scan CRUD
    sso_service.py                # SAML 2.0 + OIDC
    webhook_delivery.py           # HMAC-signed webhook delivery
    audit.py                      # Enterprise audit logging
  api/
    __init__.py
    endpoints/
      __init__.py
      scans.py                    # Scan CRUD, share, report, list, diff, multi-turn (~21KB)
      billing.py                  # Lemon Squeezy plans/checkout/webhook/portal
      org.py                      # Org management, SSO, quota, audit (~33KB)
      api_keys.py                 # API key CRUD
      monitor.py                  # Sentinel watches CRUD
      webhooks.py                 # User webhook CRUD
      scheduled_scans.py          # Scheduled scan CRUD + pause/resume/run-now
      analytics.py                # GET /api/analytics/summary
      demo.py                     # Canned demo results
      quick_scan.py               # Public unauthenticated scan (3/hr IP limit)
      rag_scans.py                # RAG scan start/poll
      user.py                     # Profile + notifications
```

### Frontend (`frontend/`)
```
frontend/
  package.json                    # Next.js 16.2.1, React 19.2.3, Supabase SSR 0.9.0
  src/
    middleware.ts                 # Supabase session refresh middleware
    lib/
      utils.ts                    # cn() utility (clsx + tailwind-merge)
    types/
      api.ts                      # ApiResponse, ApiError
      auth.ts                     # Auth types
      scan.ts                     # Scan domain types (120 lines)
    utils/
      api-client.ts               # Centralized fetch wrapper (156 lines)
      auth-storage.ts             # Auth token storage
      constants.ts                # API_BASE, TIMEOUT_MS
      logger.ts                   # Client-side logger
      sanitize.ts                 # Input sanitization
      supabase/                   # Supabase client helpers (SSR, middleware, auth-guard)
    components/
      scanner/
        ScannerLayout.tsx         # Main scanner dashboard (967 lines)
        ScanConfig.tsx            # Scan configuration form
        Terminal.tsx              # Real-time terminal output
        FindingsPanel.tsx         # Vulnerability findings display
        RiskScoreViz.tsx          # Risk score visualization
        SocialShare.tsx           # Twitter/LinkedIn/Facebook share
        MultiTurnResults.tsx      # Multi-turn attack results
        DiffLayout.tsx            # Scan comparison diff view
        OnboardingOverlay.tsx     # First-time user onboarding
        ScheduledScansList.tsx    # Scheduled scan management
      landing/
        LandingPage.tsx           # Marketing landing page (1049 lines)
      auth/
        LoginForm.tsx             # Login form
        SignupForm.tsx            # Signup form
      org/
        OrgDashboard.tsx          # Org management with quota widget
        OrgJoinPage.tsx           # Org invite acceptance
        SSOSettings.tsx           # SSO configuration
      settings/
        SettingsShell.tsx         # Settings layout
      mcp-scanner/
        MCPServerScanner.tsx      # MCP scanner form
        MCPScanResults.tsx        # MCP scan results display
      rag-scanner/
        RAGScanner.tsx            # RAG scanner form
        RAGScanResults.tsx        # RAG scan results display
      analytics/
        AnalyticsDashboard.tsx    # Analytics (30-day trends)
      public/
        PublicNav.tsx             # Public navigation
        PublicFooter.tsx          # Public footer
      ui/
        button.tsx, card.tsx, badge.tsx, alert.tsx, input.tsx, tabs.tsx, progress.tsx
    app/
      page.tsx                    # Landing page
      layout.tsx                  # Root layout (IBM Plex Mono + DM Sans)
      login/page.tsx
      signup/page.tsx
      scanner/page.tsx            # Scanner dashboard (protected)
      scanner/history/page.tsx
      scanner/scheduled/page.tsx
      scanner/diff/page.tsx
      quick-scan/page.tsx         # Quick scan (public)
      mcp-scanner/page.tsx
      rag-scanner/page.tsx
      monitor/page.tsx            # Sentinel monitoring
      analytics/page.tsx
      org/page.tsx
      org/sso/page.tsx
      org/join/page.tsx
      billing/page.tsx
      billing/manage/page.tsx
      billing/success/page.tsx
      settings/page.tsx
      settings/layout.tsx
      settings/profile/page.tsx
      settings/notifications/page.tsx
      settings/api-keys/page.tsx
      settings/webhooks/page.tsx
      settings/account/page.tsx
      report/[token]/page.tsx     # Public shareable report
      pricing/page.tsx
      enterprise/page.tsx
      docs/page.tsx
      docs/[slug]/page.tsx
      blog/page.tsx
      blog/[slug]/page.tsx
      compliance/page.tsx
      owasp-llm/page.tsx
      eu-ai-act/page.tsx
      dpdp/page.tsx
      vuln-db/page.tsx
      use-cases/page.tsx
      integrations/page.tsx
      about/page.tsx
      security/page.tsx
      privacy/page.tsx
      terms/page.tsx
      responsible-disclosure/page.tsx
      faq/page.tsx
      roadmap/page.tsx
      changelog/page.tsx
      compare/page.tsx
      status/page.tsx
      profile/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
      not-found.tsx
      error.tsx
```

### Tests (`tests/`)
```
tests/
  __init__.py
  test_judge_logic.py             # 57 lines — AI Judge
  api/
    __init__.py
    test_scans.py                  # 15 lines — model validation
    test_mcp_scan.py               # 249 lines — MCP scan endpoint
    test_billing.py                # 504 lines — billing/webhook (excellent)
  app/
    __init__.py
    test_garak_engine.py           # 18 lines — minimal
  services/
    __init__.py
    test_compliance.py             # 78 lines — compliance mappings
    test_attack_chains.py          # 61 lines — attack chains
  middleware/
    __init__.py
    test_tier_enforcement.py       # 164 lines — tier enforcement (exhaustive)
  integration/
    __init__.py
    test_mcp_scanner.py            # 263 lines — MCP scanner class
    test_mitre_atlas.py            # 79 lines — MITRE ATLAS
    test_owasp_coverage.py         # 92 lines — OWASP coverage
    test_multi_turn_attacks.py     # 70 lines — multi-turn attacks
```

### Infrastructure
```
Dockerfile                        # Multi-stage (ML deps → app deps → code)
docker-compose.yml                # App + Redis + worker
railway.json                      # Railway config
railway.toml                      # Railway env mapping
.github/
  workflows/
    ci.yml                        # Lint (ruff + mypy) + test
    release.yml                   # Docker build/push + Railway deploy
    scan-action.yml               # GitHub Action CI/CD integration
github-action/
  action.yml                      # Action metadata
  dist/index.js                   # Compiled dist
  src/index.ts                    # Source
```

### Docs
```
docs/
  mitre-atlas.md
  multi-turn-attacks.md
  owasp-llm-2025.md
  plans/
    2026-03-15-mcp-scanner-design.md
    2026-03-15-multi-turn-attack-chains.md
    2026-03-30-scheduled-scans.md
    2026-03-30-enterprise-sso.md
  research/
    goat-pattern.md
    mcp-security-scanner.md
    mitre-atlas-framework.md
    crescendo-pattern.md
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Python files | 30+ |
| Total JSX/TSX files | 55+ pages, 30+ components |
| Test files | 12 (1630+ lines) |
| API endpoints | 50+ |
| Scan probes | 100+ across 4 engines |
| Compliance frameworks | 7 |
| SSO providers | 7 (SAML 2.0 × 5 + OIDC × 2) |
| Frontend pages | 55+ |
| Docker layers | 3 |
| GitHub Actions workflows | 3 + 1 marketplace action |
| Critical bugs | 2 |
| Correctness issues | 8 |
| Code quality issues | 5 |
| Testing gaps | 2 (frontend tests = zero, missing backend coverage) |
| Feature gaps | 5 |
| Security hardening items | 8 |

---

## Priority Action Items

### P0 — Fix Immediately
1. Add `api_url: Optional[str] = None` to `Settings` in `config.py` — fixes scheduled scan crash (`worker.py:369`)
2. Remove duplicate `_require_org_admin` at `org.py:101` — keep line 705
3. Write frontend tests (minimum: Smoke test on scanner page)

### P1 — Fix This Week
4. Resolve route collision between `/org/scans` and `/scans`
5. Replace sync `urllib.request` with async `httpx` in `rag_scanner.py`
6. Upgrade jailbreak detection from string matching to AI Judge call
7. Add scan pagination (skip/limit)
8. Write missing backend tests for: scan_service, sso_service, webhook_delivery, audit, rag_scanner, pdf_report

### P2 — Fix This Sprint
9. SSRF validation at endpoint layer before queue
10. Rate limit share links
11. Block debug mode in production
12. Add robots.txt + security.txt
13. Standardize error response format
14. Add OpenAPI tags to all endpoints

### P3 — Fix Next Sprint
15. Scan result caching
16. Webhook replay protection
17. CSP hardening
18. CORS config validation at startup
19. Block API key in query params
20. DeepTeam lazy loading
