import type { Metadata } from "next";
import Link from "next/link";
import { Github, Shield, Check, X, ArrowRight, Star } from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Open Source — VULNRA",
  description: "VULNRA builds on open-source AI security research. Learn how we use Garak, DeepTeam, PyRIT, and EasyJailbreak — and how to contribute.",
};

const OSS_ENGINES = [
  {
    name: "Garak",
    repo: "github.com/leondz/garak",
    description: "LLM vulnerability scanner from Cohere AI. 100+ probe types, 50+ detect methods. VULNRA integrates Garak as a subprocess and parses its JSONL output.",
    probes: "40+ probe types",
    license: "Apache 2.0",
    stars: "3.8k",
    vulnraUse: "Jailbreak, encoding bypass, PII extraction, hallucination probes",
  },
  {
    name: "DeepTeam",
    repo: "github.com/confident-ai/deepteam",
    description: "Red-teaming framework for LLMs from Confident AI. VULNRA uses the DeepTeam Python SDK for structured vulnerability testing with an AI judge.",
    probes: "15+ vulnerability types",
    license: "Apache 2.0",
    stars: "1.2k",
    vulnraUse: "OWASP LLM Top 10 structured tests, bias detection, toxicity probes",
  },
  {
    name: "PyRIT",
    repo: "github.com/Azure/PyRIT",
    description: "Python Risk Identification Toolkit from Microsoft. VULNRA implements 10 of PyRIT's most impactful encoding converters without requiring the full dependency.",
    probes: "61 converters (10 in VULNRA)",
    license: "MIT",
    stars: "1.8k",
    vulnraUse: "Base64, ROT13, Leetspeak, Morse, Unicode obfuscation, binary encoding",
  },
  {
    name: "EasyJailbreak",
    repo: "github.com/EasyJailbreak/EasyJailbreak",
    description: "Unified framework for jailbreak attacks from Fudan NLP. VULNRA implements PAIR, TAP, and CIPHER attack recipes using Claude Haiku as the attacker model.",
    probes: "11 attack recipes (3 in VULNRA)",
    license: "MIT",
    stars: "580",
    vulnraUse: "PAIR iterative refinement, TAP tree-of-attacks, CIPHER encoding attacks",
  },
  {
    name: "JailbreakBench",
    repo: "github.com/JailbreakBench/jailbreakbench",
    description: "Standardized benchmark for LLM jailbreaks. VULNRA seeds its probe dataset from JailbreakBench's published attack prompts.",
    probes: "100+ jailbreak prompts",
    license: "MIT",
    stars: "620",
    vulnraUse: "20 curated jailbreak prompts in VULNRA probe dataset",
  },
  {
    name: "AdvBench",
    repo: "github.com/llm-attacks/llm-attacks",
    description: "Adversarial benchmark from the GCG attack paper. VULNRA includes AdvBench harmful behavior strings as seed probes for jailbreak testing.",
    probes: "520 harmful behaviors",
    license: "MIT",
    stars: "2.1k",
    vulnraUse: "50 behaviors in VULNRA probe dataset for jailbreak + injection tests",
  },
];

const COMPARISON = [
  { feature: "No CLI install required",        oss: false, vulnra: true },
  { feature: "Web UI for non-engineers",       oss: false, vulnra: true },
  { feature: "Multi-engine correlation",       oss: false, vulnra: true },
  { feature: "AI judge (Claude Haiku)",        oss: "partial", vulnra: true },
  { feature: "OWASP LLM Top 10 mapping",       oss: "partial", vulnra: true },
  { feature: "EU AI Act article mapping",      oss: false, vulnra: true },
  { feature: "DPDP compliance reports",        oss: false, vulnra: true },
  { feature: "PDF audit reports",              oss: false, vulnra: true },
  { feature: "CI/CD webhook integration",      oss: false, vulnra: true },
  { feature: "Scheduled sentinel monitoring",  oss: false, vulnra: true },
  { feature: "RAG security probes",           oss: false, vulnra: true },
  { feature: "MCP server scanning",            oss: false, vulnra: true },
  { feature: "Free to use",                    oss: true,  vulnra: true },
  { feature: "Modifiable source code",         oss: true,  vulnra: false },
  { feature: "Self-hosted option",             oss: true,  vulnra: false },
];

const FAQS = [
  {
    q: "Is VULNRA itself open source?",
    a: "VULNRA's hosted platform is proprietary SaaS. The underlying scan engines we integrate (Garak, DeepTeam, PyRIT, EasyJailbreak) are all open source under permissive licenses.",
  },
  {
    q: "Can I use VULNRA for free?",
    a: "Yes. The free tier includes 1 scan per day, all basic probe categories, and PDF report downloads. No credit card required.",
  },
  {
    q: "How do I contribute to the probe dataset?",
    a: "We accept vulnerability submissions via the feedback form inside the scanner dashboard. All submissions are reviewed by our security team before being added to the database.",
  },
  {
    q: "Can I run these tools myself without VULNRA?",
    a: "Absolutely — all listed engines are freely available. VULNRA saves you the setup time, provides multi-engine correlation, and adds compliance mapping that these tools don't offer standalone.",
  },
];

export default function OpenSourcePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="pt-20 pb-12 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/30 bg-acid/5 mb-6">
            <Github className="w-3 h-3 text-acid" />
            <span className="font-mono text-[11px] tracking-widest text-acid">OPEN SOURCE</span>
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Built on Open Research
          </h1>
          <p className="text-v-muted text-lg max-w-2xl mx-auto">
            VULNRA integrates the best open-source AI security research into a single self-serve platform. We believe in giving credit where it&apos;s due.
          </p>
        </div>
      </section>

      {/* OSS Engine cards */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">INTEGRATED OPEN-SOURCE ENGINES</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {OSS_ENGINES.map((eng) => (
              <div key={eng.name} className="border border-v-border2 rounded-xl p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-mono text-sm font-bold">{eng.name}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="font-mono text-[10px] text-v-muted">{eng.stars}</span>
                  </div>
                </div>
                <p className="font-mono text-[9px] text-v-muted2 mb-2">{eng.repo}</p>
                <p className="text-v-muted text-xs mb-3">{eng.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-v-border2 rounded p-2">
                    <p className="font-mono text-[9px] text-v-muted2 mb-0.5">PROBES</p>
                    <p className="font-mono text-[10px] text-acid">{eng.probes}</p>
                  </div>
                  <div className="border border-v-border2 rounded p-2">
                    <p className="font-mono text-[9px] text-v-muted2 mb-0.5">LICENSE</p>
                    <p className="font-mono text-[10px]">{eng.license}</p>
                  </div>
                </div>
                <div className="mt-3 border border-acid/20 bg-acid/3 rounded p-2">
                  <p className="font-mono text-[9px] text-acid mb-0.5">VULNRA USES THIS FOR</p>
                  <p className="font-mono text-[10px] text-v-muted">{eng.vulnraUse}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OSS vs VULNRA */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[700px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">OSS TOOLS vs VULNRA PLATFORM</h2>
          <div className="border border-v-border2 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-v-border2 bg-white/3">
                  <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">FEATURE</th>
                  <th className="font-mono text-[10px] tracking-widest text-v-muted px-4 py-3 text-center">OSS TOOLS</th>
                  <th className="font-mono text-[10px] tracking-widest text-acid px-4 py-3 text-center">VULNRA ★</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-v-border2 last:border-0 ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                    <td className="font-mono text-xs px-5 py-3">{row.feature}</td>
                    <td className="px-4 py-3 text-center">
                      {row.oss === true ? <Check className="w-4 h-4 text-acid mx-auto" /> :
                       row.oss === "partial" ? <span className="font-mono text-[10px] text-yellow-400">PARTIAL</span> :
                       <X className="w-4 h-4 text-v-red/50 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center bg-acid/3">
                      {row.vulnra === true ? <Check className="w-4 h-4 text-acid mx-auto" /> :
                       <X className="w-4 h-4 text-v-red/50 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[700px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">FAQ</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details key={faq.q} className="border border-v-border2 rounded-xl group">
                <summary className="px-5 py-4 font-mono text-sm cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-acid group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-4 text-v-muted text-sm">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-[600px] mx-auto text-center border border-acid/20 rounded-xl p-8 bg-acid/3">
          <Shield className="w-8 h-8 text-acid mx-auto mb-3" />
          <h2 className="font-mono text-2xl font-bold mb-3">All engines. Zero setup.</h2>
          <p className="text-v-muted text-sm mb-6">
            Get Garak, DeepTeam, PyRIT, and EasyJailbreak running against your API in 60 seconds — no install required.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest bg-acid text-black px-6 py-2.5 rounded-lg font-bold hover:bg-acid/90 transition-colors">
            START FREE <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
