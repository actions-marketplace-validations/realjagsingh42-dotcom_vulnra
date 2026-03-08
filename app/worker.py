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
    Asynchronous task to run a Garak scan.
    """
    logger.info(f"Worker received scan task: {scan_id} -> {url} [Tier: {tier}]")
    
    try:
        from app.garak_engine import run_garak_scan
        result = run_garak_scan(scan_id, url, tier)
        
        # Post-process for free tier (minimal info)
        if tier == "free" and result.get("findings"):
            for i, f in enumerate(result["findings"]):
                if i > 0:
                    f["blurred"] = True
                    f["detail"] = "Upgrade to Pro to see full details"
            result["compliance"] = {"blurred": True, "hint": "Upgrade to Pro"}

        result.update({
            "tier": tier,
            "completed_at": time.time(),
        })
        
        logger.info(f"Scan {scan_id} completed successfully.")
        return result
        
    except Exception as e:
        logger.error(f"Worker failed during scan {scan_id}: {e}")
        return {
            "scan_id": scan_id,
            "status": "failed",
            "error": str(e),
            "completed_at": time.time()
        }

@app.task(name="app.worker.sentinel_check")
def sentinel_check(watch_id: str, url: str, tier: str = "pro"):
    """
    Recurring scan task for watched endpoints.
    """
    logger.info(f"Sentinel re-scan triggered for {url}")
    return run_scan.delay(watch_id, url, tier)