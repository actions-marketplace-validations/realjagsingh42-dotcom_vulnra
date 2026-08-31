import asyncio
import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

from app.core.config import settings
from app.services.lobster_trap_client import lobster_trap

logger = logging.getLogger("vulnra.guardian.orchestrator")


class GuardianOrchestrator:
    def __init__(self):
        from app.guardian.attacker import GuardianAttacker
        from app.guardian.evaluator import GuardianEvaluator
        from app.guardian.fixer import GuardianFixer

        self.attacker = GuardianAttacker()
        self.evaluator = GuardianEvaluator()
        self.fixer = GuardianFixer()

    async def run_full_cycle(
        self,
        target_description: str,
        target_url: Optional[str] = None,
    ) -> dict:
        start_time = datetime.now(timezone.utc)
        cycle_id = str(uuid.uuid4())

        logger.info(f"[{cycle_id}] Starting GuardianForge cycle: {target_description}")

        # ── Phase 1: Attack ──────────────────────────────────────────────
        logger.info(f"[{cycle_id}] Phase 1/3: Generating attacks...")
        attacks = await self.attacker.generate_attacks(target_description, target_url)

        # ── Execute attacks against target ────────────────────────────────
        attack_responses = []
        if target_url:
            attack_responses = await self._execute_attacks(attacks, target_url, cycle_id)

        # ── Phase 2: Evaluate ────────────────────────────────────────────
        logger.info(f"[{cycle_id}] Phase 2/3: Evaluating attack results...")
        evaluation = await self.evaluator.evaluate(attacks, attack_responses)

        # ── Phase 3: Fix (generate + deploy policy) ──────────────────────
        logger.info(f"[{cycle_id}] Phase 3/3: Generating and deploying policy...")
        policy = await self.fixer.generate_policy(evaluation)

        # ── Assemble result ──────────────────────────────────────────────
        duration = (datetime.now(timezone.utc) - start_time).total_seconds()

        _SEV = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
        findings = evaluation.get("findings", [])
        findings.sort(
            key=lambda f: (_SEV.get(f.get("severity", ""), 4), -float(f.get("hit_rate", 0)))
        )

        result = {
            "status": "complete",
            "scan_engine": "guardian_forge",
            "risk_score": evaluation.get("risk_score", 0.0),
            "findings": findings,
            "compliance": evaluation.get("compliance", {}),
            "guardian_meta": {
                "cycle_id": cycle_id,
                "duration_seconds": round(duration, 2),
                "target_description": target_description,
                "attacks_generated": len(attacks),
                "attacks_executed": len(attack_responses),
                "findings_count": len(findings),
                "policy_deployed": policy.get("deployed", False),
                "policy_rule_count": policy.get("rule_count", 0),
                "summary": evaluation.get("summary", ""),
                "policy_message": policy.get("message", ""),
            },
        }

        logger.info(
            f"[{cycle_id}] Cycle complete: "
            f"risk={result['risk_score']}, "
            f"findings={len(findings)}, "
            f"rules={policy.get('rule_count', 0)}, "
            f"deployed={policy.get('deployed', False)}"
        )

        return result

    async def _execute_attacks(
        self,
        attacks: list[dict],
        target_url: str,
        cycle_id: str,
    ) -> list[dict]:
        responses = []
        probe_url = lobster_trap.get_probe_url(target_url)

        for i, attack in enumerate(attacks):
            prompt = attack.get("prompt", "")
            if not prompt:
                continue

            action = lobster_trap.proxy_request(prompt, cycle_id)
            blocked = action.get("blocked", False)
            intent = action.get("intent")

            response_entry = {
                "attack_id": attack["id"],
                "probe_index": i,
                "prompt": prompt,
                "blocked": blocked,
                "intent": intent,
                "response": f"[{action.get('action_taken', 'ALLOW')}] Attack routed to {probe_url}",
            }

            if not blocked and target_url:
                try:
                    import httpx
                    async with httpx.AsyncClient(timeout=15.0) as client:
                        resp = await client.post(
                            probe_url + "/v1/chat/completions",
                            json={
                                "model": "mock-vulnerable-llm",
                                "messages": [{"role": "user", "content": prompt}],
                            },
                        )
                        if resp.is_success:
                            data = resp.json()
                            choice = data.get("choices", [{}])[0]
                            content = choice.get("message", {}).get("content", "")
                            response_entry["response"] = content
                except Exception as exc:
                    logger.debug(f"[{cycle_id}] Attack execution failed for index {i}: {exc}")

            responses.append(response_entry)

        return responses


guardian_orchestrator = GuardianOrchestrator()
