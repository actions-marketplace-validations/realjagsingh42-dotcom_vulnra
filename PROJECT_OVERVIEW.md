# VULNRA — Project Overview

> **Last Updated:** 2026-03-31
> **Version:** 0.4.0
> **Repository:** [github.com/realjagsingh42-dotcom/vulnra](https://github.com/realjagsingh42-dotcom/vulnra)
> **Production URL:** http://localhost:8000 (local development)

---

## Executive Summary

VULNRA is a **production-grade AI vulnerability scanner** for Large Language Models. It automatically probes LLM APIs for security weaknesses—prompt injections, jailbreaks, encoding bypasses, data leakage, bias, and toxicity—using multiple scanning engines, scores findings with an AI Judge (Claude 3 Haiku), and maps all results to regulatory frameworks.

The platform provides:
- **Multi-engine scanning** with Garak, DeepTeam, PyRIT, and EasyJailbreak
- **AI-powered evaluation** using Claude 3 Haiku as an intelligent judge
- **Enterprise-grade features** including SSO, team management, audit logging, and compliance reporting
- **Real-time scanning** with a cyberpunk-themed web dashboard
- **API-first design** for CI/CD integration and automation

---

## Core Features

### 1. Vulnerability Scanning Engines

#### Garak Scanner (v0.14.0)
- Subprocess-based LLM probing engine
- Probes: DAN jailbreaks, AutoDAN, AntiDAN, Prompt Injection, Encoding Bypass, Continuation Attacks
- JSONL output parsing with structured finding extraction
- OWASP LLM Top 10 category mapping

#### DeepTeam Scanner (v0.1.0)
- 40+ vulnerability types coverage
- CVSS scoring with remediation guidance
- Categories: Prompt Injection, Poisoning, Excessive Agency, PII Leakage, Toxicity, Bias

#### PyRIT Engine
- Encoding bypass techniques (Base64, Base32, ROT13, Unicode)
- Pro+ tier access

#### EasyJailbreak Engine
- PAIR (Prompt Automated Iterative Refinement) attacks
- TAP (Tree of Attacks) attacks
- CIPHER (Character-level encoding) attacks
- Pro+ tier access

### 2. AI Judge (Claude 3 Haiku)

- Intelligent vulnerability evaluation using Anthropic Claude 3 Haiku
- Returns: `is_vulnerable` (bool), `confidence` (0.0-1.0), `reasoning` (string)
- Fallback to engine heuristics when API unavailable
- Pro+ tier access for AI Judge evaluation

### 3. Multi-Turn Attack Chains

#### Crescendo Attack
- 5-turn escalating context manipulation
- Builds rapport before escalating to sensitive requests
- Conversation history tracking

#### GOAT Attack
- Autonomous goal-oriented attack traversal
- Recursive sub-goal decomposition
- Self-critique and strategy adjustment

### 4. Specialized Scanners

#### MCP Server Scanner
- Discovers available tools on MCP servers
- Tests for: Tool injection, Privilege escalation, Data exfiltration, Unauthorized resource access
- OWASP Agentic Top 10 compliance mapping
- Probes: Tool poisoning, Excessive agency, Context poisoning, Goal misalignment

#### RAG Pipeline Scanner
- Corpus poisoning detection
- Cross-tenant data leakage testing
- Retrieval manipulation checks
- Tier-based access (RAG-01 to RAG-05)

### 5. Security & Rate Limiting

| Tier | Rate Limit | Daily Scans | AI Judge | Advanced Engines |
|------|------------|-------------|----------|------------------|
| Free | 1/min | 1 | ❌ | Garak only |
| Pro | 10/min | 100 | ✅ | + PyRIT, EasyJailbreak |
| Enterprise | 100/min | Unlimited | ✅ | Full engine suite |

### 6. Compliance Mapping

All scan results are mapped to regulatory frameworks:

- **OWASP LLM Top 10 (2025)** — LLM01 through LLM10
- **OWASP Agentic Top 10** — Agentic AI vulnerabilities
- **MITRE ATLAS** — 12 tactics, 48+ techniques
- **EU AI Act** — Articles 5-52 risk categorization
- **NIST AI RMF** — Govern/Map/Measure/Manage framework
- **DPDP (India)** — Data protection compliance
- **ISO 42001** — AI management system

---

## Integrations

### Authentication & Identity

| Provider | Type | Status |
|----------|------|--------|
| Supabase Auth | Email/Password | ✅ Active |
| GitHub OAuth | Social Login | ✅ Active |
| Google OAuth | Social Login | ✅ Active |
| SAML 2.0 (Okta, Azure AD, OneLogin, Ping) | Enterprise SSO | ✅ Active |
| OIDC (Google Workspace, Generic) | Enterprise SSO | ✅ Active |

### Database & Storage

| Service | Purpose | Status |
|---------|---------|--------|
| Supabase PostgreSQL | Primary database | ✅ Active |
| pgvector Extension | Vector embeddings | ✅ Active |

### Queue & Cache

| Service | Purpose | Status |
|---------|---------|--------|
| Redis | Cache & rate limiting | ✅ Active |
| Celery | Background task processing | ✅ Active |

### AI/LLM Providers

| Provider | Model | Purpose | Status |
|----------|-------|---------|--------|
| Anthropic | Claude 3 Haiku | AI Judge evaluation | ✅ Active |
| OpenAI | GPT models | DeepTeam probes (optional) | ✅ Optional |

### Billing

| Provider | Features | Status |
|----------|----------|--------|
| Lemon Squeezy | Subscriptions, Checkout, Webhooks | ✅ Active |

**Plan Tiers:**
- **Free** — 1 scan/day, basic probes
- **Pro** ($49/mo) — 100 scans/day, AI Judge, advanced engines
- **Enterprise** ($299/mo) — Unlimited, SSO, audit logging, team management

### Email

| Provider | Purpose | Status |
|----------|---------|--------|
| Resend | Sentinel alerts, user notifications | ✅ Active |

### Webhooks

- HMAC-SHA256 signed payloads
- Events: `scan.complete`, `sentinel.alert`, `scan.failed`
- `X-VULNRA-Signature` header for verification

### Deployment & Infrastructure

| Platform | Service | Status |
|----------|---------|--------|
| Railway | Backend API | ✅ Production |
| Railway | Frontend | ✅ Production |
| Docker | Containerization | ✅ Active |
| GitHub Actions | CI/CD | ✅ Active |

### CI/CD Integration

| Tool | Purpose | Status |
|------|---------|--------|
| GitHub Actions | Lint (Ruff + mypy), Test, Docker build | ✅ Active |
| GitHub Actions | Release on semver tags | ✅ Active |
| vulnra/scan-action | GitHub Action for CI/CD scanning | ✅ Available |

---

## API Architecture

### Core Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/scan` | Start vulnerability scan |
| `GET` | `/scan/{id}` | Poll scan status/results |
| `POST` | `/scan/{id}/share` | Create shareable link |
| `GET` | `/report/{token}` | Public shareable report |
| `GET` | `/scan/{id}/report` | Download PDF report |
| `POST` | `/multi-turn-scan` | Crescendo/GOAT attack |
| `POST` | `/scan/mcp` | MCP server scan |
| `POST` | `/api/scan/rag` | RAG pipeline scan |
| `GET` | `/scans` | List scan history |

### Organization & Team

| Method | Path | Description |
|--------|------|-------------|
| `GET/POST` | `/api/org` | Organization management |
| `POST` | `/api/org/invite` | Invite team member |
| `GET` | `/api/org/members` | List members |
| `DELETE` | `/api/org/members/{id}` | Remove member |
| `GET` | `/api/org/quota` | Org quota status |
| `GET` | `/api/audit-logs` | Audit trail |

### SSO Configuration

| Method | Path | Description |
|--------|------|-------------|
| `GET/POST` | `/api/org/sso` | SSO configuration |
| `PUT/DELETE` | `/api/org/sso/{id}` | Update/delete SSO |
| `POST` | `/api/org/sso/{id}/test` | Test SSO connection |

### Monitoring & Scheduling

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/monitor` | Create sentinel watch |
| `GET` | `/monitor` | List sentinel watches |
| `GET/POST` | `/api/scheduled-scans` | Scheduled scans |
| `POST` | `/api/scheduled-scans/{id}/pause` | Pause schedule |
| `POST` | `/api/scheduled-scans/{id}/run-now` | Run immediately |

### API Keys

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/keys` | Create API key |
| `GET` | `/keys` | List API keys |
| `DELETE` | `/keys/{id}` | Revoke API key |

### Webhooks

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/webhooks` | Create webhook |
| `GET` | `/api/webhooks` | List webhooks |
| `PATCH` | `/api/webhooks/{id}` | Update webhook |
| `DELETE` | `/api/webhooks/{id}` | Delete webhook |
| `POST` | `/api/webhooks/{id}/test` | Test delivery |

### Analytics

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/analytics/summary` | Dashboard data |

### Billing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/billing/plans` | List plans |
| `POST` | `/billing/checkout` | Create checkout |
| `GET` | `/billing/subscription` | Current subscription |
| `POST` | `/billing/cancel` | Cancel subscription |

---

## Frontend Features

### Pages & Routes

**Public Pages:**
- Landing page with animated terminal demo
- Pricing comparison
- Enterprise offering
- Documentation hub
- Blog
- OWASP LLM Top 10 reference
- Compliance documentation
- FAQ, About, Contact, Security

**Protected Pages:**
- Scanner dashboard with real-time progress
- Scan history with pagination
- Scan comparison (diff view)
- MCP server scanner
- RAG pipeline scanner
- Analytics dashboard (30-day trends)
- Sentinel monitoring
- Organization management
- Billing & subscription
- Settings (profile, API keys, webhooks, notifications)

### UI/UX

- **Theme:** Cyberpunk aesthetic with neon green (#b8ff57) accent
- **Typography:** IBM Plex Mono (code), DM Sans (UI)
- **Effects:** Grain overlay, scanlines, glow borders
- **Real-time:** Terminal-style scan progress display
- **Responsive:** Mobile-optimized with collapsible panels

### Social Sharing

- Twitter/X sharing with risk score preview
- LinkedIn professional sharing
- Facebook sharing
- Copy link functionality

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| **SSRF Protection** | Private IP blocklist, DNS rebinding defense |
| **Rate Limiting** | SlowAPI + Redis, tier-based per-minute limits |
| **JWT Authentication** | Supabase JWT verification on all protected endpoints |
| **CORS** | Whitelist-based origin validation |
| **Security Headers** | CSP, X-Frame-Options, X-Content-Type-Options, HSTS |
| **Input Validation** | Strict Pydantic models on all requests |
| **Webhook Signing** | HMAC-SHA256 with `X-VULNRA-Signature` header |
| **API Key Hashing** | SHA-256 hashed in database |
| **Non-root Docker** | `USER appuser` in production |
| **Env Validation** | Pydantic Settings with required field enforcement |

---

## Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `scans` | Vulnerability scan records with findings |
| `profiles` | User profiles with subscription tier |
| `api_keys` | API key storage (hashed) |
| `sentinel_watches` | Continuous monitoring configurations |
| `webhooks` | Webhook subscriptions |
| `scheduled_scans` | Cron-based scan scheduling |
| `scheduled_scan_runs` | Execution history |
| `organizations` | Enterprise orgs |
| `organization_members` | Membership with roles |
| `organization_invites` | Pending invitations |
| `audit_logs` | Enterprise audit trail |
| `org_daily_quota` | Shared quota tracking |
| `sso_configs` | SSO provider configurations |
| `sso_identities` | SSO user identity links |
| `sso_sessions` | SSO OAuth sessions |
| `rag_scans` | RAG vulnerability scans |

### Row Level Security (RLS)

- All tables have RLS enabled
- Users can only access their own data
- Organization data accessible to all members

---

## Tech Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 16.x |
| UI Framework | React | 19.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | v4 |
| Backend | FastAPI | Python 3.11 |
| Validation | Pydantic | v2 |
| Database | Supabase PostgreSQL | — |
| Cache | Redis | 7.x |
| Queue | Celery | 5.6.x |
| Container | Docker | — |
| Deployment | Railway | — |
| CI/CD | GitHub Actions | — |

---

## Development Workflow

### Local Setup

```bash
# Backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Worker (separate terminal)
celery -A app.worker worker --loglevel=info

# Frontend
cd frontend && npm install && npm run dev
```

### Docker Compose

```bash
docker-compose up
# Starts: app (port 8000), worker, redis (port 6379)
```

### API Documentation

Interactive API docs available at `/docs` (Swagger UI) and `/redoc` (ReDoc)

---

## Feature Roadmap

### Completed (v0.4.0)

- [x] Multi-engine scanning (Garak, DeepTeam, PyRIT, EasyJailbreak)
- [x] AI Judge with Claude 3 Haiku
- [x] Multi-turn attack chains (Crescendo, GOAT)
- [x] MCP server security scanning
- [x] RAG pipeline scanning
- [x] SSRF protection & rate limiting
- [x] Supabase Auth (email, GitHub, Google)
- [x] Enterprise SSO (SAML 2.0 + OIDC)
- [x] Lemon Squeezy billing
- [x] PDF report generation
- [x] Social sharing
- [x] Scan result sharing (public links)
- [x] Scheduled scans (cron)
- [x] Continuous monitoring (Sentinel)
- [x] Webhook notifications
- [x] Team management & org quota pooling
- [x] Audit logging
- [x] API key authentication
- [x] CI/CD GitHub Action (`vulnra/scan-action@v1`)

---

## Support & Resources

- **Documentation:** `/docs`
- **API Reference:** `/api-docs`
- **Security Disclosures:** `/responsible-disclosure`
- **Status Page:** `/status`
- **GitHub Repository:** [realjagsingh42-dotcom/vulnra](https://github.com/realjagsingh42-dotcom/vulnra)

---

*This document was auto-generated from codebase analysis. Last updated: 2026-03-31*
