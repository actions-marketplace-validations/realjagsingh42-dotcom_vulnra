import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Search, ArrowRight, BookOpen } from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "AI Vulnerability Database — VULNRA",
  description: "Browse VULNRA's AI vulnerability database. 50+ probe types covering prompt injection, jailbreaks, PII leakage, RAG attacks, and agentic exploits.",
};

const CATEGORIES = [
  {
    id: "LLM01",
    name: "Prompt Injection",
    count: 23,
    severity: "Critical",
    description: "Direct and indirect prompt injection attacks that override system instructions, manipulate model behavior, or exfiltrate data.",
    examples: ["System prompt extraction", "Instruction override via user input", "Indirect injection via retrieved documents", "Multi-hop injection chains"],
    owasp: "LLM01",
    mitre: "AML.T0051",
  },
  {
    id: "LLM02",
    name: "Insecure Output Handling",
    count: 14,
    severity: "High",
    description: "Vulnerabilities arising from insufficient validation or sanitization of LLM outputs, leading to XSS, SSRF, or remote code execution.",
    examples: ["JavaScript injection in markdown output", "URL generation for SSRF", "Code execution via generated scripts", "SQL injection via LLM-generated queries"],
    owasp: "LLM02",
    mitre: "AML.T0048",
  },
  {
    id: "LLM03",
    name: "Training Data Poisoning",
    count: 8,
    severity: "High",
    description: "Attacks that corrupt or manipulate training data to introduce backdoors, biases, or malicious behaviors into the model.",
    examples: ["Backdoor trigger insertion", "Bias amplification via data injection", "RAG corpus poisoning", "Retrieval index manipulation"],
    owasp: "LLM03",
    mitre: "AML.T0020",
  },
  {
    id: "LLM04",
    name: "Model Denial of Service",
    count: 6,
    severity: "Medium",
    description: "Resource exhaustion attacks targeting LLM inference, context windows, or downstream services.",
    examples: ["Infinite context loop prompts", "Recursive summarization attacks", "Token flooding via embedded payloads", "Slowloris-style API abuse"],
    owasp: "LLM04",
    mitre: "AML.T0034",
  },
  {
    id: "LLM06",
    name: "Sensitive Information Disclosure",
    count: 19,
    severity: "High",
    description: "Extraction of PII, credentials, trade secrets, or system configuration from model outputs or context windows.",
    examples: ["PII in training data regurgitation", "API key disclosure via context", "System prompt leakage", "Cross-user session data exposure"],
    owasp: "LLM06",
    mitre: "AML.T0042",
  },
  {
    id: "LLM07",
    name: "Insecure Plugin Design",
    count: 11,
    severity: "High",
    description: "Vulnerabilities in LLM plugins or tool integrations that allow unauthorized access, data exfiltration, or arbitrary code execution.",
    examples: ["Tool call argument injection", "MCP server permission escalation", "Implicit trust exploitation", "Cross-plugin data leakage"],
    owasp: "LLM07",
    mitre: "AML.T0054",
  },
  {
    id: "LLM08",
    name: "Excessive Agency",
    count: 9,
    severity: "High",
    description: "AI agents performing unintended or harmful actions due to excessive permissions, unclear boundaries, or inadequate human oversight.",
    examples: ["Autonomous file deletion via agent", "Email exfiltration via tool chain", "Database modification without confirmation", "Privilege escalation via chained tool calls"],
    owasp: "LLM08",
    mitre: "AML.T0043",
  },
  {
    id: "LLM09",
    name: "Overreliance",
    count: 5,
    severity: "Medium",
    description: "Systems that depend excessively on LLM outputs without proper verification, leading to errors, misinformation, or security failures.",
    examples: ["Unverified code execution from LLM", "Medical advice without expert review", "Legal decisions from model output", "Financial transactions via LLM instruction"],
    owasp: "LLM09",
    mitre: "AML.T0047",
  },
  {
    id: "LLM10",
    name: "Model Theft",
    count: 4,
    severity: "Medium",
    description: "Extraction attacks that allow unauthorized parties to reconstruct model weights, system prompts, or proprietary capabilities.",
    examples: ["System prompt extraction via leakage", "Membership inference attacks", "Functionality extraction via API probing", "Intellectual property theft via fine-tuning"],
    owasp: "LLM10",
    mitre: "AML.T0044",
  },
];

const FEATURED_VULN = {
  id: "VULNRA-2026-0042",
  name: "Indirect RAG Corpus Poisoning via Metadata Fields",
  severity: "Critical",
  category: "Training Data Poisoning",
  cve: "n/a",
  discovered: "2026-02-11",
  description: "An attacker who can contribute documents to a RAG knowledge base can embed adversarial instructions in metadata fields (title, description, author). These fields are typically ingested and embedded alongside document content but receive less sanitization scrutiny. When retrieved, the metadata instructions are included in the LLM context and can override system prompts or exfiltrate query data.",
  affected: "Any RAG system that includes document metadata in the retrieval context without sanitization.",
  remediation: "Sanitize all metadata fields using the same policy applied to document content. Implement a separate sanitization pipeline for metadata. Use VULNRA's RAG-03 probe to test for this vulnerability.",
  probeId: "rag_metadata_injection",
};

const FAQS = [
  {
    q: "Is the VULNRA vulnerability database public?",
    a: "The vulnerability database is available to all registered users. Detailed proof-of-concept prompts and reproduction steps are available on Pro and Enterprise plans.",
  },
  {
    q: "How are vulnerabilities discovered?",
    a: "Vulnerabilities are sourced from published academic research (AdvBench, JailbreakBench, GPTFuzzer), disclosed CVEs, internal red-team exercises, and community submissions.",
  },
  {
    q: "How do I test my API against these vulnerabilities?",
    a: "Create a free VULNRA account and run a scan against your LLM API endpoint. Results are mapped directly to this database.",
  },
  {
    q: "Does VULNRA publish 0-days?",
    a: "No. We follow responsible disclosure. All vulnerabilities are disclosed to affected vendors and given a minimum 90-day remediation period before public publication.",
  },
];

const SEVERITY_CFG: Record<string, string> = {
  Critical: "text-v-red border-v-red/30 bg-v-red/10",
  High:     "text-orange-400 border-orange-400/30 bg-orange-400/10",
  Medium:   "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  Low:      "text-blue-400 border-blue-400/30 bg-blue-400/10",
};

export default function VulnDbPage() {
  const totalVulns = CATEGORIES.reduce((s, c) => s + c.count, 0);

  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="pt-20 pb-12 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/30 bg-acid/5 mb-6">
            <BookOpen className="w-3 h-3 text-acid" />
            <span className="font-mono text-[11px] tracking-widest text-acid">VULNERABILITY DATABASE</span>
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5">
            AI Vulnerability Database
          </h1>
          <p className="text-v-muted text-lg max-w-2xl mx-auto">
            A curated, continuously updated database of AI and LLM vulnerabilities. Every entry maps to OWASP LLM Top 10, MITRE ATLAS, and VULNRA probe identifiers.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 pb-12">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: totalVulns.toString(), label: "Total vulnerabilities" },
            { num: "9",                  label: "OWASP LLM categories" },
            { num: "3",                  label: "New this month" },
            { num: "2026",               label: "Last updated" },
          ].map((s) => (
            <div key={s.label} className="border border-v-border2 rounded-lg p-4 bg-white/2 text-center">
              <p className="font-mono text-2xl font-bold text-acid">{s.num}</p>
              <p className="font-mono text-[10px] tracking-widest text-v-muted mt-1">{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category grid */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">VULNERABILITY CATEGORIES</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="border border-v-border2 rounded-xl p-5 hover:border-acid/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-acid bg-acid/10 border border-acid/20 px-1.5 py-0.5 rounded">{cat.id}</span>
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${SEVERITY_CFG[cat.severity]}`}>{cat.severity}</span>
                    </div>
                    <h3 className="font-mono text-sm font-semibold">{cat.name}</h3>
                  </div>
                  <span className="font-mono text-2xl font-bold text-acid shrink-0">{cat.count}</span>
                </div>
                <p className="text-v-muted text-xs mb-3">{cat.description}</p>
                <div className="flex flex-wrap gap-1">
                  {cat.examples.slice(0, 3).map((ex) => (
                    <span key={ex} className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-v-border2 text-v-muted2">{ex}</span>
                  ))}
                  {cat.examples.length > 3 && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-v-border2 text-v-muted2">+{cat.examples.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured vulnerability */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">FEATURED VULNERABILITY</h2>
          <div className="border border-v-red/20 bg-v-red/3 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-[10px] bg-v-red/10 border border-v-red/20 text-v-red px-2 py-0.5 rounded">{FEATURED_VULN.id}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${SEVERITY_CFG[FEATURED_VULN.severity]}`}>{FEATURED_VULN.severity}</span>
                  <span className="font-mono text-[10px] border border-v-border2 text-v-muted px-2 py-0.5 rounded">{FEATURED_VULN.category}</span>
                </div>
                <h3 className="font-mono text-base font-semibold">{FEATURED_VULN.name}</h3>
              </div>
              <span className="font-mono text-[10px] text-v-muted shrink-0">{FEATURED_VULN.discovered}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-widest text-v-muted mb-1">DESCRIPTION</p>
                <p className="text-v-muted text-sm">{FEATURED_VULN.description}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-v-muted mb-1">AFFECTED SYSTEMS</p>
                  <p className="text-v-muted text-sm">{FEATURED_VULN.affected}</p>
                </div>
                <div className="border border-acid/20 bg-acid/3 rounded-lg p-3">
                  <p className="font-mono text-[10px] tracking-widest text-acid mb-1">REMEDIATION</p>
                  <p className="text-v-muted text-sm">{FEATURED_VULN.remediation}</p>
                </div>
              </div>
            </div>
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
          <Search className="w-8 h-8 text-acid mx-auto mb-3" />
          <h2 className="font-mono text-2xl font-bold mb-3">Test your API against all of these</h2>
          <p className="text-v-muted text-sm mb-6">
            VULNRA maps every vulnerability in this database to automated probes that run against your LLM endpoint in under 60 seconds.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest bg-acid text-black px-6 py-2.5 rounded-lg font-bold hover:bg-acid/90 transition-colors">
            SCAN MY API <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
