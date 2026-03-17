"""
Analytics summary endpoint.
GET /api/analytics/summary — aggregated security posture for the authenticated user.
"""

from datetime import datetime, timedelta, timezone
from collections import Counter, defaultdict
from fastapi import APIRouter, Depends, Request

from app.core.security import get_current_user
from app.services.supabase_service import get_supabase

router = APIRouter()


@router.get("/api/analytics/summary")
async def get_analytics_summary(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Return aggregated scan analytics for the last 200 scans of the user."""
    user_id = current_user["id"]
    sb = get_supabase()

    if not sb:
        return {
            "total_scans": 0,
            "avg_risk_score": 0,
            "total_findings": 0,
            "critical_findings": 0,
            "trend_30d": [],
            "top_categories": [],
            "most_scanned_url": None,
            "score_change": None,
        }

    # Fetch last 200 scans for this user
    try:
        res = (
            sb.table("scans")
            .select("id,target_url,risk_score,findings,tier,created_at,status")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(200)
            .execute()
        )
        scans = res.data or []
    except Exception:
        scans = []

    # Only completed scans with a risk score for analytics
    complete = [
        s for s in scans
        if s.get("status") == "complete" and s.get("risk_score") is not None
    ]

    # ── Basic counts ────────────────────────────────────────────────────────
    total_scans = len(scans)
    avg_risk = (
        round(sum(s["risk_score"] * 100 for s in complete) / len(complete), 1)
        if complete else 0.0
    )

    # ── Findings aggregation ────────────────────────────────────────────────
    total_findings = 0
    critical_findings = 0
    category_counter: Counter = Counter()

    for s in complete:
        findings = s.get("findings") or []
        if not isinstance(findings, list):
            continue
        total_findings += len(findings)
        for f in findings:
            if not isinstance(f, dict):
                continue
            sev = f.get("severity", "")
            if sev in ("HIGH", "CRITICAL"):
                critical_findings += 1
            cat = f.get("category", "")
            if cat:
                category_counter[cat] += 1

    # ── 30-day risk trend (one bucket per calendar day) ─────────────────────
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=30)
    day_scores: dict = defaultdict(list)

    for s in complete:
        created_raw = s.get("created_at", "")
        if not created_raw:
            continue
        try:
            # Handle both UTC Z and +00:00 suffix formats
            created_str = created_raw.replace("Z", "+00:00")
            dt = datetime.fromisoformat(created_str)
            if dt >= cutoff:
                day_key = dt.strftime("%Y-%m-%d")
                day_scores[day_key].append(s["risk_score"] * 100)
        except Exception:
            pass

    trend_30d = [
        {"date": day, "score": round(sum(scores) / len(scores), 1)}
        for day, scores in sorted(day_scores.items())
    ]

    # ── Top vulnerability categories ────────────────────────────────────────
    top_categories = [
        {"category": cat, "count": count}
        for cat, count in category_counter.most_common(8)
    ]

    # ── Most-scanned endpoint ───────────────────────────────────────────────
    url_counter: Counter = Counter(
        s.get("target_url", "") for s in scans if s.get("target_url")
    )
    most_scanned_url = url_counter.most_common(1)[0][0] if url_counter else None

    # ── Score delta (last scan vs avg of 2-6 prior) ─────────────────────────
    score_change = None
    if len(complete) >= 2:
        last_score = complete[0]["risk_score"] * 100
        tail = complete[1: min(6, len(complete))]
        prev_avg = sum(s["risk_score"] * 100 for s in tail) / len(tail)
        score_change = round(last_score - prev_avg, 1)

    return {
        "total_scans": total_scans,
        "avg_risk_score": avg_risk,
        "total_findings": total_findings,
        "critical_findings": critical_findings,
        "trend_30d": trend_30d,
        "top_categories": top_categories,
        "most_scanned_url": most_scanned_url,
        "score_change": score_change,
    }
