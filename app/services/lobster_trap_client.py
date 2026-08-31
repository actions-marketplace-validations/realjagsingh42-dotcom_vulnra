import logging
from typing import Optional

import httpx

from app.core.config import settings

logger = logging.getLogger("vulnra.lobster_trap")

_LT_TIMEOUT = 5.0


class LobsterTrapClient:
    def __init__(self) -> None:
        self.enabled = settings.lobster_trap_enabled
        self.url = settings.lobster_trap_url.rstrip("/")

    def get_probe_url(self, original_url: str) -> str:
        """Return Lobster Trap URL when enabled, else the original target URL."""
        if self.enabled:
            return self.url
        return original_url

    def extract_intercept(
        self,
        response_json: dict,
        scan_id: str,
        probe_index: int,
        probe_prompt: str,
    ) -> dict:
        """Extract an intercept event payload from a probe response.

        Reads the ``_lobstertrap`` field that Lobster Trap embeds in every
        proxied response.  When the field is absent (direct mode, no proxy),
        returns a minimal ALLOW record.
        """
        lt = response_json.get("_lobstertrap", {})
        ingress = lt.get("ingress", {})
        detected = ingress.get("detected", {})

        if lt:
            return {
                "scan_id": scan_id,
                "probe_index": probe_index,
                "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
                "prompt": probe_prompt,
                "response": response_json.get("response") or str(response_json),
                "intent": detected.get("intent_category"),
                "risk_score": detected.get("risk_score", 0.0),
                "pii_detected": detected.get("contains_pii", False),
                "action_taken": lt.get("verdict", "ALLOW"),
                "rule_matched": ingress.get("rule", {}).get("name"),
            }

        return {
            "scan_id": scan_id,
            "probe_index": probe_index,
            "timestamp": __import__("datetime").datetime.utcnow().isoformat(),
            "prompt": probe_prompt,
            "response": response_json.get("response") or str(response_json),
            "intent": None,
            "risk_score": None,
            "pii_detected": False,
            "action_taken": "ALLOW",
            "rule_matched": None,
        }

    def proxy_request(self, prompt: str, scan_id: Optional[str] = None) -> dict:
        if not self.enabled:
            return {
                "action_taken": "ALLOW",
                "blocked": False,
                "intent": None,
                "risk_score": 0.0,
            }

        try:
            with httpx.Client(timeout=_LT_TIMEOUT) as client:
                resp = client.post(
                    f"{self.url}/check",
                    json={"prompt": prompt, "scan_id": scan_id},
                )
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.TimeoutException) as exc:
            logger.warning("Lobster Trap unreachable (%s); falling back to ALLOW", exc)
            return {
                "action_taken": "ALLOW",
                "blocked": False,
                "intent": None,
                "risk_score": 0.0,
            }

        action = resp.headers.get("X-LT-Action", "ALLOW")
        intent = resp.headers.get("X-LT-Intent")
        risk_str = resp.headers.get("X-LT-Risk-Score", "0")
        try:
            risk_score = float(risk_str)
        except ValueError:
            risk_score = 0.0

        return {
            "action_taken": action,
            "blocked": action == "DENY",
            "intent": intent,
            "risk_score": risk_score,
        }


# Module-level singleton for easy import
lobster_trap = LobsterTrapClient()
