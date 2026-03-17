import type { Metadata } from "next";
import Link from "next/link";
import { Shield, AlertTriangle, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "EU AI Act Compliance — VULNRA",
  description: "VULNRA maps every scan finding to EU AI Act articles. Understand your AI system's obligations under the EU AI Act 2024.",
};

const DEADLINES = [
  { date: "Feb 2025", milestone: "Prohibited AI systems banned",        article: "Art. 5",  status: "passed",  risk: "Critical" },
  { date: "Aug 2025", milestone: "GPAI model obligations apply",        article: "Art. 51–55", status: "passed", risk: "High" },
  { date: "Aug 2026", milestone: "High-risk AI system requirements",    article: "Art. 6–51", status: "upcoming", risk: "High" },
  { date: "Aug 2027", milestone: "High-risk AI in existing products",   article: "Art. 6",  status: "upcoming", risk: "High" },
  { date: "Aug 2030", milestone: "High-risk AI in regulated sectors",   article: "Annex I", status: "upcoming", risk: "Medium" },
];

const ARTICLES = [
  {
    id: "Art. 9",
    title: "Risk Management System",
    requirement: "High-risk AI systems must implement a continuous risk management process covering identification, analysis, estimation, and evaluation of known and foreseeable risks.",
    vulnra: "Automated risk scoring across 4 vectors (injection, jailbreak, leakage, compliance) with continuous Sentinel monitoring.",
    maxFine: "€15M or 3% of global turnover",
  },
  {
    id: "Art. 10",
    title: "Data and Data Governance",
    requirement: "Training, validation, and testing datasets must be relevant, representative, free of errors, and complete. Data governance practices must be documented.",
    vulnra: "PII leakage detection (LLM02) — probes for personal data exposure in model outputs across 12 leakage categories.",
    maxFine: "€15M or 3% of global turnover",
  },
  {
    id: "Art. 11",
    title: "Technical Documentation",
    requirement: "Before placing a high-risk AI system on the market, providers must draw up technical documentation demonstrating compliance.",
    vulnra: "PDF audit reports with full probe methodology, findings evidence, and compliance mappings — ready for regulatory submission.",
    maxFine: "€15M or 3% of global turnover",
  },
  {
    id: "Art. 13",
    title: "Transparency & Provision of Information",
    requirement: "High-risk AI systems must be designed with sufficient transparency to allow users to interpret the system's output and use it appropriately.",
    vulnra: "OWASP LLM Top 10 and MITRE ATLAS tags on every finding, with remediation guidance and evidence of actual model behaviour.",
    maxFine: "€15M or 3% of global turnover",
  },
  {
    id: "Art. 15",
    title: "Accuracy, Robustness and Cybersecurity",
    requirement: "High-risk AI systems must be designed to achieve an appropriate level of accuracy and be resilient to errors, faults, or inconsistencies.",
    vulnra: "Jailbreak resistance testing (50+ probe types), encoding bypass detection, PAIR/TAP adversarial robustness evaluation.",
    maxFine: "€30M or 6% of global turnover",
  },
  {
    id: "Art. 52",
    title: "Transparency for Certain AI Systems",
    requirement: "Providers of AI systems intended to interact with natural persons must ensure the system is designed to inform persons that they are interacting with an AI.",
    vulnra: "Persona / role-play jailbreak detection that flags when a model can be coerced to abandon its stated identity.",
    maxFine: "€15M or 3% of global turnover",
  },
  {
    id: "Art. 55",
    title: "GPAI Models — Systemic Risk",
    requirement: "Providers of GPAI models with systemic risk must perform model evaluations, adversarial testing, and report serious incidents.",
    vulnra: "Full adversarial test suite covering LLM01–LLM10, multi-turn attack chains, and cross-engine corroboration.",
    maxFine: "€15M or 3% of global turnover",
  },
];

const STATUS_CFG: Record<string, string> = {
  passed: "text-v-muted border-v-border2 bg-white/3",
  upcoming: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
};

export default function EUAIActPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="pt-20 pb-12 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/30 bg-acid/5 mb-6">
            <Shield className="w-3 h-3 text-acid" />
            <span className="font-mono text-[11px] tracking-widest text-acid">COMPLIANCE</span>
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5">
            EU AI Act Compliance
          </h1>
          <p className="text-v-muted text-lg max-w-2xl mx-auto">
            The EU AI Act is in force. Every VULNRA scan maps findings to the specific articles you need to demonstrate compliance with — before auditors come knocking.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 pb-12">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "€30M",   label: "Max fine per violation" },
            { num: "6%",     label: "Max % of global revenue" },
            { num: "7",      label: "Articles mapped by VULNRA" },
            { num: "Aug 26", label: "Next major deadline" },
          ].map((s) => (
            <div key={s.label} className="border border-v-border2 rounded-lg p-4 bg-white/2 text-center">
              <p className="font-mono text-2xl font-bold text-acid">{s.num}</p>
              <p className="font-mono text-[10px] tracking-widest text-v-muted mt-1">{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">IMPLEMENTATION TIMELINE</h2>
          <div className="border border-v-border2 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-v-border2 bg-white/3">
                  <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">DATE</th>
                  <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">MILESTONE</th>
                  <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">ARTICLE</th>
                  <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">RISK LEVEL</th>
                  <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {DEADLINES.map((d, i) => (
                  <tr key={d.date} className={`border-b border-v-border2 last:border-0 ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                    <td className="font-mono text-xs text-acid px-5 py-3 whitespace-nowrap">{d.date}</td>
                    <td className="font-mono text-xs px-5 py-3">{d.milestone}</td>
                    <td className="font-mono text-[10px] text-v-muted px-5 py-3">{d.article}</td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${
                        d.risk === "Critical" ? "text-v-red border-v-red/30 bg-v-red/10" :
                        d.risk === "High" ? "text-orange-400 border-orange-400/30 bg-orange-400/10" :
                        "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                      }`}>{d.risk}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full border ${STATUS_CFG[d.status]}`}>
                        {d.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Article mappings */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">HOW VULNRA COVERS EACH ARTICLE</h2>
          <div className="space-y-4">
            {ARTICLES.map((art) => (
              <div key={art.id} className="border border-v-border2 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] bg-acid/10 border border-acid/20 text-acid px-2 py-0.5 rounded">{art.id}</span>
                    <h3 className="font-mono text-sm font-semibold">{art.title}</h3>
                  </div>
                  <span className="font-mono text-[10px] text-v-red border border-v-red/20 bg-v-red/5 px-2 py-0.5 rounded shrink-0">
                    Max: {art.maxFine}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-v-muted mb-1">REQUIREMENT</p>
                    <p className="text-v-muted text-sm">{art.requirement}</p>
                  </div>
                  <div className="border border-acid/20 bg-acid/3 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-acid" />
                      <p className="font-mono text-[10px] tracking-widest text-acid">VULNRA COVERS THIS</p>
                    </div>
                    <p className="text-v-muted text-sm">{art.vulnra}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 pb-20">
        <div className="max-w-[700px] mx-auto text-center border border-acid/20 rounded-xl p-8 bg-acid/3">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <h2 className="font-mono text-2xl font-bold mb-3">Don&apos;t wait for August 2026</h2>
          <p className="text-v-muted text-sm mb-6">
            Compliance evidence takes time to build. Start scanning today and generate the PDF audit reports regulators expect.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest bg-acid text-black px-6 py-2.5 rounded-lg font-bold hover:bg-acid/90 transition-colors">
              START SCANNING <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/compliance" className="font-mono text-[11px] tracking-widest text-v-muted hover:text-acid transition-colors">
              View all frameworks →
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
