import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Integrations — VULNRA | CI/CD, GitHub Actions, Slack & API",
  description:
    "Integrate VULNRA into your CI/CD pipeline with GitHub Actions, GitLab CI, Jenkins, or the REST API. Get Slack and webhook alerts when new LLM vulnerabilities are detected.",
  alternates: { canonical: "https://vulnra.ai/integrations" },
  openGraph: {
    title: "VULNRA Integrations — CI/CD, GitHub Actions, Slack & API",
    description: "Automate LLM security testing in your deployment pipeline. GitHub Actions, GitLab CI, Jenkins, REST API, webhooks, and Slack alerts.",
    url: "https://vulnra.ai/integrations",
    siteName: "VULNRA",
    type: "website",
  },
};

const INTEGRATIONS = [
  {
    id: "github-actions",
    name: "GitHub Actions",
    status: "available",
    description: "Fail CI on new HIGH or CRITICAL LLM vulnerabilities. Block merges to main when your model regresses.",
    badge: "CI/CD",
    badgeColor: "text-acid border-acid/40 bg-acid/8",
    code: `# .github/workflows/llm-security.yml
name: LLM Security Scan
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  vulnra-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Run VULNRA scan
        id: scan
        run: |
          RESULT=$(curl -s -X POST https://api.vulnra.ai/scan \\
            -H "Authorization: Bearer \${{ secrets.VULNRA_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{"target_url":"\${{ vars.LLM_API_URL }}","tier":"pro"}')
          SCAN_ID=$(echo $RESULT | jq -r '.scan_id')
          echo "scan_id=$SCAN_ID" >> $GITHUB_OUTPUT

      - name: Wait for results
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s https://api.vulnra.ai/scan/\${{ steps.scan.outputs.scan_id }} \\
              -H "Authorization: Bearer \${{ secrets.VULNRA_API_KEY }}" | jq -r '.status')
            [ "$STATUS" = "complete" ] && break
            sleep 10
          done

      - name: Check for regressions
        run: |
          CRITICAL=$(curl -s https://api.vulnra.ai/scan/\${{ steps.scan.outputs.scan_id }} \\
            -H "Authorization: Bearer \${{ secrets.VULNRA_API_KEY }}" \\
            | jq '.findings | map(select(.severity=="CRITICAL")) | length')
          [ "$CRITICAL" -gt 0 ] && echo "::error::$CRITICAL CRITICAL findings" && exit 1
          echo "No critical findings — scan passed."`,
  },
  {
    id: "gitlab-ci",
    name: "GitLab CI",
    status: "available",
    description: "Add an LLM security gate to your GitLab pipeline. Block deployments when new vulnerabilities exceed your risk threshold.",
    badge: "CI/CD",
    badgeColor: "text-acid border-acid/40 bg-acid/8",
    code: `# .gitlab-ci.yml
llm-security:
  stage: test
  image: curlimages/curl:latest
  variables:
    LLM_API_URL: "https://your-llm-api.example.com/v1/chat"
  script:
    - |
      SCAN_ID=$(curl -s -X POST https://api.vulnra.ai/scan \\
        -H "Authorization: Bearer $VULNRA_API_KEY" \\
        -H "Content-Type: application/json" \\
        -d "{\\"target_url\\":\\"$LLM_API_URL\\",\\"tier\\":\\"pro\\"}" \\
        | jq -r '.scan_id')
    - sleep 60
    - |
      RISK=$(curl -s https://api.vulnra.ai/scan/$SCAN_ID \\
        -H "Authorization: Bearer $VULNRA_API_KEY" \\
        | jq '.risk_score')
      echo "Risk score: $RISK"
      [ $(echo "$RISK > 7" | bc) -eq 1 ] && exit 1 || exit 0
  only:
    - main
    - merge_requests`,
  },
  {
    id: "rest-api",
    name: "REST API",
    status: "available",
    description: "Full programmatic control over scans, results, and reports. Use any language, any platform, any CI system.",
    badge: "API",
    badgeColor: "text-[#4db8ff] border-[#4db8ff]/40 bg-[#4db8ff]/8",
    code: `# Python — start a scan and poll for results
import httpx, time

API_KEY = "vk_live_your_key_here"
BASE    = "https://api.vulnra.ai"

def scan(target_url: str) -> dict:
    headers = {"Authorization": f"Bearer {API_KEY}"}

    # Start scan
    r = httpx.post(f"{BASE}/scan", headers=headers, json={
        "target_url": target_url,
        "tier": "pro",
        "engines": ["garak", "deepteam", "pyrit"]
    })
    r.raise_for_status()
    scan_id = r.json()["scan_id"]
    print(f"Scan started: {scan_id}")

    # Poll until complete
    while True:
        r = httpx.get(f"{BASE}/scan/{scan_id}", headers=headers)
        result = r.json()
        if result["status"] == "complete":
            return result
        print(f"Status: {result['status']} ({result.get('progress', 0)}%)")
        time.sleep(5)

result = scan("https://your-llm-api.example.com/v1/chat")
print(f"Risk score: {result['risk_score']}/10")
print(f"Critical findings: {len([f for f in result['findings'] if f['severity']=='CRITICAL'])}")`,
  },
  {
    id: "webhooks",
    name: "Webhooks",
    status: "available",
    description: "Receive real-time POST payloads when scans complete or when Sentinel detects a regression. Integrate with any downstream system.",
    badge: "Alerts",
    badgeColor: "text-v-amber border-v-amber/40 bg-v-amber/8",
    code: `# Webhook payload — scan.complete event
{
  "event": "scan.complete",
  "scan_id": "sc_01j9qk2m4n...",
  "timestamp": "2026-03-15T14:32:10Z",
  "target_url": "https://your-llm-api.example.com/v1/chat",
  "risk_score": 6.8,
  "findings_count": 12,
  "critical_count": 0,
  "high_count": 3,
  "owasp_violations": ["LLM01", "LLM06"],
  "report_url": "https://vulnra.ai/report/pub_abc123"
}

# Sentinel regression alert — sentinel.regression event
{
  "event": "sentinel.regression",
  "watch_id": "sw_01j9...",
  "target_url": "https://your-llm-api.example.com/v1/chat",
  "baseline_risk": 3.2,
  "current_risk": 6.1,
  "risk_delta_pct": 91,
  "new_findings": [
    { "category": "PROMPT_INJECTION", "severity": "HIGH" }
  ]
}

# Verify webhook signature (HMAC-SHA256)
import hmac, hashlib
def verify(secret: str, payload: bytes, sig_header: str) -> bool:
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", sig_header)`,
  },
  {
    id: "slack",
    name: "Slack Alerts",
    status: "coming-soon",
    description: "Post scan summaries and Sentinel regression alerts directly to a Slack channel. One-click setup with OAuth.",
    badge: "Alerts",
    badgeColor: "text-v-amber border-v-amber/40 bg-v-amber/8",
    code: `# Coming soon — native Slack app integration
# In the meantime, use webhooks + a Slack incoming webhook:

import httpx, json

SLACK_WEBHOOK = "https://hooks.slack.com/services/T.../B.../..."

def post_to_slack(scan_result: dict):
    risk = scan_result["risk_score"]
    color = "#ff4444" if risk >= 7 else "#f5a623" if risk >= 4 else "#b8ff57"
    httpx.post(SLACK_WEBHOOK, json={
        "attachments": [{
            "color": color,
            "title": f"VULNRA Scan — Risk {risk}/10",
            "text": f"Target: {scan_result['target_url']}\\n"
                    f"Critical: {scan_result['critical_count']} | "
                    f"High: {scan_result['high_count']}",
            "actions": [{
                "type": "button",
                "text": "View Report",
                "url": scan_result["report_url"]
            }]
        }]
    })`,
  },
];

const FEATURES = [
  { label: "Scan via API key", detail: "vk_live_ format, SHA-256 stored" },
  { label: "Async poll model", detail: "POST /scan → GET /scan/{id}" },
  { label: "Webhook delivery", detail: "HMAC-SHA256 signed payloads" },
  { label: "PDF report download", detail: "GET /scan/{id}/report" },
  { label: "Scan history", detail: "GET /scans — paginated, filterable" },
  { label: "Regression diff", detail: "GET /scan/{id}/diff?baseline={id}" },
  { label: "Rate limits", detail: "Free: 1/min · Pro: 10/min · Ent: 100/min" },
  { label: "OpenAPI spec", detail: "Available at /docs" },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-28 pb-20">

        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-5">
            <span className="w-5 h-px bg-acid/35" />
            Developer Integrations
            <span className="w-5 h-px bg-acid/35" />
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-[1.1]">
            Plug into your<br />
            <span style={{ color: "#b8ff57" }}>existing pipeline</span>
          </h1>
          <p className="text-base text-v-muted font-light leading-relaxed">
            VULNRA is API-first. Integrate LLM vulnerability scanning into GitHub Actions, GitLab CI, Jenkins, or any system that can make an HTTP request. Get alerts via webhooks or Slack.
          </p>
        </div>

        {/* API quick-reference */}
        <div className="mb-16 border border-v-border rounded-lg p-6 bg-v-bg1">
          <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-acid mb-5">API at a glance</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {FEATURES.map(({ label, detail }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-mono text-[10.5px] font-bold text-foreground">{label}</span>
                <span className="font-mono text-[9.5px] text-v-muted2">{detail}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-v-border2 flex flex-wrap items-center gap-4">
            <Link
              href="/docs"
              className="font-mono text-[10px] tracking-widest text-acid hover:underline underline-offset-4 transition-colors"
            >
              Full API docs →
            </Link>
            <Link
              href="/settings/api-keys"
              className="font-mono text-[10px] tracking-widest text-v-muted2 hover:text-acid transition-colors"
            >
              Manage API keys →
            </Link>
          </div>
        </div>

        {/* Integration cards */}
        <div className="space-y-8">
          {INTEGRATIONS.map((intg) => (
            <div key={intg.id} id={intg.id} className="border border-v-border rounded-lg overflow-hidden bg-v-bg1">

              {/* Card header */}
              <div className="px-6 py-5 border-b border-v-border2 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h2 className="font-mono text-base font-bold tracking-tight text-foreground">{intg.name}</h2>
                      <span className={`text-[7.5px] font-mono font-bold px-2 py-0.5 rounded border tracking-widest ${intg.badgeColor}`}>
                        {intg.badge}
                      </span>
                      {intg.status === "coming-soon" && (
                        <span className="text-[7.5px] font-mono px-2 py-0.5 rounded border tracking-widest text-v-muted2 border-v-border">
                          COMING SOON
                        </span>
                      )}
                    </div>
                    <p className="text-[12.5px] text-v-muted font-light leading-relaxed">{intg.description}</p>
                  </div>
                </div>
              </div>

              {/* Code block */}
              <div className="relative">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-v-border2 bg-white/[0.02]">
                  <div className="w-2 h-2 rounded-full bg-v-red/60" />
                  <div className="w-2 h-2 rounded-full bg-v-amber/60" />
                  <div className="w-2 h-2 rounded-full bg-acid/60" />
                  <span className="font-mono text-[8.5px] text-v-muted2 ml-2 tracking-wider">{intg.name.toLowerCase().replace(/ /g, "-")}.sh</span>
                </div>
                <pre className="overflow-x-auto p-5 text-[11px] font-mono text-v-muted leading-[1.7] bg-black/20">
                  <code>{intg.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 border border-v-border rounded-lg p-10 text-center bg-v-bg1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-acid/30 to-transparent" />
          <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-4">Get your API key</p>
          <h3 className="font-mono text-2xl font-bold text-foreground mb-4">
            Integrate in under 5 minutes.
          </h3>
          <p className="text-sm text-v-muted font-light mb-8 max-w-lg mx-auto leading-relaxed">
            Sign up for free, generate a <span className="font-mono text-acid text-xs">vk_live_</span> API key, and paste the GitHub Actions snippet into your workflow. Your first scan is free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="font-mono text-[11px] font-bold tracking-widest bg-acid text-black px-6 py-3 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(184,255,87,0.3)] transition-all"
            >
              GET API KEY FREE →
            </Link>
            <Link
              href="/docs"
              className="font-mono text-[11px] tracking-widest text-v-muted2 border border-v-border px-6 py-3 rounded-sm hover:border-white/15 hover:text-v-muted transition-all"
            >
              VIEW API DOCS
            </Link>
          </div>
        </div>

      </div>

      <PublicFooter />
    </div>
  );
}
