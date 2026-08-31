# AgentShield — lablab.ai Hackathon Submission

## Project Name

AgentShield

## One-Line Description

VULNRA finds AI vulnerabilities through adversarial probing; Lobster Trap enforces them as runtime policy — unified from probe to production block.

## Full Project Description

The AI security market today has a blind spot. Red-teaming tools like Garak and PyRIT can probe an LLM for vulnerabilities before deployment, and runtime guards can block attacks in production, but these two tools operate in isolation. A security team finds a vulnerability on Tuesday, manually creates a policy rule on Wednesday, and has no way to verify that rule actually caught the attack. Meanwhile, the AI agent is live and unguarded.

AgentShield solves this by wiring VULNRA — an adversarial probe engine — to Lobster Trap — a runtime policy enforcement proxy — through a shared data model and a unified audit log.

VULNRA fires 40+ attack types at any OpenAI-compatible endpoint: prompt injection, jailbreaks, data extraction, encoding bypasses, multi-turn escalation chains (Crescendo and GOAT variants). Every probe result is scored by an AI Judge (Claude Haiku) that evaluates response quality beyond simple string matching. Findings are mapped to OWASP LLM Top 10 categories and MITRE ATLAS techniques.

Lobster Trap operates as a transparent proxy between the client and the target LLM. It evaluates every request against YAML policy rules before forwarding to the model. Each rule specifies an intent to match, an action (DENY, QUARANTINE, ALLOW, LOG, or HUMAN_REVIEW), and an optional risk threshold. When a rule fires, Lobster Trap returns structured intercept metadata including the matched rule, a risk score, and the action taken.

The integration is where the magic lives. VULNRA's probe results are written to the same Supabase audit table that Lobster Trap uses for intercept events. The Shield tab — a Next.js dashboard component — reads from this shared table and renders a unified view: the intercept timeline (every probe that was blocked or allowed), the policy coverage heatmap (which OWASP categories have active rules and which have been tested), and the compliance export (structured JSON ready for SOC2 or HIPAA auditors).

Two compliance policy packs ship with the box: HIPAA (8 rules mapped to the Security Rule §164.312) and SOC2 (10 rules mapped to common TSC criteria). Switching between packs updates the active rule set and the heatmap in real time.

The demo target — NexaBank AI — is a deliberately vulnerable banking assistant built on FastAPI. It simulates three common AI agent vulnerabilities: prompt injection (reveals system prompt and admin override code), PII leakage (returns SSN and account balance), and jailbreak (complies with unrestricted "DAN" mode instructions). This is available in the repo so anyone can reproduce the full demo in under two minutes.

## Technologies Used

- Next.js 14 (frontend dashboard with Shield tab component)
- FastAPI (VULNRA backend — scan orchestration, AI Judge, audit endpoints)
- Lobster Trap (runtime policy enforcement proxy — YAML-driven rules)
- Supabase (PostgreSQL + pgvector — scan results, audit log, user auth)
- Python 3.11 (probe engines, AI Judge integration, compliance export)
- TypeScript (frontend components, API client, type definitions)
- OWASP LLM Top 10 (finding classification and heatmap taxonomy)
- NIST AI RMF (compliance framework alignment)
- Anthropic Claude 3 Haiku (AI Judge — scores probe responses for safety violations)
- Celery + Redis (async probe execution and polling)

## Track

Lobster Trap Challenge — Integrating Lobster Trap into VULNRA's existing AI security scanner to create a unified find-and-enforce pipeline.

## What Makes It Different

1. **Bidirectional data flow between red-teaming and enforcement.** Most integrations stop at "we send alerts to a dashboard." AgentShield writes every Lobster Trap intercept event back into the same audit table that VULNRA's probe engine reads. This means when VULNRA finds a new vulnerability, that vulnerability is immediately visible in the heatmap as an uncovered category, and the admin knows exactly which policy to activate. The loop is tight: discover, enforce, verify.

2. **Compliance-ready out of the box.** The coverage heatmap and audit export are not afterthoughts — they are the primary interface. A SOC2 auditor asks "what AI traffic are you monitoring?" and the answer is a structured JSON file with event counts per OWASP category, generated from real intercept data. No manual spreadsheet. No "we export raw logs and build this later." It is there, in the Shield tab, on day one.

3. **Policy packs are plain YAML files.** Adding a new regulation is a pull request, not a code change. HIPAA and SOC2 packs ship pre-built, but anyone can write a GDPR pack, a PCI DSS pack, or an internal "no-credentials-in-prompts" rule in under ten minutes. The YAML schema is simple: intent, action, risk threshold, description. No SDK, no plugin API, no vendor lock-in.

## Limitations and What's Next

The demo target (NexaBank AI) is intentionally vulnerable — it triggers on simple keyword matches, which is not how real LLM vulnerabilities work. A real production agent would require AI-based detection for subtle prompt injection variants that keyword matching misses. The Lobster Trap Docker image in the demo uses a placeholder name that needs to be replaced with the actual challenge-provided image. Additionally, the current implementation runs all services on localhost; a production deployment would require proper service mesh integration, TLS enforcement between components, and a high-availability Lobster Trap cluster. If there were a Day 5, we would add an automated policy suggestion engine that reads VULNRA's probe results and generates Lobster Trap YAML rules automatically — closing the loop from find to enforce without manual rule writing.
