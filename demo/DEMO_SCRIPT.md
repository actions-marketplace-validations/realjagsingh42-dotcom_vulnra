# Demo Script — AgentShield (VULNRA + Lobster Trap)

> 5:00 total. Stage directions in [brackets]. Speak at a measured pace — slightly slower than conversation speed. Pauses are in the script as `[beat]`.

---

## [0:00–0:30] — HOOK

[Camera on you. Head and shoulders. Neutral background. Smile.]

In April 2023, a Samsung employee pasted proprietary source code into ChatGPT to debug an error. Within hours, that code was training data. Samsung banned ChatGPT. The code was already gone.

[beat]

That was the moment everyone realized: AI agents are a new attack surface, and nobody is guarding them.

[beat]

My name is [Your Name]. This is AgentShield — the first tool that both discovers and prevents adversarial attacks on AI agents in real time.

---

## [0:30–1:15] — PROBLEM

[Shift to screen share. Show a blank terminal and browser.]

Here is what the security industry looks like today. On one side, you have red-teaming tools that probe your AI agent and tell you what is broken. On the other side, you have runtime guards that block attacks in production.

[beat]

The problem is these two worlds do not talk to each other. You find a vulnerability with one tool, you fix it manually, and then you hope the fix holds — but you never know if it actually did, because the red-teamer and the guard don't share data.

[beat]

This means every AI agent is deployed with a gap: you can test it before launch, but the moment it goes live, you are blind to what is actually hitting it.

---

## [1:15–2:00] — SOLUTION OVERVIEW

[Bring up a simple diagram — three boxes in a horizontal row. Label them: VULNRA -> Lobster Trap -> Target LLM.]

AgentShield closes that gap. It has three layers.

[point to left box]

Layer one: VULNRA. An adversarial probe engine that fires forty different attack types at your AI agent — prompt injection, jailbreaks, data extraction, multi-turn escalation chains. It scores every result with an AI judge and maps every finding to the OWASP LLM Top 10 framework.

[point to middle box]

Layer two: Lobster Trap. A runtime policy enforcement proxy that sits between the client and your LLM. Every request passes through Lobster Trap before it reaches the model. If a request violates a policy — DENY, QUARANTINE, or flag for human review.

[point to right box]

Layer three: the target. In this case, a vulnerable banking assistant I built specifically for this demo.

[beat]

The key insight: VULNRA and Lobster Trap share the same data model. Every vulnerability VULNRA discovers becomes a Lobster Trap policy rule. Every intercept Lobster Trap makes becomes a VULNRA finding. The loop closes.

---

## [2:00–3:30] — LIVE DEMO

[Terminal window. Type the first curl command. Do not rush.]

Let me show you what this looks like in practice.

[Run: curl http://localhost:8001/health]

Here is our target: NexaBank AI. A banking assistant. It runs on localhost, it never connects to a real bank, and it is deliberately vulnerable. Let me check the health endpoint.

[Result shows: {"status":"ok","target":"NexaBank AI v1.0","vulnerabilities":"intentional"}]

Notice that last field: vulnerabilities intentional. I built three specific weaknesses into this agent so you can see them get caught.

[beat]

[Switch to browser. VULNRA UI is open. Navigate to the scanner page.]

Now let me open VULNRA. I am going to create a scan against this target. I enter the URL — localhost:8001 — and I select the standard probe set. That is eight attack types. Let me start the scan.

[Click "Start Scan". Watch the terminal stream appear.]

VULNRA is now firing adversarial probes. You can see the probe names streaming in — prompt injection, jailbreak, data leakage — each one is a real attack against the NexaBank model.

[beat]

[Scan completes. Switch to the Shield tab.]

The scan finishes. Now watch this. Let me switch to the Shield tab.

[beat]

[Tab badge shows a number, e.g. "🛡 3". Intercept events are listed.]

This is the intercept timeline. Every probe that passed through Lobster Trap is recorded here. The red badges are DENY events — requests that Lobster Trap blocked before they reached the model. The orange ones are QUARANTINE.

[Click on a DENY event to expand it.]

Let me expand one. This probe attempted a prompt injection — it told NexaBank to ignore its previous instructions. Lobster Trap caught it, assigned a risk score, and blocked it. The rule that fired is shown here.

[beat]

[Point to the heatmap below.]

Below the timeline is the coverage heatmap. OWASP LLM Top 10 categories, plus a few extras we added. Green means we have a policy rule and we have seen an attack attempt. Blue means we have a rule but no attack yet. Gray means uncovered.

---

## [3:30–4:15] — COMPLIANCE ANGLE

[Scroll down to the Compliance Export section.]

Now the compliance angle. Because this is a hackathon and judges love compliance.

[beat]

AgentShield ships with two policy packs out of the box. HIPAA — eight rules mapped to the Security Rule. SOC2 — ten rules mapped to common TSC criteria. You can switch between them with this dropdown.

[Click the dropdown. Switch to SOC2.]

Let me switch to SOC2. Watch the heatmap update — different categories turn blue as the new rules become active.

[beat]

[Click "Export Summary".]

And when you need to prove to an auditor that you are monitoring AI traffic, you click Export Summary. This downloads a structured JSON file with event counts broken down by type and by OWASP category. You hand this to your compliance team. They hand it to the auditor. Done.

---

## [4:15–4:45] — ARCHITECTURE

[Back to camera, or back to diagram.]

The architecture in one sentence per layer.

VULNRA is a FastAPI application with a Next.js frontend and Supabase for persistence. It uses an AI Judge — Claude Haiku — to score probe results because deterministic scoring misses edge cases that a human judge would catch.

Lobster Trap is a YAML-driven policy proxy. You write rules in plain YAML: the intent to match, the action to take, the risk threshold. No code changes needed to add a new policy.

The audit bridge writes every event to a shared Supabase table. VULNRA reads it. The Shield tab renders it. One data pipeline, two tools.

---

## [4:45–5:00] — CLOSE

[Camera on you.]

AI agents are being deployed faster than security teams can audit them. Every company building on LLMs right now has this gap — they can test, but they cannot enforce. AgentShield closes that loop. Find, enforce, audit, repeat.

[beat]

This is [Your Name]. Thank you for watching.

[Smile. Hold for 2 seconds. Stop recording.]
