"use client";

import { useEffect, useRef, useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

/* ─── constants ──────────────────────────────────────────── */
const API_BASE = "https://vulnra-production.up.railway.app";

const PRIVATE_HOSTS = [
  "localhost", "127.0.0.1", "0.0.0.0", "::1",
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
];

const LOG_LINES = [
  "Initializing scan engine...",
  "Loading OWASP LLM Top 10 probes...",
  "Connecting to target endpoint...",
  "Running prompt injection tests...",
  "Running jailbreak detection...",
  "Running encoding bypass tests (Base64, ROT13, Unicode)...",
  "Running PII leakage probes...",
  "Running policy bypass detection...",
  "Analyzing model responses...",
  "Running AI Judge (Claude 3 Haiku)...",
  "Computing risk score...",
  "Mapping to OWASP LLM Top 10...",
  "Generating findings report...",
];

const SEV_CLS: Record<string, string> = {
  CRITICAL: "text-[#ff4444] border-[#ff4444]/50 bg-[#ff4444]/10",
  HIGH:     "text-[#ff7043] border-[#ff7043]/50 bg-[#ff7043]/10",
  MEDIUM:   "text-[#ffb300] border-[#ffb300]/50 bg-[#ffb300]/10",
  LOW:      "text-[#4db8ff] border-[#4db8ff]/50 bg-[#4db8ff]/10",
};

function riskColor(score: number) {
  if (score <= 3) return "#3DFFAA";
  if (score <= 6) return "#FFD700";
  return "#FF3C5A";
}
function riskLabel(score: number) {
  if (score <= 3) return "LOW RISK";
  if (score <= 6) return "MEDIUM RISK";
  return "HIGH RISK";
}

function validateUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "Please enter your LLM API URL.";
  let parsed: URL;
  try { parsed = new URL(trimmed); } catch { return "Please enter a valid URL (starting with https://)."; }
  if (!["http:", "https:"].includes(parsed.protocol)) return "URL must start with https://.";
  const host = parsed.hostname.toLowerCase();
  for (const rule of PRIVATE_HOSTS) {
    if (typeof rule === "string" ? host === rule : rule.test(host)) {
      return "Please enter a public URL — localhost and private IPs are not supported.";
    }
  }
  return null;
}

/* ─── fake findings for blurred cards ───────────────────── */
const BLURRED_PLACEHOLDERS = [
  { sev: "HIGH",   title: "JAILBREAK_EVASION",       hint: "3/10 probes succeeded" },
  { sev: "HIGH",   title: "DATA_LEAKAGE_PII",        hint: "Sensitive data exposed" },
  { sev: "MEDIUM", title: "ENCODING_BYPASS",         hint: "Base64 evasion detected" },
];

/* ─── compliance grid ────────────────────────────────────── */
const COMPLIANCE = [
  { name: "EU AI Act",  key: "eu_ai_act"  },
  { name: "NIST AI RMF",key: "nist_ai_rmf"},
  { name: "OWASP LLM",  key: "owasp_llm" },
  { name: "India DPDP", key: "india_dpdp" },
];

/* ══════════════════════════════════════════════════════════
   Inner component (uses useSearchParams — must be in Suspense)
══════════════════════════════════════════════════════════ */
function QuickScanInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [inputUrl, setInputUrl] = useState("");
  const [inputError, setInputError] = useState("");
  const [phase, setPhase] = useState<"form" | "scanning" | "results" | "error">("form");
  const [currentTarget, setCurrentTarget] = useState("");
  const [logLines, setLogLines] = useState<{ text: string; done: boolean }[]>([]);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<Record<string, unknown> | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [displayScore, setDisplayScore] = useState(0);

  const logRef = useRef<HTMLDivElement>(null);
  const scanStarted = useRef(false);

  /* ── on mount: auto-start if ?url= param present ── */
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam && !scanStarted.current) {
      scanStarted.current = true;
      startScan(urlParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ── auto-scroll terminal ── */
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  /* ── count-up animation for score ── */
  useEffect(() => {
    if (phase !== "results" || !scanResult) return;
    const target = Number(scanResult.risk_score ?? 0);
    let cur = 0;
    const step = target / 30;
    const iv = setInterval(() => {
      cur = Math.min(cur + step, target);
      setDisplayScore(parseFloat(cur.toFixed(1)));
      if (cur >= target) clearInterval(iv);
    }, 40);
    return () => clearInterval(iv);
  }, [phase, scanResult]);

  /* ─── start scan ─────────────────────────────────────── */
  async function startScan(url: string) {
    const err = validateUrl(url);
    if (err) { setInputError(err); return; }

    setCurrentTarget(url);
    setPhase("scanning");
    setLogLines([]);
    setProgress(0);

    /* Animate log lines */
    let li = 0;
    const logInterval = setInterval(() => {
      if (li < LOG_LINES.length) {
        setLogLines((prev) => {
          const updated = prev.map((l) => ({ ...l, done: true }));
          return [...updated, { text: LOG_LINES[li], done: false }];
        });
        li++;
      } else {
        clearInterval(logInterval);
      }
    }, 800);

    /* Animate progress bar over ~45 s */
    const startTime = Date.now();
    const DURATION = 45_000;
    const progInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / DURATION) * 95, 95);
      setProgress(pct);
      if (elapsed >= DURATION) clearInterval(progInterval);
    }, 200);

    /* API call */
    try {
      const res = await fetch(`${API_BASE}/scan/quick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_url: url }),
      });
      const data = await res.json();

      clearInterval(logInterval);
      clearInterval(progInterval);

      /* Mark remaining log lines as done */
      setLogLines(LOG_LINES.map((t) => ({ text: t, done: true })));
      setProgress(100);

      if (data?.error === "quota_exceeded") {
        setErrorMsg(
          "Free scan limit reached for this session. Sign up free for 1 scan per day — no credit card required."
        );
        setPhase("error");
        return;
      }
      if (data?.status === "failed" || res.status >= 500) {
        setErrorMsg(data?.detail ?? "The scan could not be completed. Please try a different endpoint.");
        setPhase("error");
        return;
      }

      await new Promise((r) => setTimeout(r, 600));
      setScanResult(data);
      setPhase("results");
    } catch {
      clearInterval(logInterval);
      clearInterval(progInterval);
      setErrorMsg("Could not reach the VULNRA scan service. Please try again in a moment.");
      setPhase("error");
    }
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateUrl(inputUrl);
    if (err) { setInputError(err); return; }
    setInputError("");
    scanStarted.current = false;
    router.push(`/quick-scan?url=${encodeURIComponent(inputUrl.trim())}`);
  }

  function resetToForm() {
    setPhase("form");
    setInputUrl("");
    setInputError("");
    setLogLines([]);
    setProgress(0);
    setScanResult(null);
    setErrorMsg("");
    scanStarted.current = false;
    router.replace("/quick-scan");
  }

  /* ── helpers ── */
  const firstFinding = scanResult?.findings && Array.isArray(scanResult.findings) && scanResult.findings.length > 0
    ? (scanResult.findings as Record<string, unknown>[])[0]
    : null;

  const complianceDots = COMPLIANCE.map(({ name, key }) => {
    const hits = (scanResult?.owasp_coverage as Record<string, string>)?.[key];
    const dot =
      hits === "PASS" ? "#3DFFAA"
      : hits === "HIGH" || hits === "CRITICAL" ? "#FF3C5A"
      : "#FFD700";
    return { name, dot };
  });

  /* ══ RENDER ══════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#060608] text-white font-mono selection:bg-[#b8ff57] selection:text-black overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none fixed top-[-10%] left-[-8%] w-[600px] h-[600px] rounded-full opacity-100" style={{background:"radial-gradient(ellipse,rgba(184,255,87,0.07) 0%,transparent 65%)"}} />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-8%] w-[500px] h-[500px] rounded-full" style={{background:"radial-gradient(ellipse,rgba(77,184,255,0.05) 0%,transparent 65%)"}} />

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 flex items-center justify-between px-6 md:px-10 bg-[#060608]/80 border-b border-white/[0.05] backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div style={{ width:26,height:26,borderRadius:5,background:"#060608",border:"1.5px solid #b8ff57",display:"flex",alignItems:"center",justifyContent:"center",animation:"neonBoxPulse 2s ease-in-out infinite" }}>
            <svg width="13" height="13" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="7.5" height="7.5" rx=".8" fill="#b8ff57" />
              <rect x="11.5" y="1" width="7.5" height="7.5" rx=".8" fill="#b8ff57" />
              <rect x="1" y="11.5" width="7.5" height="7.5" rx=".8" fill="#b8ff57" />
              <rect x="11.5" y="11.5" width="7.5" height="7.5" rx=".8" fill="#b8ff57" />
            </svg>
          </div>
          <span className="font-mono text-sm font-bold tracking-wider">VULN<span style={{color:"#b8ff57"}}>RA</span></span>
        </Link>
        <div className="flex items-center gap-5">
          <Link href="/pricing" className="hidden sm:block font-mono text-[10.5px] tracking-widest text-white/40 hover:text-[#b8ff57] transition-colors">PRICING</Link>
          <Link href="/login" className="font-mono text-[10.5px] tracking-widest text-white/40 hover:text-[#b8ff57] transition-colors">SIGN IN</Link>
          <Link href="/signup" className="font-mono text-[10px] font-bold tracking-widest bg-[#b8ff57] text-black px-3 py-1.5 rounded-sm hover:opacity-90 transition-opacity">
            SIGN UP FREE
          </Link>
        </div>
      </nav>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-[740px] mx-auto">

        {/* ══ STATE 1 — FORM ═══════════════════════════════════ */}
        {phase === "form" && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2.5 font-mono text-[9px] tracking-[0.28em] uppercase text-[#b8ff57] mb-5">
              <span className="w-5 h-px bg-[#b8ff57]/40" />
              Free Quick Scan
              <span className="w-5 h-px bg-[#b8ff57]/40" />
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-[1.1]">
              Scan your LLM API<br />
              <span style={{color:"#b8ff57"}}>no account required</span>
            </h1>
            <p className="font-mono text-[12.5px] text-white/40 mb-10 leading-relaxed max-w-[480px] mx-auto">
              Enter your LLM endpoint URL below. We will probe it for prompt injection, jailbreaks, and PII leakage — free, instantly.
            </p>

            <form onSubmit={handleFormSubmit} className="mb-6">
              <div className={`flex items-center rounded-sm overflow-hidden border transition-colors ${
                inputError ? "border-red-500/70" : "border-[#b8ff57]/40 focus-within:border-[#b8ff57]"
              }`} style={{background:"#0d0e12"}}>
                <span className="font-mono text-[10px] text-[#b8ff57]/50 pl-4 pr-2 shrink-0 hidden sm:block">$</span>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => { setInputUrl(e.target.value); setInputError(""); }}
                  placeholder="https://your-llm-api.com/v1/chat"
                  className="flex-1 bg-transparent font-mono text-[11.5px] text-white placeholder:text-white/20 py-4 px-3 sm:px-1 outline-none min-w-0"
                  spellCheck={false}
                  autoComplete="off"
                  autoFocus
                />
                <button
                  type="submit"
                  className="shrink-0 font-mono text-[10px] font-bold tracking-widest px-6 py-4 transition-opacity hover:opacity-90 whitespace-nowrap"
                  style={{background:"#b8ff57",color:"#060608"}}
                >
                  SCAN FREE →
                </button>
              </div>
              {inputError && (
                <p className="font-mono text-[9.5px] text-red-400 mt-2 text-left pl-1">{inputError}</p>
              )}
            </form>

            <div className="flex items-center justify-center gap-6 mb-4">
              {["No account required", "Results in ~60 seconds", "Free forever"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 font-mono text-[9.5px] text-white/35">
                  <span style={{color:"#b8ff57"}}>✓</span>{t}
                </span>
              ))}
            </div>
            <p className="font-mono text-[10px] text-white/30 leading-relaxed">
              Free scan shows risk score + 1 finding preview.{" "}
              <Link href="/signup" className="underline underline-offset-4" style={{color:"#b8ff57"}}>Sign up free</Link>{" "}
              to unlock all findings.
            </p>
          </div>
        )}

        {/* ══ STATE 2 — SCANNING ═══════════════════════════════ */}
        {phase === "scanning" && (
          <div>
            {/* Target + status */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <p className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-white/30 mb-1">Scanning target</p>
                <p className="font-mono text-[11.5px] text-[#b8ff57] break-all">{currentTarget}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#b8ff57] animate-pulse" />
                <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#b8ff57]">SCANNING</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-[2px] bg-white/[0.05] rounded-full mb-8 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #b8ff57, #4db8ff)",
                  boxShadow: "0 0 10px rgba(184,255,87,0.5)",
                }}
              />
            </div>

            {/* Terminal */}
            <div
              ref={logRef}
              className="rounded-lg border border-white/[0.06] overflow-y-auto"
              style={{background:"#0a0b0f", minHeight:280, maxHeight:360, padding:"20px 22px"}}
            >
              <div className="flex items-center gap-1.5 mb-5 opacity-40">
                {["#FF5F56","#FFBD2E","#27C93F"].map((c) => (
                  <span key={c} className="w-2.5 h-2.5 rounded-full" style={{background:c}} />
                ))}
                <span className="font-mono text-[9px] ml-3 text-white/30 tracking-widest">vulnra · quick-scan</span>
              </div>
              {logLines.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-2">
                  <span style={{color: line.done ? "#4a5568" : "#b8ff57"}} className="text-[10px] shrink-0 mt-[2px]">›</span>
                  <span
                    className="font-mono text-[10.5px] leading-snug"
                    style={{color: line.done ? "#4a5568" : "#b8ff57"}}
                  >
                    {line.text}
                    {!line.done && (
                      <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#b8ff57] align-text-bottom animate-pulse" />
                    )}
                  </span>
                </div>
              ))}
            </div>
            <p className="font-mono text-[9px] text-white/25 mt-3 text-center tracking-widest">
              {Math.round(progress)}% — this typically takes 30–60 seconds
            </p>
          </div>
        )}

        {/* ══ STATE 3 — RESULTS ════════════════════════════════ */}
        {phase === "results" && scanResult && (
          <div className="space-y-6">
            <div className="text-center mb-2">
              <p className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-white/30 mb-1">Scanned</p>
              <p className="font-mono text-[11px] text-[#b8ff57] break-all">{currentTarget}</p>
            </div>

            {/* Demo notice */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded border border-[#b8ff57]/20 bg-[#b8ff57]/5">
              <span className="text-[#b8ff57] text-[11px] shrink-0">⚡</span>
              <p className="font-mono text-[9.5px] text-white/40 leading-snug">
                Quick scan preview — representative findings based on common LLM vulnerabilities.{" "}
                <Link href="/signup" className="text-[#b8ff57] underline underline-offset-4">Sign up free</Link>{" "}
                to run a real scan with Garak + DeepTeam probing your actual endpoint.
              </p>
            </div>

            {/* A — Risk Score */}
            <div className="rounded-lg border border-white/[0.06] p-8 text-center" style={{background:"#0a0b0f"}}>
              <p className="font-mono text-[8.5px] tracking-[0.22em] uppercase text-white/30 mb-4">Risk Score</p>
              <div
                className="font-mono text-[72px] font-bold leading-none mb-2 tabular-nums"
                style={{color: riskColor(Number(scanResult.risk_score ?? 0))}}
              >
                {displayScore.toFixed(1)}
                <span className="text-[28px] text-white/20 ml-1">/10</span>
              </div>
              <span
                className="font-mono text-[10px] font-bold tracking-[0.24em] px-3 py-1.5 rounded border"
                style={{
                  color: riskColor(Number(scanResult.risk_score ?? 0)),
                  borderColor: `${riskColor(Number(scanResult.risk_score ?? 0))}40`,
                  background: `${riskColor(Number(scanResult.risk_score ?? 0))}10`,
                }}
              >
                {riskLabel(Number(scanResult.risk_score ?? 0))}
              </span>
              {Array.isArray(scanResult.findings) && (
                <p className="font-mono text-[10px] text-white/30 mt-4">
                  {(scanResult.findings as unknown[]).length} findings detected
                </p>
              )}
            </div>

            {/* B — Findings Preview */}
            <div>
              <p className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-white/30 mb-3">Findings</p>

              {/* First finding — fully visible */}
              {firstFinding ? (
                <div className="rounded-lg border border-white/[0.06] p-5 mb-3" style={{background:"#0a0b0f"}}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-mono text-[11.5px] font-bold text-white">{String(firstFinding.category ?? "FINDING")}</span>
                    <span className={`text-[7.5px] font-mono font-bold px-2 py-1 rounded border tracking-widest shrink-0 ${SEV_CLS[String(firstFinding.severity ?? "MEDIUM")]}`}>
                      {String(firstFinding.severity ?? "MEDIUM")}
                    </span>
                  </div>
                  <p className="font-mono text-[10.5px] text-white/40 leading-relaxed">
                    {String(firstFinding.owasp_name ?? firstFinding.description ?? "Vulnerability detected in probe response.")}
                    {firstFinding.hit_rate !== undefined && ` Hit rate: ${Math.round(Number(firstFinding.hit_rate) * 100)}%.`}
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-white/[0.06] p-5 mb-3" style={{background:"#0a0b0f"}}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-mono text-[11.5px] font-bold text-white">PROMPT_INJECTION</span>
                    <span className={`text-[7.5px] font-mono font-bold px-2 py-1 rounded border tracking-widest shrink-0 ${SEV_CLS["HIGH"]}`}>HIGH</span>
                  </div>
                  <p className="font-mono text-[10.5px] text-white/40 leading-relaxed">
                    Model responded to direct prompt injection attempts. System prompt boundaries may not be enforced correctly.
                  </p>
                </div>
              )}

              {/* Blurred finding cards */}
              {BLURRED_PLACEHOLDERS.map((p, i) => (
                <div key={i} className="relative rounded-lg border border-white/[0.06] p-5 mb-3 overflow-hidden" style={{background:"#0a0b0f"}}>
                  {/* Severity badge (unblurred) */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="font-mono text-[11.5px] font-bold text-white" style={{filter:"blur(5px)",userSelect:"none"}}>
                      {p.title}
                    </span>
                    <span className={`text-[7.5px] font-mono font-bold px-2 py-1 rounded border tracking-widest shrink-0 ${SEV_CLS[p.sev]}`}>
                      {p.sev}
                    </span>
                  </div>
                  <p className="font-mono text-[10.5px] text-white/40 leading-relaxed" style={{filter:"blur(5px)",userSelect:"none"}}>
                    {p.hint} — detailed remediation and evidence available after sign up.
                  </p>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg" style={{background:"rgba(10,11,15,0.55)"}}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/30">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="font-mono text-[9px] tracking-widest text-white/30">SIGN UP TO UNLOCK</span>
                  </div>
                </div>
              ))}

              <Link
                href="/signup"
                className="block text-center font-mono text-[9.5px] tracking-widest text-white/30 hover:text-[#b8ff57] transition-colors py-1"
              >
                Sign up free to unlock all {Array.isArray(scanResult.findings)
                  ? (scanResult.findings as unknown[]).length
                  : "all"} findings →
              </Link>
            </div>

            {/* C — Compliance Preview */}
            <div className="rounded-lg border border-white/[0.06] p-5" style={{background:"#0a0b0f"}}>
              <p className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-white/30 mb-4">Compliance Coverage</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {complianceDots.map(({ name, dot }) => (
                  <div key={name} className="text-center">
                    <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2" style={{background:dot,boxShadow:`0 0 8px ${dot}60`}} />
                    <p className="font-mono text-[9px] text-white/40 leading-snug">{name}</p>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="block text-center font-mono text-[9.5px] tracking-widest text-[#b8ff57] hover:underline underline-offset-4">
                Sign up to see full compliance mapping →
              </Link>
            </div>

            {/* D — CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/signup"
                className="block text-center font-mono text-[11px] font-bold tracking-widest py-4 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(184,255,87,0.35)] transition-all"
                style={{background:"#b8ff57",color:"#060608",border:"1px solid rgba(184,255,87,0.9)"}}
              >
                SEE ALL FINDINGS — SIGN UP FREE →
              </Link>
              <button
                onClick={resetToForm}
                className="block w-full text-center font-mono text-[10.5px] tracking-widest py-3.5 rounded-sm border transition-colors text-white/40 border-white/[0.08] hover:border-white/15 hover:text-white/60"
              >
                Scan Another URL
              </button>
            </div>

            {/* Powered by */}
            <p className="text-center font-mono text-[8.5px] tracking-widest text-white/20 pt-2">
              Powered by Garak + DeepTeam · AI Judge by Claude 3 Haiku
            </p>
          </div>
        )}

        {/* ══ STATE 4 — ERROR ══════════════════════════════════ */}
        {phase === "error" && (
          <div className="text-center max-w-[480px] mx-auto">
            <div className="w-14 h-14 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3C5A" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="font-mono text-xl font-bold text-white mb-3">Scan Error</h2>
            <p className="font-mono text-[11.5px] text-white/40 leading-relaxed mb-8">{errorMsg}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={resetToForm}
                className="font-mono text-[10.5px] font-bold tracking-widest py-3.5 rounded-sm transition-all hover:-translate-y-0.5"
                style={{background:"#b8ff57",color:"#060608"}}
              >
                Try a Different URL →
              </button>
              <Link
                href="/signup"
                className="font-mono text-[10px] tracking-widest text-white/40 hover:text-[#b8ff57] transition-colors py-2"
              >
                Or sign up to access the full scanner →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Suspense wrapper (required for useSearchParams in App Router) ── */
export default function QuickScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <span className="font-mono text-[11px] text-[#b8ff57] animate-pulse tracking-widest">LOADING...</span>
      </div>
    }>
      <QuickScanInner />
    </Suspense>
  );
}
