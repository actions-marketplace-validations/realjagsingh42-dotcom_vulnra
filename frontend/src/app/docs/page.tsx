"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ChevronRight,
  Copy,
  Check,
  Terminal,
  Key,
  Zap,
  Globe,
  Database,
  Eye,
  RefreshCw,
  Webhook,
  AlertCircle,
} from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

/* ─── Copy button ──────────────────────────────────────────────────────────── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="p-1.5 rounded hover:bg-white/10 transition-colors text-v-muted hover:text-white"
      title="Copy"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-acid" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

/* ─── Code block ───────────────────────────────────────────────────────────── */
function CodeBlock({
  code,
  lang = "bash",
}: {
  code: string;
  lang?: string;
}) {
  return (
    <div className="relative bg-[#0a0a0c] border border-v-border2 rounded-lg overflow-hidden mt-4 mb-6">
      <div className="flex items-center justify-between px-4 py-2 border-b border-v-border2 bg-white/[0.02]">
        <span className="font-mono text-[10px] tracking-widest text-v-muted2 uppercase">
          {lang}
        </span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 overflow-x-auto text-[12.5px] leading-[1.8] font-mono text-v-muted">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/* ─── Badge ────────────────────────────────────────────────────────────────── */
function Badge({
  label,
  color = "muted",
}: {
  label: string;
  color?: "green" | "yellow" | "red" | "blue" | "muted";
}) {
  const colors: Record<string, string> = {
    green: "bg-acid/15 text-acid border-acid/30",
    yellow: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
    red: "bg-v-red/15 text-v-red border-v-red/30",
    blue: "bg-blue-400/15 text-blue-400 border-blue-400/30",
    muted: "bg-white/5 text-v-muted2 border-v-border2",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border font-mono text-[10px] tracking-wider ${colors[color]}`}
    >
      {label}
    </span>
  );
}

/* ─── Method badge ─────────────────────────────────────────────────────────── */
function Method({ m }: { m: string }) {
  const map: Record<string, string> = {
    GET: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    POST: "bg-acid/15 text-acid border-acid/30",
    PATCH: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
    DELETE: "bg-v-red/15 text-v-red border-v-red/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded border font-mono text-[11px] font-bold tracking-widest ${map[m] ?? "bg-white/5 text-v-muted2 border-v-border2"}`}
    >
      {m}
    </span>
  );
}

/* ─── Section anchor ───────────────────────────────────────────────────────── */
function SectionHeader({
  id,
  icon: Icon,
  label,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div id={id} className="flex items-center gap-3 mb-6 pt-2">
      <div className="w-8 h-8 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-acid" />
      </div>
      <h2 className="font-mono text-xl font-bold tracking-tight">{label}</h2>
    </div>
  );
}

/* ─── Endpoint card ────────────────────────────────────────────────────────── */
interface EndpointProps {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  tiers?: string[];
  children?: React.ReactNode;
}

function Endpoint({
  method,
  path,
  description,
  auth = true,
  tiers,
  children,
}: EndpointProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-v-border2 rounded-lg overflow-hidden mb-4 hover:border-acid/20 transition-colors">
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
        onClick={() => setOpen((p) => !p)}
      >
        <Method m={method} />
        <code className="font-mono text-[13px] text-white flex-1">{path}</code>
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {auth && (
            <Badge label="AUTH" color="yellow" />
          )}
          {tiers?.map((t) => (
            <Badge key={t} label={t.toUpperCase()} color="muted" />
          ))}
          <ChevronRight
            className={`w-4 h-4 text-v-muted transition-transform ${open ? "rotate-90" : ""}`}
          />
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-v-border2 bg-white/[0.01]">
          <p className="font-mono text-[13px] text-v-muted mt-4 mb-2 leading-relaxed">
            {description}
          </p>
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Nav items ─────────────────────────────────────────────────────────────── */
const NAV = [
  { id: "authentication", label: "Authentication" },
  { id: "scans", label: "LLM Scans" },
  { id: "multi-turn", label: "Multi-Turn" },
  { id: "mcp", label: "MCP Scanner" },
  { id: "rag", label: "RAG Scanner" },
  { id: "sentinel", label: "Sentinel" },
  { id: "keys", label: "API Keys" },
  { id: "webhooks-api", label: "Webhooks" },
  { id: "billing-api", label: "Billing" },
  { id: "user-api", label: "User" },
  { id: "errors", label: "Errors" },
];

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-28 pb-20">
        {/* Hero */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2.5 font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-4">
            <span className="w-5 h-px bg-acid/35" />
            API Reference
            <span className="w-5 h-px bg-acid/35" />
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-4">
            VULNRA API
          </h1>
          <p className="text-[15px] text-v-muted font-light leading-relaxed max-w-2xl mb-6">
            REST API for programmatic access to all VULNRA scanning capabilities.
            Base URL:{" "}
            <code className="font-mono text-acid text-[13px] bg-acid/10 px-2 py-0.5 rounded">
              https://api.vulnra.ai
            </code>
          </p>
          <div className="flex flex-wrap gap-3">
            <Badge label="v1.0" color="green" />
            <Badge label="REST / JSON" color="muted" />
            <Badge label="JWT + API KEY" color="yellow" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-14">
          {/* ── Sticky TOC ───────────────────────────────────────── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-v-muted2 mb-3">
                Sections
              </div>
              <nav className="flex flex-col gap-0.5">
                {NAV.map((n) => (
                  <a
                    key={n.id}
                    href={`#${n.id}`}
                    className="font-mono text-[11px] text-v-muted2 hover:text-acid transition-colors py-1 flex items-center gap-2 group"
                  >
                    <span className="w-3 h-px bg-v-border2 group-hover:bg-acid/50 transition-colors shrink-0" />
                    {n.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 p-3 border border-v-border2 rounded-lg">
                <div className="font-mono text-[9px] tracking-widest uppercase text-acid mb-2">
                  Postman
                </div>
                <p className="font-mono text-[10.5px] text-v-muted2 leading-relaxed">
                  Download the Postman collection to get started quickly.
                </p>
                <a
                  href="https://app.vulnra.ai/postman-collection.json"
                  className="inline-flex items-center gap-1.5 mt-3 font-mono text-[10px] text-acid hover:underline"
                >
                  <Terminal className="w-3 h-3" /> Download →
                </a>
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────── */}
          <article className="space-y-16 min-w-0">

            {/* ── AUTHENTICATION ─────────────────────────────────── */}
            <section>
              <SectionHeader id="authentication" icon={Key} label="Authentication" />
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-4">
                All protected endpoints require an{" "}
                <code className="text-acid">Authorization</code> header. VULNRA
                supports two authentication methods:
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    title: "Supabase JWT",
                    desc: "Short-lived token from the Supabase dashboard or login flow. Suitable for web-app usage.",
                    code: "Authorization: Bearer <supabase_jwt>",
                  },
                  {
                    title: "API Key",
                    desc: "Long-lived key (vk_live_ prefix) from /settings/api-keys. Ideal for CI/CD and scripts.",
                    code: "Authorization: Bearer vk_live_xxxxxxxx",
                  },
                ].map((m) => (
                  <div
                    key={m.title}
                    className="border border-v-border2 rounded-lg p-4"
                  >
                    <div className="font-mono text-[12px] font-bold text-white mb-1">
                      {m.title}
                    </div>
                    <p className="font-mono text-[11px] text-v-muted2 leading-relaxed mb-3">
                      {m.desc}
                    </p>
                    <code className="font-mono text-[10.5px] text-acid bg-acid/5 px-2 py-1 rounded block break-all">
                      {m.code}
                    </code>
                  </div>
                ))}
              </div>

              <div className="border border-yellow-400/20 bg-yellow-400/5 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="font-mono text-[11.5px] text-v-muted leading-relaxed">
                  Never expose API keys in client-side code or public repositories.
                  Rotate a compromised key immediately from{" "}
                  <code className="text-acid">
                    DELETE /api/keys/{"{id}"}
                  </code>
                  .
                </p>
              </div>
            </section>

            {/* ── LLM SCANS ──────────────────────────────────────── */}
            <section>
              <SectionHeader id="scans" icon={Zap} label="LLM Scans" />

              <Endpoint
                method="POST"
                path="/api/scan"
                description="Start a new LLM API vulnerability scan. Returns a scan_id which you should poll with GET /api/scan/{id}."
                tiers={["free", "pro", "enterprise"]}
              >
                <div className="space-y-1 mt-4">
                  <div className="font-mono text-[10px] tracking-widest uppercase text-v-muted2 mb-2">
                    Request body
                  </div>
                  <CodeBlock
                    lang="json"
                    code={`{
  "url": "https://your-llm-api.example.com/chat",
  "method": "POST",
  "headers": { "Content-Type": "application/json" },
  "payload_template": "{ \\"message\\": \\"{{PROBE}}\\" }",
  "response_path": "choices[0].message.content",
  "scan_categories": ["prompt_injection", "jailbreak", "data_leakage"],
  "tier_override": null
}`}
                  />
                  <div className="font-mono text-[10px] tracking-widest uppercase text-v-muted2 mb-2">
                    cURL example
                  </div>
                  <CodeBlock
                    lang="bash"
                    code={`curl -X POST https://api.vulnra.ai/api/scan \\
  -H "Authorization: Bearer vk_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-api.example.com/v1/chat",
    "method": "POST",
    "payload_template": "{ \\"prompt\\": \\"{{PROBE}}\\" }",
    "response_path": "response"
  }'`}
                  />
                  <div className="font-mono text-[10px] tracking-widest uppercase text-v-muted2 mb-2">
                    Python example
                  </div>
                  <CodeBlock
                    lang="python"
                    code={`import requests

resp = requests.post(
    "https://api.vulnra.ai/api/scan",
    headers={"Authorization": "Bearer vk_live_your_key"},
    json={
        "url": "https://your-api.example.com/v1/chat",
        "method": "POST",
        "payload_template": '{ "prompt": "{{PROBE}}" }',
        "response_path": "response",
    },
)
scan_id = resp.json()["scan_id"]
print(f"Scan started: {scan_id}")`}
                  />
                </div>
              </Endpoint>

              <Endpoint
                method="GET"
                path="/api/scan/{id}"
                description="Poll scan status and retrieve results once complete. Status cycles: queued → running → complete | failed."
                tiers={["free", "pro", "enterprise"]}
              >
                <CodeBlock
                  lang="bash"
                  code={`curl https://api.vulnra.ai/api/scan/scan_abc123 \\
  -H "Authorization: Bearer vk_live_your_key"`}
                />
                <CodeBlock
                  lang="json"
                  code={`{
  "scan_id": "scan_abc123",
  "status": "complete",
  "risk_score": 74,
  "findings": [
    {
      "id": "f1",
      "category": "prompt_injection",
      "severity": "HIGH",
      "probe": "Ignore all previous instructions...",
      "response": "Sure! Here is how to...",
      "owasp_id": "LLM01",
      "remediation": "Apply input validation..."
    }
  ],
  "category_scores": { "prompt_injection": 80, "jailbreak": 60 },
  "scan_duration": 42.3
}`}
                />
              </Endpoint>

              <Endpoint
                method="GET"
                path="/api/scans"
                description="Paginated scan history. Returns most recent scans first."
                tiers={["free", "pro", "enterprise"]}
              >
                <CodeBlock
                  lang="bash"
                  code={`curl "https://api.vulnra.ai/api/scans?limit=20&offset=0" \\
  -H "Authorization: Bearer vk_live_your_key"`}
                />
              </Endpoint>

              <Endpoint
                method="GET"
                path="/api/scan/{id}/report"
                description="Download a PDF vulnerability report for a completed scan. Returns a binary PDF stream."
                tiers={["pro", "enterprise"]}
              >
                <CodeBlock
                  lang="bash"
                  code={`curl https://api.vulnra.ai/api/scan/scan_abc123/report \\
  -H "Authorization: Bearer vk_live_your_key" \\
  --output report.pdf`}
                />
              </Endpoint>

              <Endpoint
                method="POST"
                path="/api/scan/{id}/share"
                description="Generate a public share link for a scan report. The link is valid for 30 days and requires no authentication."
                tiers={["pro", "enterprise"]}
              >
                <CodeBlock
                  lang="json"
                  code={`// Response
{
  "share_url": "https://vulnra.ai/report/tok_xxxxxxxx",
  "expires_at": "2026-04-17T00:00:00Z"
}`}
                />
              </Endpoint>
            </section>

            {/* ── MULTI-TURN ─────────────────────────────────────── */}
            <section>
              <SectionHeader id="multi-turn" icon={RefreshCw} label="Multi-Turn Attacks" />
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-4">
                Run advanced multi-turn jailbreak attacks (Crescendo, GOAT) that
                iteratively refine prompts across multiple conversation turns.{" "}
                <Badge label="PRO+" color="yellow" />
              </p>

              <Endpoint
                method="POST"
                path="/api/multi-turn-scan"
                description="Launch a Crescendo or GOAT attack. Uses Claude Haiku as the attacker model with up to 10 turns."
                tiers={["pro", "enterprise"]}
              >
                <CodeBlock
                  lang="json"
                  code={`{
  "url": "https://your-api.example.com/chat",
  "method": "POST",
  "payload_template": "{ \\"message\\": \\"{{PROBE}}\\" }",
  "response_path": "reply",
  "attack_strategy": "crescendo",   // "crescendo" | "goat"
  "goal": "Extract training data",
  "max_turns": 10
}`}
                />
              </Endpoint>
            </section>

            {/* ── MCP ────────────────────────────────────────────── */}
            <section>
              <SectionHeader id="mcp" icon={Terminal} label="MCP Scanner" />
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-4">
                Scan Model Context Protocol (MCP) servers for tool poisoning,
                privilege escalation, and rug-pull attacks.{" "}
                <Badge label="PRO+" color="yellow" />
              </p>

              <Endpoint
                method="POST"
                path="/api/scan/mcp"
                description="Start an MCP server security scan. Probes tool definitions for injected instructions, excessive permissions, and schema manipulation."
                tiers={["pro", "enterprise"]}
              >
                <CodeBlock
                  lang="json"
                  code={`{
  "server_url": "ws://your-mcp-server:3000",
  "transport": "stdio",   // "stdio" | "websocket" | "http"
  "auth_token": "optional-token"
}`}
                />
              </Endpoint>

              <Endpoint
                method="GET"
                path="/api/scan/mcp/{id}"
                description="Poll MCP scan status and retrieve findings."
                tiers={["pro", "enterprise"]}
              />
            </section>

            {/* ── RAG ────────────────────────────────────────────── */}
            <section>
              <SectionHeader id="rag" icon={Database} label="RAG Scanner" />
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-4">
                Test RAG pipelines for corpus poisoning, cross-tenant leakage,
                query injection, unauthorized ingestion, and embedding exposure.{" "}
                <Badge label="PRO+" color="yellow" />
              </p>

              <Endpoint
                method="POST"
                path="/api/scan/rag"
                description="Start a RAG security scan. RAG-04 (unauth ingestion check) is available on all tiers. RAG-01/03/05 require Pro; RAG-02 requires Enterprise."
                tiers={["free", "pro", "enterprise"]}
              >
                <CodeBlock
                  lang="json"
                  code={`{
  "retrieval_endpoint": "https://your-rag.example.com/query",
  "ingestion_endpoint": "https://your-rag.example.com/ingest",
  "llm_endpoint": "https://your-rag.example.com/generate",
  "auth_headers": { "Authorization": "Bearer tenant_token" },
  "tenant_credentials": [
    { "Authorization": "Bearer tenant_a_token" },
    { "Authorization": "Bearer tenant_b_token" }
  ],
  "use_case": "customer support bot"
}`}
                />
              </Endpoint>

              <Endpoint
                method="GET"
                path="/api/scan/rag/{id}"
                description="Poll RAG scan status and retrieve the full RAGScanResult including probe-level findings."
                tiers={["free", "pro", "enterprise"]}
              >
                <CodeBlock
                  lang="json"
                  code={`{
  "id": "rag_abc123",
  "status": "complete",
  "risk_score": 68.5,
  "corpus_poisoning_rate": 0.4,
  "cross_tenant_leakage": false,
  "unauthenticated_ingestion": true,
  "embedding_vectors_exposed": false,
  "findings": [ ... ],
  "scan_duration": 18.2
}`}
                />
              </Endpoint>
            </section>

            {/* ── SENTINEL ───────────────────────────────────────── */}
            <section>
              <SectionHeader id="sentinel" icon={Eye} label="Sentinel Monitoring" />
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-4">
                Continuous monitoring watches — re-scan your endpoints on a
                schedule and alert on risk score spikes or new HIGH findings.{" "}
                <Badge label="PRO+" color="yellow" />
              </p>

              <Endpoint
                method="POST"
                path="/api/monitor"
                description="Create a Sentinel watch. Pro: up to 5 watches, 24h min interval. Enterprise: 50 watches, 1h min interval."
                tiers={["pro", "enterprise"]}
              >
                <CodeBlock
                  lang="json"
                  code={`{
  "url": "https://your-api.example.com/v1/chat",
  "method": "POST",
  "payload_template": "{ \\"message\\": \\"{{PROBE}}\\" }",
  "response_path": "response",
  "interval_hours": 24,
  "alert_email": "security@yourcompany.com"
}`}
                />
              </Endpoint>

              <Endpoint
                method="GET"
                path="/api/monitor"
                description="List all Sentinel watches for the authenticated user."
                tiers={["pro", "enterprise"]}
              />

              <Endpoint
                method="DELETE"
                path="/api/monitor/{id}"
                description="Delete a Sentinel watch and stop future scheduled scans."
                tiers={["pro", "enterprise"]}
              />
            </section>

            {/* ── API KEYS ───────────────────────────────────────── */}
            <section>
              <SectionHeader id="keys" icon={Key} label="API Keys" />
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-4">
                Manage programmatic API keys. Free: 3 keys. Pro: 20 keys.
                Enterprise: unlimited.
              </p>

              <Endpoint
                method="POST"
                path="/api/keys"
                description="Create a new API key. The raw secret (vk_live_ format) is only returned once at creation time — store it securely."
              >
                <CodeBlock
                  lang="json"
                  code={`// Request
{ "name": "CI/CD Pipeline" }

// Response (secret shown once only)
{
  "id": "key_abc",
  "name": "CI/CD Pipeline",
  "key": "vk_live_xxxxxxxxxxxxxxxxxxxx",
  "created_at": "2026-03-17T10:00:00Z"
}`}
                />
              </Endpoint>

              <Endpoint
                method="GET"
                path="/api/keys"
                description="List all API keys (secret is never returned after creation)."
              />

              <Endpoint
                method="DELETE"
                path="/api/keys/{id}"
                description="Revoke an API key immediately. Any in-flight requests using this key will fail."
              />
            </section>

            {/* ── WEBHOOKS ───────────────────────────────────────── */}
            <section>
              <SectionHeader id="webhooks-api" icon={Webhook} label="Webhooks" />
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-4">
                Receive real-time HTTP notifications when scans complete or
                Sentinel alerts fire. Pro: 3 endpoints. Enterprise: 20 endpoints.{" "}
                <Badge label="PRO+" color="yellow" />
              </p>
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-4">
                All webhook payloads are signed with{" "}
                <code className="text-acid">HMAC-SHA256</code>. Verify the{" "}
                <code className="text-acid">X-VULNRA-Signature</code> header
                against the signing secret shown once at creation.
              </p>

              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {[
                  {
                    event: "scan.complete",
                    desc: "Fired when any scan finishes (all tiers)",
                  },
                  {
                    event: "sentinel.alert",
                    desc: "Fired when Sentinel detects a risk spike or new HIGH finding",
                  },
                  {
                    event: "scan.failed",
                    desc: "Fired when a scan errors out before completion",
                  },
                ].map((e) => (
                  <div
                    key={e.event}
                    className="border border-v-border2 rounded-lg p-3"
                  >
                    <code className="font-mono text-[11px] text-acid block mb-1">
                      {e.event}
                    </code>
                    <p className="font-mono text-[10.5px] text-v-muted2 leading-relaxed">
                      {e.desc}
                    </p>
                  </div>
                ))}
              </div>

              <Endpoint
                method="POST"
                path="/api/webhooks"
                description="Register a new webhook endpoint."
                tiers={["pro", "enterprise"]}
              >
                <CodeBlock
                  lang="json"
                  code={`// Request
{
  "name": "Slack Alert",
  "url": "https://hooks.slack.com/services/xxx/yyy/zzz",
  "events": ["scan.complete", "sentinel.alert"]
}

// Response
{
  "id": "wh_abc",
  "name": "Slack Alert",
  "secret": "whsec_xxxxxxxxxxxx",  // shown once only
  "active": true,
  "created_at": "2026-03-17T10:00:00Z"
}`}
                />
                <div className="font-mono text-[10px] tracking-widest uppercase text-v-muted2 mb-2">
                  Signature verification
                </div>
                <CodeBlock
                  lang="python"
                  code={`import hmac, hashlib

def verify_signature(payload_bytes: bytes, header: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(), payload_bytes, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", header)

# In your webhook handler:
sig = request.headers.get("X-VULNRA-Signature", "")
if not verify_signature(request.body, sig, "whsec_xxxx"):
    return 401`}
                />
              </Endpoint>

              <Endpoint
                method="GET"
                path="/api/webhooks"
                description="List all registered webhook endpoints."
                tiers={["pro", "enterprise"]}
              />

              <Endpoint
                method="PATCH"
                path="/api/webhooks/{id}"
                description="Update webhook name, URL, events, or active status."
                tiers={["pro", "enterprise"]}
              />

              <Endpoint
                method="DELETE"
                path="/api/webhooks/{id}"
                description="Delete a webhook endpoint permanently."
                tiers={["pro", "enterprise"]}
              />

              <Endpoint
                method="POST"
                path="/api/webhooks/{id}/test"
                description="Send a test payload to the webhook endpoint and return the delivery status."
                tiers={["pro", "enterprise"]}
              />
            </section>

            {/* ── BILLING ────────────────────────────────────────── */}
            <section>
              <SectionHeader id="billing-api" icon={Globe} label="Billing" />

              <Endpoint
                method="GET"
                path="/billing/subscription"
                description="Get current subscription tier and Lemon Squeezy subscription ID."
              >
                <CodeBlock
                  lang="json"
                  code={`{
  "tier": "pro",
  "subscription_id": "sub_xxxxxxxx",
  "renews_at": "2026-04-17T00:00:00Z"
}`}
                />
              </Endpoint>

              <Endpoint
                method="GET"
                path="/billing/plans"
                description="Retrieve static plan definitions (features, prices, limits). No auth required."
                auth={false}
              />

              <Endpoint
                method="POST"
                path="/billing/checkout"
                description="Create a Lemon Squeezy checkout session. Returns a redirect URL."
              >
                <CodeBlock
                  lang="json"
                  code={`// Request
{ "plan": "pro", "period": "monthly" }

// Response
{ "checkout_url": "https://vulnra.lemonsqueezy.com/checkout/..." }`}
                />
              </Endpoint>

              <Endpoint
                method="POST"
                path="/billing/cancel"
                description="Cancel the active subscription. Access downgrades to Free at end of billing period."
              />
            </section>

            {/* ── USER ───────────────────────────────────────────── */}
            <section>
              <SectionHeader id="user-api" icon={Shield} label="User" />

              <Endpoint
                method="GET"
                path="/api/user/profile"
                description="Get the authenticated user's profile, tier, and notification preferences."
              >
                <CodeBlock
                  lang="json"
                  code={`{
  "id": "usr_abc",
  "email": "you@example.com",
  "tier": "pro",
  "display_name": "Jane Doe",
  "notification_email": null,
  "alert_threshold": 20,
  "alert_new_high": true,
  "alert_scan_complete": false
}`}
                />
              </Endpoint>

              <Endpoint
                method="PATCH"
                path="/api/user/profile"
                description="Update display_name and/or notification_email."
              />

              <Endpoint
                method="PATCH"
                path="/api/user/notifications"
                description="Update alert preferences (threshold, high-severity alerts, scan-complete alerts)."
              >
                <CodeBlock
                  lang="json"
                  code={`{
  "alert_threshold": 25,
  "alert_new_high": true,
  "alert_scan_complete": false,
  "notification_email": "alerts@yourcompany.com"
}`}
                />
              </Endpoint>

              <Endpoint
                method="DELETE"
                path="/api/user"
                description="Permanently delete the authenticated user account. All scans, API keys, watches, and webhooks are immediately revoked."
              />
            </section>

            {/* ── ERRORS ─────────────────────────────────────────── */}
            <section>
              <SectionHeader id="errors" icon={AlertCircle} label="Error Codes" />
              <p className="font-mono text-[13px] text-v-muted leading-[1.8] mb-6">
                All errors follow a consistent JSON envelope. The{" "}
                <code className="text-acid">detail</code> field contains a
                human-readable message.
              </p>
              <CodeBlock
                lang="json"
                code={`{
  "detail": "Quota exceeded. Free tier allows 1 scan per day.",
  "code": "QUOTA_EXCEEDED",
  "tier": "free"
}`}
              />
              <div className="border border-v-border2 rounded-lg overflow-hidden">
                <table className="w-full font-mono text-[12px]">
                  <thead className="bg-white/[0.03] border-b border-v-border2">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-v-muted2">
                        HTTP Status
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-v-muted2">
                        Code
                      </th>
                      <th className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-v-muted2">
                        Meaning
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-v-border2">
                    {[
                      ["400", "VALIDATION_ERROR", "Request body failed schema validation"],
                      ["401", "UNAUTHORIZED", "Missing or invalid Authorization header"],
                      ["403", "FORBIDDEN", "Action not permitted on your current tier"],
                      ["404", "NOT_FOUND", "Scan or resource does not exist"],
                      ["422", "UNPROCESSABLE", "Valid JSON but logically invalid values"],
                      ["429", "RATE_LIMITED", "Too many requests — check Retry-After header"],
                      ["402", "QUOTA_EXCEEDED", "Daily scan quota exhausted for your tier"],
                      ["500", "INTERNAL_ERROR", "Unexpected server error — contact support"],
                    ].map(([status, code, meaning]) => (
                      <tr key={code} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-acid">{status}</td>
                        <td className="px-4 py-3 text-v-muted">{code}</td>
                        <td className="px-4 py-3 text-v-muted2">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rate Limits */}
              <div className="mt-8">
                <h3 className="font-mono text-[14px] font-bold text-white mb-4">
                  Rate Limits
                </h3>
                <div className="border border-v-border2 rounded-lg overflow-hidden">
                  <table className="w-full font-mono text-[12px]">
                    <thead className="bg-white/[0.03] border-b border-v-border2">
                      <tr>
                        {["Tier", "Requests / min", "Scans / day"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-v-muted2"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-v-border2">
                      {[
                        ["Free", "1", "1"],
                        ["Pro", "10", "100"],
                        ["Enterprise", "100", "Unlimited"],
                      ].map(([tier, rpm, spd]) => (
                        <tr key={tier} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3 text-white">{tier}</td>
                          <td className="px-4 py-3 text-acid">{rpm}</td>
                          <td className="px-4 py-3 text-v-muted">{spd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* ── Footer CTA ─────────────────────────────────────── */}
            <div className="border border-acid/20 rounded-xl p-8 bg-acid/5 text-center">
              <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-3">
                Get Started
              </div>
              <h3 className="font-mono text-2xl font-bold mb-3">
                Ready to integrate VULNRA?
              </h3>
              <p className="font-mono text-[13px] text-v-muted mb-6 max-w-lg mx-auto leading-relaxed">
                Create your free account, grab an API key from{" "}
                <code className="text-acid">/settings/api-keys</code>, and run
                your first scan in under 5 minutes.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 bg-acid text-black font-mono text-[12px] tracking-widest uppercase px-6 py-3 rounded-lg font-bold hover:bg-acid/90 transition-colors"
                >
                  Start Free <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 border border-v-border2 text-v-muted font-mono text-[12px] tracking-widest uppercase px-6 py-3 rounded-lg hover:border-acid/30 hover:text-white transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
