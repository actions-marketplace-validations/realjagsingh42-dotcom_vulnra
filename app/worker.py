"""
app/worker.py - Celery worker for VULNRA.
Consolidated and hardened version.
"""

import os
import time
import pathlib
import sys
import logging
from celery import Celery

# Ensure project root is on path for standalone execution
ROOT = pathlib.Path(__file__).parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.main import settings

# ── Logging Setup ─────────────────────────────────────────────────────────────
logger = logging.getLogger("vulnra.worker")

# ── Celery App Setup ──────────────────────────────────────────────────────────
app = Celery(
    "vulnra",
    broker=settings.redis_url,
    backend=settings.redis_url
)

app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    worker_pool="solo", # Safe for Windows/Development
    broker_connection_retry_on_startup=True,
    task_track_started=True,
    broker_transport_options={
        "visibility_timeout": 3600,
        "socket_connect_timeout": 5,
        "socket_timeout": 5,
    }
)

# ── Tasks ─────────────────────────────────────────────────────────────────────

@app.task(name="app.worker.run_scan", bind=True)
def run_scan(self, scan_id: str, url: str, tier: str = "free"):
    """
    Asynchronous task to run multi-engine scans (Garak + DeepTeam).
    """
    logger.info(f"Worker received scan task: {scan_id} -> {url} [Tier: {tier}]")
    
    findings = []
    compliance = {}
    scan_engines = []
    max_risk = 0.0
    
    # ── 1. Garak Scan ───────────────────────────────────────────
    try:
        from app.garak_engine import run_garak_scan
        garak_res = run_garak_scan(scan_id, url, tier)
        if garak_res.get("status") == "complete":
            findings.extend(garak_res.get("findings", []))
            _merge_compliance(compliance, garak_res.get("compliance", {}))
            scan_engines.append(garak_res.get("scan_engine", "garak"))
            max_risk = max(max_risk, float(garak_res.get("risk_score", 0)))
    except Exception as e:
        logger.error(f"Garak engine failed: {e}")

    # ── 2. DeepTeam Scan ────────────────────────────────────────
    try:
        from app.deepteam_engine import run_deepteam_scan
        # DeepTeam requires OpenAI key
        if os.environ.get("OPENAI_API_KEY"):
            dt_res = run_deepteam_scan(scan_id, url, tier)
            if dt_res.get("status") == "complete":
                findings.extend(dt_res.get("findings", []))
                _merge_compliance(compliance, dt_res.get("compliance", {}))
                scan_engines.append(dt_res.get("scan_engine", "deepteam_v1"))
                max_risk = max(max_risk, float(dt_res.get("risk_score", 0)))
        else:
            logger.warning("Skipping DeepTeam scan: OPENAI_API_KEY missing.")
    except Exception as e:
        logger.error(f"DeepTeam engine failed: {e}")

    # ── 3. Post-Process & Finalize ──────────────────────────────
    # Sort unified findings by severity
    findings.sort(key=lambda x: ({"HIGH": 0, "MEDIUM": 1, "LOW": 2}.get(x.get("severity"), 3), -float(x.get("hit_rate", 0))))
    
    # Post-process for free tier (minimal info)
    if tier == "free" and findings:
        for i, f in enumerate(findings):
            if i > 0:
                f["blurred"] = True
                f["detail"] = "Upgrade to Pro to see full details"
        compliance["blurred"] = True
        compliance["hint"] = "Upgrade to Pro"

    result = {
        "scan_id": scan_id,
        "url": url,
        "tier": tier,
        "status": "complete" if scan_engines else "failed",
        "risk_score": max_risk,
        "findings": findings,
        "compliance": compliance,
        "scan_engines": scan_engines,
        "completed_at": time.time(),
    }
    
    if not scan_engines:
        result["error"] = "All scan engines failed"
        logger.error(f"Scan {scan_id} failed completely.")
    else:
        logger.info(f"Scan {scan_id} completed via engines: {scan_engines}")
        
    return result

def _merge_compliance(base: dict, new: dict):
    """Deep merge compliance records."""
    if not new or new.get("blurred"):
        return
    for framework, data in new.items():
        if framework in ("blurred", "hint"): continue
        if framework not in base:
            base[framework] = data
        else:
            # Merge articles/sections sets
            if "articles" in data:
                existing = set(base[framework].get("articles", []))
                existing.update(data["articles"])
                base[framework]["articles"] = sorted(list(existing))
            if "sections" in data:
                existing = set(base[framework].get("sections", []))
                existing.update(data["sections"])
                base[framework]["sections"] = sorted(list(existing))
            if "functions" in data:
                existing = set(base[framework].get("functions", []))
                existing.update(data["functions"])
                base[framework]["functions"] = sorted(list(existing))
            # Max fine
            if "fine_eur" in data:
                base[framework]["fine_eur"] = max(base[framework].get("fine_eur", 0), data["fine_eur"])
            if "fine_inr" in data:
                base[framework]["fine_inr"] = max(base[framework].get("fine_inr", 0), data["fine_inr"])

@app.task(name="app.worker.sentinel_check")
def sentinel_check(watch_id: str, url: str, tier: str = "pro"):
    """
    Recurring scan task for watched endpoints.
    """
    logger.info(f"Sentinel re-scan triggered for {url}")
    return run_scan.delay(watch_id, url, tier)