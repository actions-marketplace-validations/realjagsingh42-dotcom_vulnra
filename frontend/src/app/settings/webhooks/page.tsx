"use client";

import { useState, useEffect } from "react";
import {
  Webhook,
  Plus,
  Trash2,
  Play,
  Copy,
  CheckCheck,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Zap,
  Building2,
  Shield,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const EVENTS = [
  {
    id: "scan.complete",
    label: "scan.complete",
    desc: "Fires when any scan finishes (success or failed)",
  },
  {
    id: "sentinel.alert",
    label: "sentinel.alert",
    desc: "Fires when Sentinel detects a risk spike or new HIGH finding",
  },
  {
    id: "scan.failed",
    label: "scan.failed",
    desc: "Fires when a scan fails with an engine error",
  },
];

const TIER_LIMITS: Record<string, number> = {
  free: 0,
  pro: 3,
  enterprise: 20,
};

async function getToken() {
  const { createClient } = await import("@/utils/supabase/client");
  const sb = createClient();
  const { data } = await sb.auth.getSession();
  return data.session?.access_token || null;
}

interface Hook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  created_at: string;
  last_triggered_at: string | null;
  last_status: string | null;
  last_status_code: number | null;
}

function StatusDot({ status }: { status: string | null }) {
  if (!status) return <span className="w-2 h-2 rounded-full bg-white/15 inline-block" />;
  return (
    <span
      className={cn(
        "w-2 h-2 rounded-full inline-block",
        status === "success" ? "bg-acid" : "bg-v-red"
      )}
    />
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WebhooksPage() {
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [limit, setLimit] = useState(0);
  const [tier, setTier] = useState("free");
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>(["scan.complete"]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newSecret, setNewSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);

  // Test / delete state
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchHooks = async () => {
    const token = await getToken();
    if (!token) return;
    const resp = await fetch(`${API}/api/webhooks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (resp.ok) {
      const d = await resp.json();
      setHooks(d.webhooks || []);
      setLimit(d.limit ?? 0);
      setTier(d.tier || "free");
    }
    setLoading(false);
  };

  useEffect(() => { fetchHooks(); }, []);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const token = await getToken();
      if (!token) return;
      const resp = await fetch(`${API}/api/webhooks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName, url: newUrl, events: newEvents }),
      });
      if (resp.ok) {
        const d = await resp.json();
        setNewSecret(d.secret);
        setNewName("");
        setNewUrl("");
        setNewEvents(["scan.complete"]);
        setShowCreate(false);
        await fetchHooks();
      } else {
        const e = await resp.json();
        setCreateError(e.detail || "Failed to create webhook");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const token = await getToken();
      if (!token) return;
      await fetch(`${API}/api/webhooks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setHooks((prev) => prev.filter((h) => h.id !== id));
      setConfirmDelete(null);
    } finally {
      setDeleting(null);
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    setTestResult(null);
    try {
      const token = await getToken();
      if (!token) return;
      const resp = await fetch(`${API}/api/webhooks/${id}/test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await resp.json();
      setTestResult({ id, ok: d.success, msg: d.message });
      setTimeout(() => setTestResult(null), 5000);
    } finally {
      setTesting(null);
    }
  };

  const copySecret = async () => {
    if (!newSecret) return;
    await navigator.clipboard.writeText(newSecret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 3000);
  };

  // ── Upgrade gate ─────────────────────────────────────────────
  if (!loading && tier === "free") {
    return (
      <div className="space-y-5 max-w-[680px]">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">Webhooks</h1>
          <p className="font-mono text-[12px] text-v-muted2">
            Receive real-time HTTP POST notifications when scans complete or Sentinel fires.
          </p>
        </div>
        <div className="border border-v-border2 rounded-sm p-8 text-center bg-v-bg1">
          <Lock className="w-8 h-8 text-v-muted2 mx-auto mb-4" />
          <div className="font-mono text-[13px] font-semibold text-foreground mb-2">
            Webhooks require Pro or Enterprise
          </div>
          <p className="font-mono text-[11.5px] text-v-muted2 mb-5">
            Upgrade to Pro to configure up to 3 webhook endpoints and receive real-time scan events in your CI/CD pipeline.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-bold tracking-widest bg-acid text-black px-5 py-2.5 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(184,255,87,0.2)] transition-all"
          >
            <Zap className="w-3.5 h-3.5" /> Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[760px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">Webhooks</h1>
          <p className="font-mono text-[12px] text-v-muted2">
            POST signed payloads to your URL on scan events. HMAC-SHA256 verified via{" "}
            <code className="text-acid">X-VULNRA-Signature</code>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="font-mono text-[10px] text-v-muted2 bg-v-bg1 border border-v-border2 px-2.5 py-1.5 rounded-sm">
            {tier === "enterprise" ? (
              <Building2 className="w-3 h-3 inline mr-1 text-[#4db8ff]" />
            ) : (
              <Zap className="w-3 h-3 inline mr-1 text-acid" />
            )}
            {hooks.length} / {limit === 9999 ? "∞" : limit} webhooks
          </div>
          {hooks.length < limit && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-widest px-3.5 py-1.5 rounded-sm bg-acid text-black hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(184,255,87,0.2)] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add webhook
            </button>
          )}
        </div>
      </div>

      {/* Secret reveal banner */}
      {newSecret && (
        <div className="border border-acid/30 bg-acid/5 rounded-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-acid" />
            <span className="font-mono text-[12px] font-semibold text-acid">Webhook created — save your secret now</span>
          </div>
          <p className="font-mono text-[11px] text-v-muted2 mb-3">
            This secret is shown only once. Use it to verify{" "}
            <code className="text-acid">X-VULNRA-Signature</code> on incoming requests.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-[11.5px] text-foreground bg-background border border-v-border2 px-3 py-2 rounded-sm truncate">
              {newSecret}
            </code>
            <button
              onClick={copySecret}
              className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest px-3 py-2 border border-v-border rounded-sm text-v-muted hover:text-acid hover:border-acid/30 transition-all"
            >
              {secretCopied ? <CheckCheck className="w-3.5 h-3.5 text-acid" /> : <Copy className="w-3.5 h-3.5" />}
              {secretCopied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => setNewSecret(null)}
              className="font-mono text-[10px] text-v-muted2 hover:text-acid transition-colors px-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="border border-acid/20 rounded-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-v-bg1 border-b border-v-border2 font-mono text-[12px] font-semibold text-foreground">
            New webhook
          </div>
          <div className="p-5 bg-background space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
                  Name
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Slack CI alerts"
                  className="w-full font-mono text-[13px] bg-v-bg1 border border-v-border2 rounded-sm px-3 py-2.5 text-foreground placeholder:text-v-muted2 focus:outline-none focus:border-acid/50 transition-colors"
                />
              </div>
              <div>
                <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-1.5 block">
                  URL
                </label>
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://your-server.com/webhook"
                  className="w-full font-mono text-[13px] bg-v-bg1 border border-v-border2 rounded-sm px-3 py-2.5 text-foreground placeholder:text-v-muted2 focus:outline-none focus:border-acid/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-[10.5px] tracking-wider text-v-muted2 uppercase mb-2 block">
                Events
              </label>
              <div className="space-y-1.5">
                {EVENTS.map((ev) => (
                  <label key={ev.id} className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={newEvents.includes(ev.id)}
                      onChange={(e) =>
                        setNewEvents((prev) =>
                          e.target.checked ? [...prev, ev.id] : prev.filter((x) => x !== ev.id)
                        )
                      }
                      className="mt-0.5 accent-[#b8ff57]"
                    />
                    <div>
                      <span className="font-mono text-[11.5px] text-foreground group-hover:text-acid transition-colors">
                        {ev.label}
                      </span>
                      <span className="font-mono text-[10.5px] text-v-muted2 ml-2">{ev.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            {createError && (
              <div className="flex items-center gap-2 font-mono text-[11px] text-v-red">
                <AlertTriangle className="w-3.5 h-3.5" /> {createError}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !newName.trim() || !newUrl.trim() || newEvents.length === 0}
                className="flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-widest px-4 py-2.5 rounded-sm bg-acid text-black hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Create webhook
              </button>
              <button
                onClick={() => { setShowCreate(false); setCreateError(null); }}
                className="font-mono text-[10.5px] tracking-widest px-4 py-2.5 rounded-sm border border-v-border text-v-muted hover:border-white/20 hover:text-foreground transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Webhooks list */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-5 h-5 text-acid animate-spin" />
        </div>
      ) : hooks.length === 0 ? (
        <div className="border border-v-border2 rounded-sm p-10 text-center bg-v-bg1">
          <Webhook className="w-8 h-8 text-v-muted2 mx-auto mb-3" />
          <div className="font-mono text-[12.5px] text-v-muted2 mb-1">No webhooks yet</div>
          <div className="font-mono text-[11px] text-v-muted2">
            Add a webhook to receive real-time scan events in your systems.
          </div>
        </div>
      ) : (
        <div className="border border-v-border2 rounded-sm overflow-hidden">
          <div className="divide-y divide-v-border2">
            {hooks.map((hook) => (
              <div key={hook.id} className="p-4 hover:bg-white/[0.015] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <StatusDot status={hook.last_status} />
                      <span className="font-mono text-[13px] font-semibold text-foreground">
                        {hook.name}
                      </span>
                      {!hook.active && (
                        <span className="font-mono text-[8px] border border-white/10 text-v-muted2 px-1.5 py-0.5 rounded-sm">
                          PAUSED
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-v-muted2 truncate mb-2">
                      {hook.url}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {hook.events.map((ev) => (
                        <span
                          key={ev}
                          className="font-mono text-[9px] text-acid bg-acid/8 border border-acid/15 px-2 py-0.5 rounded-sm"
                        >
                          {ev}
                        </span>
                      ))}
                      <span className="font-mono text-[9px] text-v-muted2 ml-2">
                        Last triggered: {formatDate(hook.last_triggered_at)}
                        {hook.last_status_code ? ` · HTTP ${hook.last_status_code}` : ""}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Test */}
                    <button
                      onClick={() => handleTest(hook.id)}
                      disabled={testing === hook.id}
                      title="Send test payload"
                      className="flex items-center gap-1 font-mono text-[9.5px] tracking-wider px-2.5 py-1.5 rounded-sm border border-v-border text-v-muted2 hover:text-acid hover:border-acid/30 transition-all disabled:opacity-50"
                    >
                      {testing === hook.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3" />
                      )}
                      Test
                    </button>
                    {/* Delete */}
                    {confirmDelete === hook.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(hook.id)}
                          disabled={deleting === hook.id}
                          className="font-mono text-[9.5px] px-2.5 py-1.5 rounded-sm bg-v-red/20 border border-v-red/40 text-v-red hover:bg-v-red/30 transition-all"
                        >
                          {deleting === hook.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="font-mono text-[9.5px] px-2 py-1.5 text-v-muted2 hover:text-acid transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(hook.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-sm border border-v-border text-v-muted2 hover:text-v-red hover:border-v-red/30 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Test result inline */}
                {testResult?.id === hook.id && (
                  <div
                    className={cn(
                      "mt-2 flex items-center gap-1.5 text-[10.5px] font-mono",
                      testResult.ok ? "text-acid" : "text-v-red"
                    )}
                  >
                    {testResult.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                    {testResult.msg}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signing guide */}
      <div className="border border-v-border2 rounded-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-v-bg1 border-b border-v-border2">
          <div className="font-mono text-[12px] font-semibold text-foreground">
            Verifying signatures
          </div>
        </div>
        <pre className="p-5 font-mono text-[11px] leading-[1.7] text-v-muted overflow-x-auto bg-background">
          <code>{`# Python — verify X-VULNRA-Signature header
import hmac, hashlib

def verify_signature(secret: str, body: bytes, header: str) -> bool:
    expected = "sha256=" + hmac.new(
        secret.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, header)

# Node.js
const crypto = require('crypto');
function verify(secret, body, header) {
  const sig = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(body).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(sig), Buffer.from(header)
  );
}`}</code>
        </pre>
      </div>
    </div>
  );
}
