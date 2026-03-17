import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Compliance Explorer — VULNRA",
  description:
    "Full OWASP LLM Top 10, MITRE ATLAS, EU AI Act, and NIST AI RMF coverage. See how VULNRA maps every scan to the frameworks your compliance team needs.",
};

/* ─── OWASP LLM Top 10 (2025) ──────────────────────────────────────────────── */
const OWASP_LLM = [
  {
    id: "LLM01", severity: "CRITICAL",
    name: "Prompt Injection",
    desc: "Malicious inputs manipulate the LLM into overriding its instructions or performing unintended actions. Covers direct injection (user input) and indirect injection (documents, tool responses).",
    probes: ["Direct injection", "Indirect injection", "HijackKill", "Role-play bypass", "System-override"],
    vulnra: "Core jailbreak + prompt injection probe suite (15+ variants per scan)",
  },
  {
    id: "LLM02", severity: "CRITICAL",
    name: "Sensitive Information Disclosure",
    desc: "The model inadvertently reveals training data, API secrets, internal system prompts, PII, or confidential business data through its responses.",
    probes: ["PII extraction", "System prompt leak", "Training data extraction", "Credential harvesting"],
    vulnra: "Data leakage category — PII, system prompt, and credential probes",
  },
  {
    id: "LLM03", severity: "HIGH",
    name: "Supply Chain Vulnerabilities",
    desc: "Weaknesses in third-party model providers, fine-tuning datasets, plugins, or deployment pipelines that could compromise model integrity.",
    probes: ["Dependency confusion", "Model substitution", "Plugin abuse"],
    vulnra: "Supply chain category probes + MCP server tool-poisoning scanner",
  },
  {
    id: "LLM04", severity: "HIGH",
    name: "Data and Model Poisoning",
    desc: "Adversarial manipulation of training, fine-tuning, or RAG corpus data to alter model behaviour, introduce backdoors, or degrade safety measures.",
    probes: ["Corpus poisoning", "Backdoor triggers", "Fine-tune drift"],
    vulnra: "RAG-01 corpus poisoning probe (RAG Scanner tier)",
  },
  {
    id: "LLM05", severity: "HIGH",
    name: "Improper Output Handling",
    desc: "Downstream systems consume raw LLM output without validation — enabling XSS, SSRF, code injection, or privilege escalation in connected components.",
    probes: ["XSS via output", "SSRF via code generation", "SQL injection via code gen"],
    vulnra: "Insecure output + encoding bypass categories",
  },
  {
    id: "LLM06", severity: "MEDIUM",
    name: "Excessive Agency",
    desc: "The LLM is granted overly broad permissions (tools, APIs, file systems) such that a compromised response can cause outsized real-world harm.",
    probes: ["Unauthorised tool invocation", "Over-privileged function calls"],
    vulnra: "Agentic escape category + MCP privilege-escalation scanner",
  },
  {
    id: "LLM07", severity: "MEDIUM",
    name: "System Prompt Leakage",
    desc: "The system prompt (containing instructions, personas, business logic, or credentials) is exposed to end users through direct or indirect extraction.",
    probes: ["Repeat-my-instructions", "Ignore-and-print", "Reverse engineering"],
    vulnra: "System prompt leakage probes (part of data leakage category)",
  },
  {
    id: "LLM08", severity: "HIGH",
    name: "Vector and Embedding Weaknesses",
    desc: "Vulnerabilities in RAG architectures — including cross-tenant data leakage, unauthenticated ingestion, query injection, and raw vector exposure.",
    probes: ["Cross-tenant leakage", "Query injection", "Embedding exposure", "Unauth ingest"],
    vulnra: "Full RAG Security Scanner — RAG-01 through RAG-05",
  },
  {
    id: "LLM09", severity: "MEDIUM",
    name: "Misinformation",
    desc: "The model produces factually incorrect, misleading, or biased content that could cause harm when trusted by end-users or downstream systems.",
    probes: ["Hallucination probes", "Bias amplification", "Factual contradiction"],
    vulnra: "Hallucination + bias amplification categories",
  },
  {
    id: "LLM10", severity: "MEDIUM",
    name: "Unbounded Consumption",
    desc: "Attackers craft inputs that cause disproportionate compute, memory, or token consumption — leading to denial-of-service or runaway API costs.",
    probes: ["Recursive expansion", "Infinite loop prompt", "Sponge tokens"],
    vulnra: "Model DoS category (Pro/Enterprise tier)",
  },
];

/* ─── MITRE ATLAS ───────────────────────────────────────────────────────────── */
const MITRE_TACTICS = [
  {
    id: "AML.TA0001", name: "Reconnaissance",
    desc: "Gather intelligence about ML systems, training pipelines, and deployed models.",
    techniques: ["AML.T0000 Active Scanning", "AML.T0001 Search Victim Infrastructure"],
  },
  {
    id: "AML.TA0002", name: "Resource Development",
    desc: "Obtain infrastructure and capabilities to support attacks against ML systems.",
    techniques: ["AML.T0008 Acquire Infrastructure", "AML.T0019 Develop Adversarial Capabilities"],
  },
  {
    id: "AML.TA0003", name: "Initial Access",
    desc: "Gain a foothold into the ML system's environment.",
    techniques: ["AML.T0010 Exploit Public-Facing API", "AML.T0012 Supply Chain Compromise"],
  },
  {
    id: "AML.TA0004", name: "ML Attack Staging",
    desc: "Prepare adversarial examples, poisoned data, or attack tooling.",
    techniques: ["AML.T0043 Craft Adversarial Data", "AML.T0020 Poison Training Data"],
  },
  {
    id: "AML.TA0005", name: "Execution",
    desc: "Run adversarial inputs or malicious code in the ML pipeline.",
    techniques: ["AML.T0040 Prompt Injection", "AML.T0041 LLM Jailbreak"],
  },
  {
    id: "AML.TA0006", name: "Persistence",
    desc: "Maintain long-term access or influence over the ML system.",
    techniques: ["AML.T0048 Backdoor ML Model", "AML.T0056 LLM Meta-Prompt Extraction"],
  },
  {
    id: "AML.TA0009", name: "Exfiltration",
    desc: "Steal model parameters, training data, or inference results.",
    techniques: ["AML.T0044 Full ML Model Access", "AML.T0037 Data from Local System"],
  },
  {
    id: "AML.TA0011", name: "Impact",
    desc: "Degrade, destroy, or manipulate the ML system's behaviour.",
    techniques: ["AML.T0048 Denial of ML Service", "AML.T0015 Evade ML Model"],
  },
];

/* ─── EU AI Act ─────────────────────────────────────────────────────────────── */
const EU_AI_ARTICLES = [
  {
    id: "Art. 9", title: "Risk Management System",
    desc: "Providers of high-risk AI must establish, implement, and maintain a risk management system covering the full lifecycle.",
    vulnra: "Continuous risk scoring + Sentinel monitoring directly fulfils ongoing risk assessment requirements.",
  },
  {
    id: "Art. 10", title: "Data Governance",
    desc: "Training, validation, and testing data must be subject to data governance practices and free of errors or biases.",
    vulnra: "Data leakage + bias amplification categories identify data exposure and discriminatory outputs.",
  },
  {
    id: "Art. 13", title: "Transparency & Logging",
    desc: "High-risk AI systems must be transparent and keep detailed logs of their operation.",
    vulnra: "Every scan generates a timestamped, auditable PDF report. Audit logs available at enterprise tier.",
  },
  {
    id: "Art. 15", title: "Accuracy & Robustness",
    desc: "High-risk AI must achieve appropriate levels of accuracy and be resilient to errors and adversarial attacks.",
    vulnra: "Full adversarial probe suite — jailbreaks, encoding bypasses, multi-turn attacks — measures robustness.",
  },
  {
    id: "Art. 5", title: "Prohibited AI Practices",
    desc: "Prohibits systems that deploy subliminal manipulation, exploit vulnerabilities, or cause social scoring harm.",
    vulnra: "Bias + toxic content probes help identify whether a model can be coerced into prohibited behaviours.",
  },
  {
    id: "Art. 16", title: "Provider Obligations",
    desc: "Providers must ensure conformity assessment, registration, and corrective action for non-conforming AI.",
    vulnra: "VULNRA scan results map directly to conformity evidence. Remediation steps included in every finding.",
  },
];

/* ─── NIST AI RMF ───────────────────────────────────────────────────────────── */
const NIST_FUNCTIONS = [
  {
    id: "GOVERN",
    color: "#4db8ff",
    desc: "Establish policies, processes, and accountability for AI risk management.",
    items: [
      "GV-1.1 — Establish and document AI risk policies",
      "GV-1.2 — Define risk tolerance for AI use cases",
      "GV-4.2 — Document roles and responsibilities",
    ],
    vulnra: "Settings, API keys, org management, and audit logs support governance documentation.",
  },
  {
    id: "MAP",
    color: "#b8ff57",
    desc: "Identify and categorise AI risks in context.",
    items: [
      "MP-2.3 — Identify potential harms and threat actors",
      "MP-5.1 — Map risks to business impacts",
      "MP-6.1 — Evaluate data quality and lineage",
    ],
    vulnra: "OWASP + MITRE ATLAS compliance mappings on every finding automatically categorise risks.",
  },
  {
    id: "MEASURE",
    color: "#f5a623",
    desc: "Analyse and assess AI risks quantitatively.",
    items: [
      "MS-1.1 — Test AI systems for identified risks",
      "MS-2.6 — Measure AI model accuracy and robustness",
      "MS-3.3 — Document and track test results",
    ],
    vulnra: "Risk score (0-100), per-category scores, hit rates, and AI-judge confidence are the quantitative measures.",
  },
  {
    id: "MANAGE",
    color: "#ff4d4d",
    desc: "Prioritise and address AI risks with appropriate responses.",
    items: [
      "MG-1.3 — Respond to identified risks with mitigation plans",
      "MG-2.2 — Monitor AI systems in deployment",
      "MG-4.1 — Document responses and residual risk",
    ],
    vulnra: "Per-finding remediation guidance + Sentinel continuous monitoring cover ongoing risk management.",
  },
];

/* ─── Severity badge ────────────────────────────────────────────────────────── */
function SevBadge({ sev }: { sev: string }) {
  const map: Record<string, string> = {
    CRITICAL: "bg-v-red/15 text-v-red border-v-red/30",
    HIGH: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    MEDIUM: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
    LOW: "bg-acid/15 text-acid border-acid/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border font-mono text-[9px] tracking-widest ${map[sev] ?? "border-v-border2 text-v-muted2 bg-white/5"}`}>
      {sev}
    </span>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────────────── */
export default function CompliancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-28 pb-20">

        {/* Hero */}
        <div className="mb-16 max-w-3xl">
          <div className="inline-flex items-center gap-2.5 font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-4">
            <span className="w-5 h-px bg-acid/35" />
            Compliance
            <span className="w-5 h-px bg-acid/35" />
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Compliance Explorer
          </h1>
          <p className="text-[15px] text-v-muted font-light leading-relaxed mb-6">
            VULNRA maps every scan finding to OWASP LLM Top 10, MITRE ATLAS, EU AI Act, and
            NIST AI RMF. Use this reference to see exactly which controls each probe category covers.
          </p>
          <div className="flex flex-wrap gap-2">
            {["OWASP LLM Top 10", "MITRE ATLAS", "EU AI Act", "NIST AI RMF"].map((f) => (
              <span key={f} className="font-mono text-[10px] px-3 py-1.5 border border-v-border2 rounded-full text-v-muted2 tracking-wider">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* ── OWASP LLM Top 10 ──────────────────────────────────────── */}
        <section className="mb-20" id="owasp">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center shrink-0">
              <span className="font-mono text-[10px] font-bold text-acid">10</span>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-acid">01</div>
              <h2 className="font-mono text-xl font-bold tracking-tight">OWASP LLM Top 10 — 2025</h2>
            </div>
          </div>

          <div className="space-y-3">
            {OWASP_LLM.map((item) => (
              <details key={item.id} className="group border border-v-border2 rounded-xl overflow-hidden hover:border-acid/20 transition-colors">
                <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer list-none hover:bg-white/[0.02] transition-colors">
                  <span className="font-mono text-[11px] font-bold text-acid w-12 shrink-0">{item.id}</span>
                  <span className="font-mono text-[13px] font-semibold text-white flex-1">{item.name}</span>
                  <SevBadge sev={item.severity} />
                  <span className="text-v-muted2 text-[10px] font-mono tracking-wider hidden sm:inline">
                    {item.probes.length} probe types
                  </span>
                  <span className="font-mono text-[9px] text-v-muted2 tracking-wider group-open:rotate-90 transition-transform ml-2">▶</span>
                </summary>
                <div className="px-5 pb-5 border-t border-v-border2 bg-white/[0.01] grid md:grid-cols-2 gap-6 pt-4">
                  <div>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-v-muted2 mb-2">Description</div>
                    <p className="text-[13px] text-v-muted leading-relaxed font-light">{item.desc}</p>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-v-muted2 mt-4 mb-2">Probe Types Tested</div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.probes.map((p) => (
                        <span key={p} className="font-mono text-[10px] px-2 py-0.5 bg-white/5 border border-v-border2 rounded text-v-muted2">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] tracking-widest uppercase text-acid/70 mb-2">How VULNRA covers this</div>
                    <div className="border border-acid/15 rounded-lg p-3 bg-acid/5">
                      <p className="font-mono text-[12px] text-v-muted leading-relaxed">{item.vulnra}</p>
                    </div>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── MITRE ATLAS ───────────────────────────────────────────── */}
        <section className="mb-20" id="mitre">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#4db8ff]/10 border border-[#4db8ff]/20 flex items-center justify-center shrink-0">
              <span className="font-mono text-[8px] font-bold text-[#4db8ff]">ATL</span>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-[#4db8ff]">02</div>
              <h2 className="font-mono text-xl font-bold tracking-tight">MITRE ATLAS — ML Attack Tactics</h2>
            </div>
          </div>

          <p className="font-mono text-[13px] text-v-muted leading-relaxed mb-6 max-w-3xl">
            MITRE ATLAS is the adversarial ML threat matrix, modelled after ATT&CK. Each VULNRA probe
            category maps to one or more ATLAS tactics and techniques.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MITRE_TACTICS.map((t) => (
              <div key={t.id} className="border border-v-border2 rounded-xl p-4 hover:border-[#4db8ff]/25 transition-colors">
                <div className="font-mono text-[9px] tracking-widest text-[#4db8ff] mb-1">{t.id}</div>
                <div className="font-mono text-[12px] font-bold text-white mb-2">{t.name}</div>
                <p className="font-mono text-[11px] text-v-muted2 leading-relaxed mb-3">{t.desc}</p>
                <div className="space-y-1">
                  {t.techniques.map((tech) => (
                    <div key={tech} className="font-mono text-[9.5px] text-v-muted2 flex items-start gap-1.5">
                      <span className="text-[#4db8ff]/50 shrink-0">▸</span>
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── EU AI Act ─────────────────────────────────────────────── */}
        <section className="mb-20" id="eu-ai-act">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shrink-0">
              <span className="font-mono text-[8px] font-bold text-yellow-400">EU</span>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-yellow-400">03</div>
              <h2 className="font-mono text-xl font-bold tracking-tight">EU AI Act — Key Articles</h2>
            </div>
          </div>
          <p className="font-mono text-[13px] text-v-muted leading-relaxed mb-6 max-w-3xl">
            The EU AI Act (Regulation (EU) 2024/1689) imposes risk-based obligations for AI systems.
            VULNRA scan evidence directly supports compliance for high-risk and general-purpose AI.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EU_AI_ARTICLES.map((a) => (
              <div key={a.id} className="border border-v-border2 rounded-xl p-5 hover:border-yellow-400/20 transition-colors">
                <div className="font-mono text-[10px] font-bold text-yellow-400 mb-2">{a.id}</div>
                <div className="font-mono text-[12px] font-bold text-white mb-2">{a.title}</div>
                <p className="font-mono text-[11px] text-v-muted2 leading-relaxed mb-3">{a.desc}</p>
                <div className="border-t border-v-border2 pt-3">
                  <div className="font-mono text-[8.5px] tracking-widest uppercase text-yellow-400/70 mb-1">VULNRA coverage</div>
                  <p className="font-mono text-[10.5px] text-v-muted leading-relaxed">{a.vulnra}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── NIST AI RMF ───────────────────────────────────────────── */}
        <section className="mb-20" id="nist">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
              <span className="font-mono text-[8px] font-bold text-orange-400">NIST</span>
            </div>
            <div>
              <div className="font-mono text-[9px] tracking-widest uppercase text-orange-400">04</div>
              <h2 className="font-mono text-xl font-bold tracking-tight">NIST AI RMF — Core Functions</h2>
            </div>
          </div>
          <p className="font-mono text-[13px] text-v-muted leading-relaxed mb-6 max-w-3xl">
            The NIST AI Risk Management Framework (AI 100-1) defines four core functions for managing
            AI risk. VULNRA supports all four.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {NIST_FUNCTIONS.map((fn) => (
              <div
                key={fn.id}
                className="border rounded-xl p-5 hover:opacity-90 transition-opacity"
                style={{ borderColor: `${fn.color}25`, background: `${fn.color}06` }}
              >
                <div
                  className="font-mono text-[18px] font-black tracking-widest mb-2"
                  style={{ color: fn.color }}
                >
                  {fn.id}
                </div>
                <p className="font-mono text-[11px] text-v-muted2 leading-relaxed mb-4">{fn.desc}</p>
                <div className="space-y-1.5 mb-4">
                  {fn.items.map((item) => (
                    <div key={item} className="font-mono text-[9.5px] text-v-muted2 flex items-start gap-1.5">
                      <span style={{ color: fn.color }} className="shrink-0 opacity-60">▸</span>
                      {item}
                    </div>
                  ))}
                </div>
                <div className="border-t border-white/5 pt-3">
                  <div className="font-mono text-[8.5px] tracking-widest uppercase mb-1" style={{ color: `${fn.color}99` }}>
                    VULNRA
                  </div>
                  <p className="font-mono text-[10px] text-v-muted leading-relaxed">{fn.vulnra}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <div className="border border-acid/20 rounded-xl p-10 bg-acid/5 text-center">
          <div className="font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-3">
            Get Coverage
          </div>
          <h3 className="font-mono text-2xl font-bold mb-3">
            Every scan automatically maps to all four frameworks
          </h3>
          <p className="font-mono text-[13px] text-v-muted mb-6 max-w-lg mx-auto leading-relaxed">
            Start a free scan and download a compliance-mapped PDF report in minutes.
            No credit card required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-acid text-black font-mono text-[12px] tracking-widest uppercase px-6 py-3 rounded-lg font-bold hover:bg-acid/90 transition-colors"
            >
              Start Free →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 border border-v-border2 text-v-muted font-mono text-[12px] tracking-widest uppercase px-6 py-3 rounded-lg hover:border-acid/30 hover:text-white transition-colors"
            >
              View Plans
            </Link>
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
