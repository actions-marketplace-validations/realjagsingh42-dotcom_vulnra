# VULNRA Codebase Audit Report

> **Date:** 2026-03-31
> **Auditor:** Senior Security Engineer + Python Architect
> **Scope:** Full codebase review (app/ directory)

---

## Phase 1: Inventory & File Map

### Core Application Files

| File | Purpose | Status |
|------|---------|--------|
| `app/main.py` | FastAPI entry point, middleware, routes | ✅ Active |
| `app/core/config.py` | Pydantic Settings, env validation | ✅ Active |
| `app/core/security.py` | JWT verification, API key auth | ✅ Active |
| `app/core/utils.py` | URL validation, SSRF protection | ✅ Active |
| `app/core/rate_limiter.py` | SlowAPI rate limiting | ✅ Active |
| `app/core/deps.py` | FastAPI dependencies | ✅ Active |
| `app/core/compliance.py` | Compliance mappings | ✅ Active |
| `app/core/compliance_utils.py` | Compliance utilities | ✅ Active |

### API Endpoints

| File | Purpose | Status |
|------|---------|--------|
| `app/api/endpoints/scans.py` | Scan CRUD, sharing, reports | ✅ Active |
| `app/api/endpoints/billing.py` | Lemon Squeezy integration | ✅ Active |
| `app/api/endpoints/api_keys.py` | API key management | ✅ Active |
| `app/api/endpoints/monitor.py` | Sentinel monitoring | ✅ Active |
| `app/api/endpoints/org.py` | Organization management | ✅ Active |
| `app/api/endpoints/user.py` | User profile management | ✅ Active |
| `app/api/endpoints/webhooks.py` | Webhook registration | ✅ Active |
| `app/api/endpoints/scheduled_scans.py` | Scheduled scan management | ✅ Active |
| `app/api/endpoints/rag_scans.py` | RAG scanner endpoints | ✅ Active |
| `app/api/endpoints/demo.py` | Demo endpoints | ✅ Active |
| `app/api/endpoints/quick_scan.py` | Quick scan endpoint | ✅ Active |
| `app/api/endpoints/analytics.py` | Analytics endpoints | ✅ Active |

### Services

| File | Purpose | Status |
|------|---------|--------|
| `app/services/supabase_service.py` | Database operations | ✅ Active |
| `app/services/scan_service.py` | Scan orchestration | ✅ Active |
| `app/services/mcp_scanner.py` | MCP vulnerability scanner | ✅ Active |
| `app/services/rag_scanner.py` | RAG security scanner | ✅ Active |
| `app/services/attack_chains.py` | Multi-turn attack chains | ✅ Active |
| `app/services/scheduled_scan_service.py` | Scheduled scans logic | ✅ Active |
| `app/services/sso_service.py` | SSO/SAML/OIDC | ✅ Active |
| `app/services/webhook_delivery.py` | Webhook delivery | ✅ Active |
| `app/services/audit.py` | Audit logging | ✅ Active |
| `app/services/engine_runner.py` | Engine selection | ✅ Active |

### Engines

| File | Purpose | Status |
|------|---------|--------|
| `app/garak_engine.py` | Garak probe integration | ✅ Active |
| `app/deepteam_engine.py` | DeepTeam integration | ✅ Active |
| `app/judge.py` | Claude AI Judge | ✅ Active |
| `app/easyjailbreak_engine.py` | EasyJailbreak integration | ✅ Active |
| `app/pyrit_engine.py` | PyRIT integration | ✅ Active |
| `app/pdf_report.py` | PDF report generation | ✅ Active |
| `app/worker.py` | Celery worker tasks | ✅ Active |

---

## Phase 2: Dead Code & Duplication

### Removed Unused Imports

| File | Removed |
|------|---------|
| `app/services/supabase_service.py` | `os` (unused) |
| `app/api/endpoints/scans.py` | `get_user_tier` (unused import) |
| `app/services/audit.py` | `time` (unused) |
| `app/main.py` | Duplicate `random` import (moved to top) |

### Duplicate Code Consolidation

- **Rate limiting**: Already consolidated in `app/core/rate_limiter.py` - ✅ Good
- **Config validation**: Already consolidated in `app/core/config.py` - ✅ Good
- **SSRF protection**: Already consolidated in `app/core/utils.py` - ✅ Good

---

## Phase 3: Security Hardening

### Issues Found & Fixed

| Issue | File | Fix Applied |
|-------|------|-------------|
| Supabase credentials not required | `app/core/config.py` | Updated `validate_config()` to require `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` |
| Imports inside middleware | `app/main.py` | Moved `get_supabase`, `get_user_tier`, `get_api_key_user` to module level |
| Duplicate random import | `app/main.py` | Removed duplicate import |
| Global exception handler | `app/main.py` | Already exists with proper JSON error format |

### Security Features Verified

| Feature | Status |
|---------|--------|
| JWT verification via Supabase | ✅ Verified |
| API key authentication (`vk_live_` prefix) | ✅ Verified |
| Global exception handler with JSON responses | ✅ Verified |
| CORS with explicit origins | ✅ Verified |
| Rate limiting with tier awareness | ✅ Verified |
| SSRF protection (`is_safe_url`) | ✅ Verified |
| Request size limits | ⚠️ Needs review per-endpoint |
| URL validation on scan endpoints | ⚠️ `is_safe_url` exists but needs consistency check |

---

## Phase 4: Code Quality

### Type Annotations

| File | Status |
|------|--------|
| `app/core/config.py` | ✅ Full types |
| `app/core/security.py` | ✅ Full types |
| `app/core/utils.py` | ✅ Full types |
| `app/core/rate_limiter.py` | ✅ Full types |
| Most endpoints | ⚠️ Partial - some LSP type errors with Supabase client |

### Logging

- All core files use `logging.getLogger()` - ✅ Good
- No `print()` statements in production code - ✅ Good
- Scan start/completion logging exists in worker.py - ✅ Good

### Constants & Configuration

- All configuration in `app/core/config.py` - ✅ Good
- Rate limits use Settings - ✅ Good

---

## Phase 5: Outstanding Issues

### Requires Manual Review

| Issue | Description | Priority |
|-------|-------------|----------|
| Garak Docker worker | Mock fallback in production needs pre-built Docker image with Garak | High |
| Rate limiting on /report/generate | Need to verify `is_safe_url` is called on all outbound endpoints | Medium |
| Request size limits | Add `64KB` limit to request bodies | Medium |
| Pydantic response_model | Add explicit response models to all endpoints | Low |

### Pre-existing LSP Type Errors

These are Supabase client type annotation issues that don't affect runtime:
- `app/services/supabase_service.py` - count="exact" type errors
- `app/services/audit.py` - table() on None type errors
- Various endpoint files

These are due to the Supabase Python SDK's type stubs and can be addressed with type: ignore comments if needed.

---

## Summary

### Changes Made

1. **config.py**: Updated `validate_config()` to require Supabase credentials
2. **main.py**: 
   - Moved imports to module level
   - Removed duplicate random import
3. **supabase_service.py**: Removed unused `os` import
4. **scans.py**: Removed unused `get_user_tier` import
5. **audit.py**: Removed unused `time` import

### Files Modified

- `app/core/config.py`
- `app/main.py`
- `app/services/supabase_service.py`
- `app/api/endpoints/scans.py`
- `app/services/audit.py`

### Recommendations

1. Add request size limits to all endpoints
2. Verify `is_safe_url` is called on all scan-related endpoints
3. Consider adding explicit `response_model` to all FastAPI routes
4. Address Supabase client type annotation issues with type: ignore comments

---

## Requirements.txt Review

All dependencies are pinned to exact versions. No CVEs detected in current pinning.

```
✅ All packages pinned (e.g., fastapi==0.135.1)
✅ No wildcard versions
✅ croniter fixed to 4.0.0 (4.1.0 doesn't exist)
```
