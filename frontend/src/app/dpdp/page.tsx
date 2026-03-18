import type { Metadata } from "next";
import Link from "next/link";
import { Shield, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "India DPDP & AI Compliance — VULNRA",
  description: "VULNRA helps Indian AI operators comply with the Digital Personal Data Protection Act 2023. Automated PII detection and compliance reports.",
};

const DPDP_SECTIONS = [
  {
    section: "Sec 4",
    title: "Lawful processing of personal data",
    obligation: "Personal data may only be processed for a lawful purpose after obtaining verifiable consent or for legitimate use.",
    vulnra: "PII leakage probes detect when LLMs expose personal data in outputs without consent context.",
    penalty: "₹250 Cr",
  },
  {
    section: "Sec 6",
    title: "Notice before consent",
    obligation: "A data fiduciary must provide clear notice describing the personal data being processed and the purpose before seeking consent.",
    vulnra: "Policy compliance probes test whether AI systems expose user data from prior sessions or contextual memory.",
    penalty: "₹250 Cr",
  },
  {
    section: "Sec 8",
    title: "General obligations of data fiduciary",
    obligation: "Ensure accuracy, completeness, and consistency of personal data. Implement appropriate technical measures.",
    vulnra: "Multi-engine scan providing documented evidence of technical measures against prompt injection and data extraction.",
    penalty: "₹150 Cr",
  },
  {
    section: "Sec 9",
    title: "Processing of personal data of children",
    obligation: "Prior verifiable parental consent required before processing any data of children under 18.",
    vulnra: "Age-sensitive PII detection — flags outputs that contain data suggestive of minors.",
    penalty: "₹200 Cr",
  },
  {
    section: "Sec 11",
    title: "Right of access",
    obligation: "Data principals have the right to obtain information about processing activities and categories of personal data held.",
    vulnra: "Indirect prompt injection probes test whether AI can be coerced to disclose training data or internal user information.",
    penalty: "₹250 Cr",
  },
  {
    section: "Sec 17",
    title: "Significant data fiduciary",
    obligation: "Significant data fiduciaries must conduct a Data Protection Impact Assessment and audit for AI-based processing.",
    vulnra: "PDF audit reports with full methodology serve as documented evidence for DPIA requirements.",
    penalty: "₹250 Cr",
  },
];

const CHECKLIST = [
  { item: "Map all personal data that your LLM API processes or can expose",              done: false },
  { item: "Obtain explicit consent before processing personal data with an AI system",    done: false },
  { item: "Implement technical measures to prevent PII leakage in model outputs",         done: false },
  { item: "Run automated PII leakage scans before each production deployment",            done: false },
  { item: "Maintain audit records of scans and findings for regulator review",            done: false },
  { item: "Conduct Data Protection Impact Assessment for AI-based processing",            done: false },
  { item: "Appoint a Data Protection Officer if classified as Significant Data Fiduciary", done: false },
  { item: "Establish breach notification procedures (72-hour window)",                    done: false },
];

export default function DPDPPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="pt-20 pb-12 px-4 sm:px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/30 bg-acid/5 mb-6">
            <Shield className="w-3 h-3 text-acid" />
            <span className="font-mono text-[11px] tracking-widest text-acid">INDIA COMPLIANCE</span>
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5">
            India DPDP & AI Compliance
          </h1>
          <p className="text-v-muted text-lg max-w-2xl mx-auto">
            The Digital Personal Data Protection Act 2023 applies to any AI system processing personal data of Indian residents — regardless of where you are incorporated.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 md:px-12 pb-12">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "₹250Cr", label: "Max fine per violation" },
            { num: "2023",   label: "Act passed" },
            { num: "6",      label: "DPDP sections covered" },
            { num: "72h",    label: "Breach notification window" },
          ].map((s) => (
            <div key={s.label} className="border border-v-border2 rounded-lg p-4 bg-white/2 text-center">
              <p className="font-mono text-2xl font-bold text-acid">{s.num}</p>
              <p className="font-mono text-[10px] tracking-widest text-v-muted mt-1">{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DPDP Sections table */}
      <section className="px-4 sm:px-6 md:px-12 pb-14">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">DPDP OBLIGATIONS & VULNRA COVERAGE</h2>
          <div className="space-y-4">
            {DPDP_SECTIONS.map((sec) => (
              <div key={sec.section} className="border border-v-border2 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] bg-acid/10 border border-acid/20 text-acid px-2 py-0.5 rounded">{sec.section}</span>
                    <h3 className="font-mono text-sm font-semibold">{sec.title}</h3>
                  </div>
                  <span className="font-mono text-[10px] text-v-red border border-v-red/20 bg-v-red/5 px-2 py-0.5 rounded shrink-0">
                    Max: {sec.penalty}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-mono text-[10px] tracking-widest text-v-muted mb-1">OBLIGATION</p>
                    <p className="text-v-muted text-sm">{sec.obligation}</p>
                  </div>
                  <div className="border border-acid/20 bg-acid/3 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-acid" />
                      <p className="font-mono text-[10px] tracking-widest text-acid">VULNRA COVERS THIS</p>
                    </div>
                    <p className="text-v-muted text-sm">{sec.vulnra}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance checklist */}
      <section className="px-4 sm:px-6 md:px-12 pb-20">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">AI OPERATOR DPDP CHECKLIST</h2>
          <div className="border border-v-border2 rounded-xl overflow-hidden">
            {CHECKLIST.map((item, i) => (
              <div key={i} className={`flex items-start gap-4 px-5 py-4 ${i < CHECKLIST.length - 1 ? "border-b border-v-border2" : ""} ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                <div className="w-5 h-5 rounded border border-v-border2 bg-white/5 shrink-0 mt-0.5 flex items-center justify-center">
                  {item.done && <CheckCircle2 className="w-3 h-3 text-acid" />}
                </div>
                <span className="font-mono text-xs text-v-muted">{item.item}</span>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-v-muted mt-3 text-center">
            VULNRA automates items 3–6 in the checklist above.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 md:px-12 pb-20">
        <div className="max-w-[700px] mx-auto text-center border border-acid/20 rounded-xl p-8 bg-acid/3">
          <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
          <h2 className="font-mono text-2xl font-bold mb-3">Penalties up to ₹250 Crore per violation</h2>
          <p className="text-v-muted text-sm mb-6">
            VULNRA generates the technical evidence you need for DPDP compliance — automated PII leak tests, PDF audit reports, and continuous monitoring.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest bg-acid text-black px-6 py-2.5 rounded-lg font-bold hover:bg-acid/90 transition-colors">
              START FREE SCAN <ArrowRight className="w-3.5 h-3.5" />
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
