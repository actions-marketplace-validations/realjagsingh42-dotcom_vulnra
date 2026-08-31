"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, Download, ChevronDown,
  ChevronRight, Loader2, Minus, Check, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getInterceptEvents, getPolicyPacks, getComplianceSummary, activatePolicyPack,
} from "@/utils/api-client";
import type { InterceptEvent, PolicyPack, ComplianceSummary } from "@/types/api";

// ── OWASP category definitions ─────────────────────────────────────────────

const OWASP_CATEGORIES = [
  { id: "LLM01", name: "Prompt Injection",       intent: "prompt_injection" },
  { id: "LLM02", name: "Insecure Output",        intent: "insecure_output" },
  { id: "LLM03", name: "Training Data Poison",   intent: "training_data_poisoning" },
  { id: "LLM04", name: "Model DoS",              intent: "model_dos" },
  { id: "LLM05", name: "Supply Chain",           intent: "supply_chain" },
  { id: "LLM06", name: "Sensitive Info Disc.",   intent: "sensitive_info_disclosure" },
  { id: "LLM07", name: "Insecure Plugin",        intent: "insecure_plugin" },
  { id: "LLM08", name: "Excessive Agency",       intent: "excessive_agency" },
  { id: "LLM09", name: "Overreliance",           intent: "overreliance" },
  { id: "LLM10", name: "Model Theft",            intent: "model_theft" },
  { id: "PII",   name: "PII Leakage",            intent: "pii_detected" },
  { id: "EXFIL", name: "Data Exfiltration",      intent: "data_exfiltration" },
  { id: "JB",    name: "Jailbreak",              intent: "jailbreak" },
  { id: "CRED",  name: "Credentials",            intent: "credential_leakage" },
];

const INTENT_TO_CATEGORY = Object.fromEntries(
  OWASP_CATEGORIES.map((c) => [c.intent, c])
);

const ACTION_COLORS: Record<string, string> = {
  DENY:          "bg-v-red",
  QUARANTINE:    "bg-orange-500",
  HUMAN_REVIEW:  "bg-yellow-500",
  LOG:           "bg-blue-500",
  ALLOW:         "bg-gray-500",
};

const ACTION_LABELS: Record<string, string> = {
  DENY:          "Denied",
  QUARANTINE:    "Quarantined",
  HUMAN_REVIEW:  "Flagged",
  LOG:           "Logged",
  ALLOW:         "Allowed",
};

function formatTime(ts: string): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  } catch {
    return ts;
  }
}

function riskBarColor(score: number): string {
  if (score >= 0.7) return "bg-v-red";
  if (score >= 0.4) return "bg-v-amber";
  return "bg-acid";
}

// ── Skeleton loader ────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="p-3 border border-v-border rounded-sm animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-24 bg-white/5 rounded" />
        <div className="h-4 w-14 bg-white/5 rounded" />
      </div>
      <div className="h-2 w-full bg-white/5 rounded mb-1" />
      <div className="h-2 w-3/4 bg-white/5 rounded" />
    </div>
  );
}

// ── Event card ─────────────────────────────────────────────────────────────

function EventCard({ event }: { event: InterceptEvent }) {
  const [expanded, setExpanded] = useState(false);

  const truncated =
    event.prompt.length > 120
      ? event.prompt.slice(0, 120) + "..."
      : event.prompt;

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left p-3 border border-v-border rounded-sm bg-black/20 hover:bg-white/[0.02] transition-colors cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[9px] font-mono text-v-muted2 shrink-0">
          {formatTime(event.timestamp)}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          {event.intent && (
            <span className="text-[8px] font-mono px-1.5 py-0.5 bg-white/5 border border-v-border rounded text-v-muted2 uppercase">
              {event.intent.replace(/_/g, " ")}
            </span>
          )}
          <span className={cn(
            "text-[8px] font-mono px-1.5 py-0.5 rounded text-white font-bold tracking-wider",
            ACTION_COLORS[event.action_taken] ?? "bg-gray-500"
          )}>
            {ACTION_LABELS[event.action_taken] ?? event.action_taken}
          </span>
        </div>
      </div>

      {/* Risk score bar */}
      {event.risk_score !== undefined && event.risk_score !== null && (
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-2">
          <div
            className={cn("h-full rounded-full transition-all", riskBarColor(event.risk_score))}
            style={{ width: `${Math.min(event.risk_score * 100, 100)}%` }}
          />
        </div>
      )}

      {/* Prompt preview */}
      <p className="text-[10px] font-mono text-v-muted leading-relaxed">
        {expanded ? event.prompt : truncated}
      </p>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-2 space-y-1.5 border-t border-v-border/40 pt-2">
          {event.response && (
            <div className="p-2 bg-black/30 border border-v-border rounded">
              <div className="text-[8px] font-mono text-v-muted2 uppercase tracking-wider mb-0.5">Response</div>
              <code className="text-[9px] text-v-muted2 break-all leading-relaxed whitespace-pre-wrap">
                {event.response}
              </code>
            </div>
          )}
          {event.rule_matched && (
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-mono text-v-muted2">Rule:</span>
              <span className="text-[8px] font-mono px-1 py-0.5 bg-acid/5 border border-acid/15 rounded text-acid">
                {event.rule_matched}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-[8px] font-mono text-v-muted2">
            <span>ID: {event.id.slice(0, 8)}</span>
            {event.probe_index !== null && event.probe_index !== undefined && (
              <span>Probe: #{event.probe_index}</span>
            )}
            {event.pii_detected && (
              <span className="text-v-red">PII Flagged</span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────

interface ShieldTabProps {
  scanId: string;
  scanStatus: "pending" | "running" | "complete" | "failed";
  isAdmin: boolean;
  onBlockedCount?: (count: number) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ShieldTab({ scanId, scanStatus, isAdmin, onBlockedCount }: ShieldTabProps) {
  const [events, setEvents] = useState<InterceptEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [packs, setPacks] = useState<PolicyPack[]>([]);
  const [packsLoading, setPacksLoading] = useState(true);
  const [activePack, setActivePack] = useState<string | null>(null);
  const [activePackRules, setActivePackRules] = useState(0);
  const [switchingPack, setSwitchingPack] = useState(false);

  // Compliance export
  const todayRaw = new Date();
  const thirtyDaysAgo = new Date(todayRaw.getTime() - 30 * 86400000);
  const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(fmtDate(thirtyDaysAgo));
  const [endDate, setEndDate] = useState(fmtDate(todayRaw));
  const [exporting, setExporting] = useState<"json" | "summary" | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<ComplianceSummary | null>(null);

  // ── Fetch intercept events ──────────────────────────────────────────────

  const fetchEvents = useCallback(async (append = false) => {
    try {
      const nextOffset = append ? offset : 0;
      const data = await getInterceptEvents(scanId, 50, nextOffset);
      if (append) {
        setEvents((prev) => [...prev, ...data]);
      } else {
        setEvents(data);
        // Report blocked count on first fetch
        const blocked = data.filter(
          (e) => e.action_taken === "DENY" || e.action_taken === "QUARANTINE"
        ).length;
        onBlockedCount?.(blocked);
      }
      setHasMore(data.length === 50);
      setOffset(nextOffset + data.length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [scanId, offset, onBlockedCount]);

  useEffect(() => {
    setLoading(true);
    fetchEvents(false);
  }, [fetchEvents]);

  // Poll while running
  useEffect(() => {
    if (scanStatus !== "running") return;
    const interval = setInterval(() => {
      fetchEvents(false);
    }, 10_000);
    return () => clearInterval(interval);
  }, [scanStatus, fetchEvents]);

  // ── Fetch policy packs ──────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const data = await getPolicyPacks();
        setPacks(data);
        // Guess active pack from localStorage or first pack
        const saved = localStorage.getItem("vulnra_active_policy_pack");
        if (saved && data.find((p) => p.name === saved)) {
          setActivePack(saved);
          const match = data.find((p) => p.name === saved);
          setActivePackRules(match?.rule_count ?? 0);
        } else if (data.length > 0) {
          setActivePack(data[0].name);
          setActivePackRules(data[0].rule_count);
        }
      } catch {
        // degrade gracefully
      } finally {
        setPacksLoading(false);
      }
    }
    load();
  }, []);

  // ── Coverage heatmap ────────────────────────────────────────────────────

  const coverage = useMemo(() => {
    const eventIntents = new Set(events.map((e) => e.intent).filter(Boolean));
    const packIntents = new Set<string>();
    if (activePack) {
      const pack = packs.find((p) => p.name === activePack);
      if (pack) {
        for (const cat of OWASP_CATEGORIES) {
          if (pack.filename.includes("hipaa") && cat.intent === "pii_detected") packIntents.add(cat.intent);
          if (pack.filename.includes("soc2") && ["insecure_output", "supply_chain", "sensitive_info_disclosure"].includes(cat.intent)) packIntents.add(cat.intent);
          // Generic: match rule name containing intent string
          if (pack.name.toLowerCase().includes(cat.intent)) packIntents.add(cat.intent);
        }
      }
    }
    return OWASP_CATEGORIES.map((cat) => {
      const hasEvent = eventIntents.has(cat.intent);
      const hasPackRule = packIntents.has(cat.intent);
      return { ...cat, status: hasEvent ? "COVERED" as const : hasPackRule ? "ACTIVE" as const : "UNCOVERED" as const };
    });
  }, [events, activePack, packs]);

  // ── Load more ───────────────────────────────────────────────────────────

  const handleLoadMore = useCallback(async () => {
    try {
      const data = await getInterceptEvents(scanId, 50, offset);
      setEvents((prev) => [...prev, ...data]);
      setHasMore(data.length === 50);
      setOffset((prev) => prev + data.length);
    } catch {
      // silent
    }
  }, [scanId, offset]);

  // ── Pack switch ─────────────────────────────────────────────────────────

  const handleActivatePack = useCallback(async (name: string) => {
    setSwitchingPack(true);
    try {
      await activatePolicyPack(name);
      localStorage.setItem("vulnra_active_policy_pack", name);
      setActivePack(name);
      const match = packs.find((p) => p.name === name);
      setActivePackRules(match?.rule_count ?? 0);
    } catch {
      // silent
    } finally {
      setSwitchingPack(false);
    }
  }, [packs]);

  // ── Compliance export ───────────────────────────────────────────────────

  const handleExport = useCallback(async (format: "json" | "summary") => {
    setExporting(format);
    setExportError(null);
    setSummaryData(null);
    try {
      const data = await getComplianceSummary(startDate, endDate, format);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vulnra-audit-${scanId.slice(0, 8)}-${fmtDate(todayRaw)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10_000);

      if (format === "summary") setSummaryData(data);
    } catch {
      setExportError("Export failed — try again later.");
    } finally {
      setExporting(null);
    }
  }, [startDate, endDate, scanId]);

  // ── Blocked count (for badge) ───────────────────────────────────────────

  const blockedCount = events.filter(
    (e) => e.action_taken === "DENY" || e.action_taken === "QUARANTINE"
  ).length;

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Veea Lobster Trap badge */}
      <div className="flex items-center gap-2 px-2.5 py-2 bg-blue-500/5 border border-blue-500/20 rounded-sm">
        <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
        <span className="text-[8px] font-mono text-blue-400/80 tracking-wider">
          Veea Lobster Trap
        </span>
        <span className="text-[7px] font-mono tracking-widest px-1 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400/60 ml-auto">
          POWERED BY GEMINI
        </span>
      </div>

      {/* Section A: Intercept Timeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8.5px] font-mono tracking-widest text-v-muted2 uppercase">
            Intercept Events
          </span>
          {!loading && (
            <span className="text-[8px] font-mono text-v-muted2">
              {events.length} event{events.length !== 1 ? "s" : ""}
              {blockedCount > 0 && (
                <span className="ml-1 text-v-red">
                  ({blockedCount} blocked)
                </span>
              )}
            </span>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2 custom-scrollbar pr-1">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 opacity-40">
              <Shield className="w-8 h-8" />
              <span className="text-[9px] font-mono tracking-widest uppercase text-center">
                No intercept events yet
              </span>
            </div>
          ) : (
            events.map((evt) => <EventCard key={evt.id} event={evt} />)
          )}
        </div>

        {hasMore && !loading && (
          <button
            onClick={handleLoadMore}
            className="w-full mt-2 py-1.5 text-[9px] font-mono text-v-muted2 border border-v-border rounded-sm hover:border-white/15 hover:text-v-muted transition-colors"
          >
            Load more
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-v-border2" />

      {/* Section B: Policy Coverage Heatmap */}
      <div>
        <span className="text-[8.5px] font-mono tracking-widest text-v-muted2 uppercase block mb-2">
          Policy Coverage
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {coverage.map((cat) => (
            <div
              key={cat.id}
              className={cn(
                "relative p-2 border rounded-sm",
                cat.status === "COVERED"  && "border-acid/25 bg-acid/[0.04]",
                cat.status === "ACTIVE"   && "border-blue-500/25 bg-blue-500/[0.04]",
                cat.status === "UNCOVERED" && "border-v-border bg-black/20"
              )}
            >
              {/* ID badge */}
              <span className={cn(
                "absolute top-1.5 right-1.5 text-[7px] font-mono px-1 py-0.5 rounded",
                cat.status === "COVERED"  && "bg-acid/10 text-acid",
                cat.status === "ACTIVE"   && "bg-blue-500/10 text-blue-400",
                cat.status === "UNCOVERED" && "bg-white/5 text-v-muted2"
              )}>
                {cat.id}
              </span>

              {/* Category name */}
              <span className="text-[9px] font-mono text-v-muted block mb-1 pr-10">
                {cat.name}
              </span>

              {/* Status */}
              <div className="flex items-center gap-1">
                {cat.status === "COVERED" && (
                  <>
                    <Check className="w-3 h-3 text-acid" />
                    <span className="text-[8px] font-mono text-acid">Covered</span>
                  </>
                )}
                {cat.status === "ACTIVE" && (
                  <>
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span className="text-[8px] font-mono text-blue-400">Active</span>
                  </>
                )}
                {cat.status === "UNCOVERED" && (
                  <>
                    <Minus className="w-3 h-3 text-v-muted2" />
                    <span className="text-[8px] font-mono text-v-muted2">No coverage</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-v-border2" />

      {/* Section C: Compliance Export */}
      <div>
        <span className="text-[8.5px] font-mono tracking-widest text-v-muted2 uppercase block mb-3">
          Compliance Export
        </span>

        {/* Active policy */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[9px] font-mono text-v-muted2">
            Active policy:
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-acid/5 border border-acid/15 rounded text-acid">
            {activePack ?? "none"} ({activePackRules} rules)
          </span>
          {isAdmin && (
            <div className="flex items-center gap-1">
              <select
                value={activePack ?? ""}
                onChange={(e) => {
                  if (e.target.value) handleActivatePack(e.target.value);
                }}
                disabled={switchingPack}
                className="bg-black/40 border border-v-border text-[9px] font-mono text-v-muted px-1.5 py-0.5 rounded focus:outline-none focus:border-acid/30"
              >
                <option value="" disabled>Switch...</option>
                {packs.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.rule_count} rules)
                  </option>
                ))}
              </select>
              {switchingPack && <Loader2 className="w-3 h-3 animate-spin text-v-muted2" />}
            </div>
          )}
        </div>

        {/* Date inputs + buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[8px] font-mono text-v-muted2">From</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-black/40 border border-v-border text-[9px] font-mono text-v-muted px-1.5 py-1 rounded focus:outline-none focus:border-acid/30"
            />
            <label className="text-[8px] font-mono text-v-muted2">To</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-black/40 border border-v-border text-[9px] font-mono text-v-muted px-1.5 py-1 rounded focus:outline-none focus:border-acid/30"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport("json")}
              disabled={exporting !== null}
              className={cn(
                "flex items-center gap-1 text-[9px] font-mono px-2 py-1 rounded-sm border transition-colors",
                exporting === "json"
                  ? "opacity-50 cursor-not-allowed border-v-border text-v-muted2"
                  : "border-acid/30 text-acid hover:bg-acid/10 hover:border-acid/50"
              )}
            >
              {exporting === "json"
                ? <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Exporting…</>
                : <><Download className="w-2.5 h-2.5" /> Export JSON</>
              }
            </button>
            <button
              onClick={() => handleExport("summary")}
              disabled={exporting !== null}
              className={cn(
                "flex items-center gap-1 text-[9px] font-mono px-2 py-1 rounded-sm border transition-colors",
                exporting === "summary"
                  ? "opacity-50 cursor-not-allowed border-v-border text-v-muted2"
                  : "border-v-border text-v-muted2 hover:border-white/15 hover:text-v-muted"
              )}
            >
              {exporting === "summary"
                ? <><Loader2 className="w-2.5 h-2.5 animate-spin" /> Exporting…</>
                : <><Download className="w-2.5 h-2.5" /> Export Summary</>
              }
            </button>
          </div>
        </div>

        {/* Error state */}
        {exportError && (
          <div className="mt-2 flex items-center gap-1.5 px-2 py-1.5 bg-v-red/10 border border-v-red/25 rounded-sm">
            <AlertTriangle className="w-3 h-3 text-v-red" />
            <span className="text-[8px] font-mono text-v-red">{exportError}</span>
          </div>
        )}

        {/* Inline summary table */}
        {summaryData && (
          <div className="mt-3 space-y-3">
            <div>
              <span className="text-[8px] font-mono text-v-muted2 uppercase tracking-wider block mb-1">By Event Type</span>
              <table className="w-full text-[8px] font-mono">
                <thead>
                  <tr className="border-b border-v-border">
                    <th className="text-left text-v-muted2 py-1 pr-4">Event Type</th>
                    <th className="text-right text-v-muted2 py-1">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summaryData.by_event_type).map(([type, count]) => (
                    <tr key={type} className="border-b border-v-border/30">
                      <td className="py-1 pr-4 text-v-muted">{type}</td>
                      <td className="text-right py-1 text-v-muted">{count}</td>
                    </tr>
                  ))}
                  {Object.keys(summaryData.by_event_type).length === 0 && (
                    <tr><td colSpan={2} className="py-2 text-center text-v-muted2">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div>
              <span className="text-[8px] font-mono text-v-muted2 uppercase tracking-wider block mb-1">By OWASP Category</span>
              <table className="w-full text-[8px] font-mono">
                <thead>
                  <tr className="border-b border-v-border">
                    <th className="text-left text-v-muted2 py-1 pr-4">Category</th>
                    <th className="text-right text-v-muted2 py-1">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(summaryData.by_owasp_category).map(([cat, count]) => (
                    <tr key={cat} className="border-b border-v-border/30">
                      <td className="py-1 pr-4 text-v-muted">{cat}</td>
                      <td className="text-right py-1 text-v-muted">{count}</td>
                    </tr>
                  ))}
                  {Object.keys(summaryData.by_owasp_category).length === 0 && (
                    <tr><td colSpan={2} className="py-2 text-center text-v-muted2">No data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
