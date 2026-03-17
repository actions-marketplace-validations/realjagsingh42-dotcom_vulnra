import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "VULNRA vs Every LLM Security Scanner — Comparison",
  description: "See how VULNRA compares to Garak standalone, PromptFoo, Rebuff, and manual red-teaming for AI/LLM security scanning.",
};

type Feature = {
  category: string;
  name: string;
  vulnra: boolean | "partial";
  garak: boolean | "partial";
  promptfoo: boolean | "partial";
  rebuff: boolean | "partial";
  manual: boolean | "partial";
};

const FEATURES: Feature[] = [
  // Scan Engines
  { category: "Scan Engines", name: "Jailbreak probes (50+ types)", vulnra: true,  garak: true,     promptfoo: "partial", rebuff: false, manual: "partial" },
  { category: "Scan Engines", name: "Prompt injection",              vulnra: true,  garak: true,     promptfoo: true,      rebuff: true,  manual: true },
  { category: "Scan Engines", name: "PII / data leakage",            vulnra: true,  garak: true,     promptfoo: "partial", rebuff: false, manual: "partial" },
  { category: "Scan Engines", name: "PyRIT 10-converter engine",     vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: false },
  { category: "Scan Engines", name: "PAIR iterative refinement",     vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: "partial" },
  { category: "Scan Engines", name: "Multi-turn attack chains",      vulnra: true,  garak: false,    promptfoo: "partial", rebuff: false, manual: true },
  { category: "Scan Engines", name: "RAG corpus poisoning",          vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: false },
  { category: "Scan Engines", name: "MCP server scanning",           vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: false },
  // Compliance
  { category: "Compliance", name: "OWASP LLM Top 10 mapping",        vulnra: true,  garak: "partial", promptfoo: false,    rebuff: false, manual: "partial" },
  { category: "Compliance", name: "MITRE ATLAS mapping",             vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: "partial" },
  { category: "Compliance", name: "EU AI Act articles",              vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: false },
  { category: "Compliance", name: "India DPDP coverage",             vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: false },
  { category: "Compliance", name: "NIST AI RMF",                     vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: "partial" },
  // Reports & Integrations
  { category: "Reports & Integrations", name: "PDF audit report",    vulnra: true,  garak: false,    promptfoo: "partial", rebuff: false, manual: true },
  { category: "Reports & Integrations", name: "CI/CD webhook",       vulnra: true,  garak: false,    promptfoo: true,      rebuff: false, manual: false },
  { category: "Reports & Integrations", name: "Scan history & share", vulnra: true, garak: false,    promptfoo: false,     rebuff: false, manual: false },
  { category: "Reports & Integrations", name: "Public scan share link", vulnra: true, garak: false, promptfoo: false,     rebuff: false, manual: false },
  { category: "Reports & Integrations", name: "AI judge (Claude)",   vulnra: true,  garak: "partial", promptfoo: true,    rebuff: "partial", manual: false },
  // Platform
  { category: "Platform", name: "Web UI (no CLI required)",          vulnra: true,  garak: false,    promptfoo: "partial", rebuff: false, manual: true },
  { category: "Platform", name: "REST API + API keys",               vulnra: true,  garak: false,    promptfoo: true,      rebuff: false, manual: false },
  { category: "Platform", name: "Sentinel monitoring (scheduled)",   vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: false },
  { category: "Platform", name: "Self-serve SaaS (no install)",      vulnra: true,  garak: false,    promptfoo: false,     rebuff: true,  manual: false },
  { category: "Platform", name: "Enterprise org management",         vulnra: true,  garak: false,    promptfoo: false,     rebuff: false, manual: true },
  { category: "Platform", name: "Free tier available",               vulnra: true,  garak: true,     promptfoo: true,      rebuff: true,  manual: false },
];

const COMPETITORS = ["vulnra", "garak", "promptfoo", "rebuff", "manual"] as const;
const LABELS: Record<typeof COMPETITORS[number], string> = {
  vulnra: "VULNRA",
  garak: "Garak",
  promptfoo: "PromptFoo",
  rebuff: "Rebuff",
  manual: "Manual",
};

function Cell({ val }: { val: boolean | "partial" }) {
  if (val === true)      return <Check className="w-4 h-4 text-acid mx-auto" />;
  if (val === "partial") return <Minus className="w-4 h-4 text-yellow-400 mx-auto" />;
  return <X className="w-4 h-4 text-v-red/60 mx-auto" />;
}

const categories = [...new Set(FEATURES.map((f) => f.category))];

export default function ComparePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="pt-20 pb-12 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/30 bg-acid/5 mb-6">
            <span className="font-mono text-[11px] tracking-widest text-acid">COMPARISON</span>
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5">
            VULNRA vs Every LLM Security Scanner
          </h1>
          <p className="text-v-muted text-lg max-w-2xl mx-auto">
            The most complete comparison of AI security scanning tools available today. We include ourselves honestly.
          </p>
        </div>
      </section>

      {/* Legend */}
      <section className="px-6 md:px-12 pb-6">
        <div className="max-w-[1100px] mx-auto flex items-center gap-6 justify-center flex-wrap">
          <div className="flex items-center gap-2"><Check className="w-4 h-4 text-acid" /><span className="font-mono text-xs text-v-muted">Full support</span></div>
          <div className="flex items-center gap-2"><Minus className="w-4 h-4 text-yellow-400" /><span className="font-mono text-xs text-v-muted">Partial / limited</span></div>
          <div className="flex items-center gap-2"><X className="w-4 h-4 text-v-red/60" /><span className="font-mono text-xs text-v-muted">Not available</span></div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 md:px-12 pb-20 overflow-x-auto">
        <div className="max-w-[1100px] mx-auto">
          {categories.map((cat) => (
            <div key={cat} className="mb-8">
              <h2 className="font-mono text-[10px] tracking-widest text-v-muted mb-3">{cat.toUpperCase()}</h2>
              <div className="border border-v-border2 rounded-xl overflow-hidden">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-v-border2 bg-white/3">
                      <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-5 py-3 w-[35%]">FEATURE</th>
                      {COMPETITORS.map((c) => (
                        <th key={c} className={`font-mono text-[10px] tracking-widest px-4 py-3 text-center ${c === "vulnra" ? "text-acid" : "text-v-muted"}`}>
                          {LABELS[c].toUpperCase()}
                          {c === "vulnra" && <span className="ml-1 text-[8px] align-top">★</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURES.filter((f) => f.category === cat).map((f, i) => (
                      <tr key={f.name} className={`border-b border-v-border2 last:border-0 ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                        <td className="font-mono text-xs px-5 py-3">{f.name}</td>
                        {COMPETITORS.map((c) => (
                          <td key={c} className={`px-4 py-3 text-center ${c === "vulnra" ? "bg-acid/3" : ""}`}>
                            <Cell val={f[c]} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Score summary */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4 text-center">TOTAL FEATURE COVERAGE</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {COMPETITORS.map((c) => {
              const total = FEATURES.length;
              const full = FEATURES.filter((f) => f[c] === true).length;
              const partial = FEATURES.filter((f) => f[c] === "partial").length;
              const score = Math.round(((full + partial * 0.5) / total) * 100);
              return (
                <div key={c} className={`border rounded-xl p-4 text-center ${c === "vulnra" ? "border-acid/40 bg-acid/5" : "border-v-border2"}`}>
                  <p className={`font-mono text-3xl font-bold ${c === "vulnra" ? "text-acid" : "text-white"}`}>{score}%</p>
                  <p className={`font-mono text-[11px] tracking-widest mt-1 ${c === "vulnra" ? "text-acid" : "text-v-muted"}`}>{LABELS[c].toUpperCase()}</p>
                  <p className="font-mono text-[9px] text-v-muted2 mt-1">{full}/{total} full</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-[600px] mx-auto text-center border border-acid/20 rounded-xl p-8 bg-acid/3">
          <h2 className="font-mono text-2xl font-bold mb-3">Start scanning free</h2>
          <p className="text-v-muted text-sm mb-6">
            No credit card. No install. First scan in 60 seconds.
          </p>
          <Link
            href="/signup"
            className="inline-block font-mono text-[11px] tracking-widest bg-acid text-black px-8 py-3 rounded-lg font-bold hover:bg-acid/90 transition-colors"
          >
            GET STARTED FREE
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
