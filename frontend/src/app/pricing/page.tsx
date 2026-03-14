"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Minus,
  ArrowRight,
  ChevronDown,
  Zap,
  Shield,
  Building2,
} from "lucide-react";

/* ─── Tier Data ─────────────────────────────────────────────── */
const tiers = [
  {
    name: "FREE",
    icon: <Zap className="w-4 h-4" />,
    monthlyPrice: "$0",
    annualPrice: "$0",
    annualNote: "",
    description:
      "For developers evaluating their first model. No card required.",
    cta: { label: "Start scanning free", href: "/scanner", style: "outline" as const },
    features: [
      { text: "1 scan per day", included: true },
      { text: "Risk score (0–10)", included: true },
      { text: "1 blurred finding preview", included: true },
      { text: "Standard probe set", included: true },
      { text: "Full finding details", included: false },
      { text: "Compliance mapping (EU AI Act, DPDP)", included: false },
      { text: "PDF audit export", included: false },
      { text: "Sentinel monitoring", included: false },
      { text: "CLI + API access", included: false },
    ],
  },
  {
    name: "PRO",
    icon: <Shield className="w-4 h-4" />,
    monthlyPrice: "$49",
    annualPrice: "$39",
    annualNote: "Billed annually — $470/year",
    featured: true,
    description:
      "For developers and teams who need full findings and compliance coverage.",
    cta: { label: "Upgrade to Pro", href: "/signup", style: "solid" as const },
    features: [
      { text: "Unlimited scans", included: true },
      { text: "All findings, fully unblurred", included: true },
      { text: "EU AI Act, India DPDP, NIST mapping", included: true },
      { text: "ISO 42001 + OWASP LLM Top 10", included: true },
      { text: "MITRE ATLAS mapping", included: true },
      { text: "PDF compliance audit export", included: true },
      { text: "Sentinel recurring monitoring", included: true },
      { text: "CLI + REST API access", included: true },
      { text: "GitHub Action for CI/CD", included: true },
    ],
  },
  {
    name: "ENTERPRISE",
    icon: <Building2 className="w-4 h-4" />,
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    annualNote: "",
    description:
      "Custom compliance needs, SLAs, on-prem, and team management.",
    cta: {
      label: "Contact sales",
      href: "mailto:sales@vulnra.ai",
      style: "ghost" as const,
    },
    features: [
      { text: "Everything in Pro", included: true },
      { text: "On-premise deployment", included: true },
      { text: "Custom compliance frameworks", included: true },
      { text: "SSO + SCIM provisioning", included: true },
      { text: "Dedicated Slack channel", included: true },
      { text: "Custom SLA with uptime guarantee", included: true },
      { text: "Invoiced billing (INR/USD/EUR)", included: true },
      { text: "SOC 2 Type II documentation", included: true },
      { text: "Priority engineering support", included: true },
    ],
  },
];

/* ─── Comparison Table ──────────────────────────────────────── */
const comparisonData = [
  {
    category: "Scanning",
    rows: [
      { feature: "Scans per day", free: "1", pro: "Unlimited", enterprise: "Unlimited" },
      { feature: "Probe types", free: "Basic (8)", pro: "Full (40+)", enterprise: "Full + Custom" },
      { feature: "Single-turn attacks", free: "✓", pro: "✓", enterprise: "✓" },
      { feature: "Multi-turn attack chains", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "Custom payloads", free: "–", pro: "–", enterprise: "✓" },
    ],
  },
  {
    category: "Compliance",
    rows: [
      { feature: "OWASP LLM Top 10", free: "✓", pro: "✓", enterprise: "✓" },
      { feature: "EU AI Act mapping", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "India DPDP Act 2023", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "NIST AI RMF", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "ISO 42001", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "MITRE ATLAS", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "Custom frameworks", free: "–", pro: "–", enterprise: "✓" },
    ],
  },
  {
    category: "Output",
    rows: [
      { feature: "Risk score", free: "✓", pro: "✓", enterprise: "✓" },
      { feature: "Full finding details", free: "Blurred", pro: "✓", enterprise: "✓" },
      { feature: "PDF audit export", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "JSON / API export", free: "–", pro: "✓", enterprise: "✓" },
    ],
  },
  {
    category: "Platform",
    rows: [
      { feature: "CLI tool", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "REST API", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "GitHub Action", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "Sentinel monitoring", free: "–", pro: "✓", enterprise: "✓" },
      { feature: "SSO + SCIM", free: "–", pro: "–", enterprise: "✓" },
      { feature: "On-premise", free: "–", pro: "–", enterprise: "✓" },
      { feature: "SLA guarantee", free: "–", pro: "–", enterprise: "✓" },
    ],
  },
];

/* ─── FAQ ───────────────────────────────────────────────────── */
const faqs = [
  {
    q: "Can I try VULNRA for free?",
    a: "Yes. The Free tier gives you 1 scan per day, a risk score, and a blurred preview of one finding. No credit card required.",
  },
  {
    q: "Does VULNRA work for India DPDP compliance?",
    a: "Yes. VULNRA is the only LLM security scanner that maps findings to India DPDP Act 2023 sections, in addition to EU AI Act, NIST AI RMF, ISO 42001, and OWASP LLM Top 10.",
  },
  {
    q: "What is included in the compliance PDF?",
    a: "The Pro compliance PDF includes all findings, risk scores, and specific citations from EU AI Act, India DPDP, NIST AI RMF, ISO 42001, and OWASP LLM Top 10 for each vulnerability found.",
  },
  {
    q: "How does VULNRA compare to a $16,000 manual audit?",
    a: "VULNRA Pro at $49/month delivers automated LLM red-teaming with compliance-mapped findings in 60 seconds. Manual audits from firms like Schellman cost $16,000+ with 2-week turnaround. VULNRA is a 99% cost reduction for continuous coverage.",
  },
  {
    q: "Is there an annual billing discount?",
    a: "Yes. Annual billing is available at a 20% discount — Pro at $470/year instead of $588/year on monthly billing.",
  },
];

/* ─── Components ────────────────────────────────────────────── */

function FeatureCheck({ included }: { included: boolean }) {
  return included ? (
    <Check className="w-3.5 h-3.5 text-acid flex-shrink-0 mt-0.5" />
  ) : (
    <Minus className="w-3.5 h-3.5 text-white/20 flex-shrink-0 mt-0.5" />
  );
}

function CompareCell({ value }: { value: string }) {
  if (value === "✓") return <span className="text-acid">{value}</span>;
  if (value === "–") return <span className="text-white/20">{value}</span>;
  if (value === "Blurred") return <span className="text-v-amber">{value}</span>;
  return <span>{value}</span>;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-v-border2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left font-mono text-[12.5px] font-semibold tracking-wide hover:text-acid transition-colors"
      >
        {q}
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-400 ${
          open ? "max-h-60 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-[13.5px] text-v-muted font-light leading-7">
          {a}
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────── */

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const btnClass = {
    outline:
      "w-full py-3 rounded-sm font-mono text-[10.5px] tracking-widest font-semibold border border-v-border text-foreground hover:border-white/20 hover:-translate-y-0.5 transition-all text-center block",
    solid:
      "w-full py-3 rounded-sm font-mono text-[10.5px] tracking-widest font-bold bg-acid text-black hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(184,255,87,0.28)] transition-all text-center block",
    ghost:
      "w-full py-3 rounded-sm font-mono text-[10.5px] tracking-widest font-semibold border border-acid/20 text-acid hover:bg-acid/5 hover:-translate-y-0.5 transition-all text-center block",
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="pt-28 pb-16 px-6 md:px-12 text-center relative">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[radial-gradient(ellipse,rgba(184,255,87,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 font-mono text-[9.5px] tracking-[0.24em] uppercase text-acid mb-4 opacity-0 animate-[fadeUp_0.5s_ease_forwards_0.1s]">
            <span className="w-5 h-px bg-acid/35" />
            Pricing
            <span className="w-5 h-px bg-acid/35" />
          </div>

          <h1 className="font-mono text-4xl md:text-5xl lg:text-[56px] font-bold tracking-tight mb-4 opacity-0 animate-[fadeUp_0.5s_ease_forwards_0.2s]">
            Replace a $16,000 audit
            <br />
            for{" "}
            <span className="text-acid">$49 a month.</span>
          </h1>

          <p className="text-[15px] text-v-muted max-w-[520px] mx-auto mb-10 leading-relaxed font-light opacity-0 animate-[fadeUp_0.5s_ease_forwards_0.3s]">
            The same compliance-mapped LLM security report that specialist firms
            charge $16,000 for. Automated. In 60 seconds.
          </p>

          {/* VS Banner */}
          <div className="max-w-[880px] mx-auto bg-v-bg1 border border-v-border rounded-md px-7 py-5 flex items-center justify-center gap-10 flex-wrap mb-10 opacity-0 animate-[fadeUp_0.5s_ease_forwards_0.32s]">
            <div className="text-center">
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-1">
                Manual Audit (Schellman)
              </div>
              <div className="font-mono text-[22px] font-bold text-v-red">
                $16,000
              </div>
              <div className="font-mono text-[11px] text-white/20 mt-0.5">
                one-time · 2 week turnaround
              </div>
            </div>
            <div className="font-mono text-[28px] text-white/7 font-light">
              →
            </div>
            <div className="text-center">
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-1">
                VULNRA Pro
              </div>
              <div className="font-mono text-[22px] font-bold text-acid">
                $49/mo
              </div>
              <div className="font-mono text-[11px] text-white/20 mt-0.5">
                unlimited · 60 seconds
              </div>
            </div>
            <div className="font-mono text-[28px] text-white/7 font-light">
              =
            </div>
            <div className="text-center">
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-white/20 mb-1">
                Cost Reduction
              </div>
              <div className="font-mono text-[22px] font-bold text-acid">
                99%
              </div>
              <div className="font-mono text-[11px] text-white/20 mt-0.5">
                same compliance output
              </div>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-v-bg1 border border-v-border rounded px-2 py-1.5 opacity-0 animate-[fadeUp_0.5s_ease_forwards_0.38s]">
            <button
              onClick={() => setAnnual(false)}
              className={`font-mono text-[10px] tracking-widest px-3.5 py-1.5 rounded-sm transition-all ${
                !annual
                  ? "bg-acid text-black font-bold"
                  : "text-white/20 hover:text-white/40"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`font-mono text-[10px] tracking-widest px-3.5 py-1.5 rounded-sm transition-all ${
                annual
                  ? "bg-acid text-black font-bold"
                  : "text-white/20 hover:text-white/40"
              }`}
            >
              Annual
            </button>
            <span className="font-mono text-[8.5px] tracking-widest text-acid bg-acid/8 border border-acid/18 px-2 py-0.5 rounded-sm">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* ── Pricing Cards ─────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-v-border2 border border-v-border rounded-md overflow-hidden opacity-0 animate-[fadeUp_0.6s_ease_forwards_0.4s]">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`bg-background p-8 md:p-10 relative transition-colors ${
                tier.featured
                  ? "bg-v-bg2 border border-acid/18"
                  : ""
              }`}
            >
              {/* Most Popular Badge */}
              {tier.featured && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 font-mono text-[8.5px] tracking-[0.2em] bg-acid text-black px-3 py-1 font-bold rounded-b-sm">
                  MOST POPULAR
                </div>
              )}

              {/* Tier Header */}
              <div className="flex items-center gap-2 font-mono text-[9.5px] tracking-[0.22em] uppercase text-white/20 mb-3">
                {tier.icon}
                {tier.name}
              </div>

              {/* Price */}
              <div className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-1 leading-none">
                {annual ? tier.annualPrice : tier.monthlyPrice}
                {tier.name !== "ENTERPRISE" && tier.name !== "FREE" && (
                  <span className="text-sm font-light text-v-muted font-sans ml-0.5">
                    /mo
                  </span>
                )}
              </div>

              {/* Annual Note */}
              <div
                className={`font-mono text-[9px] tracking-wider text-acid min-h-[14px] mb-2.5 transition-opacity ${
                  annual && tier.annualNote ? "opacity-100" : "opacity-0"
                }`}
              >
                {tier.annualNote}
              </div>

              <p className="text-[13px] text-v-muted font-light leading-relaxed mb-7">
                {tier.description}
              </p>

              <div className="h-px bg-v-border mb-6" />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 mb-8">
                {tier.features.map((f, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2.5 text-[13px] font-light leading-snug ${
                      f.included ? "text-v-muted" : "text-white/15"
                    }`}
                  >
                    <FeatureCheck included={f.included} />
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href={tier.cta.href} className={btnClass[tier.cta.style]}>
                {tier.cta.label} <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-center mb-10">
            Full feature comparison
          </h2>

          <div className="border border-v-border rounded-md overflow-hidden overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left font-mono text-[9.5px] tracking-[0.18em] uppercase text-white/20 px-5 py-3.5 bg-v-bg1 border-b border-v-border">
                    Feature
                  </th>
                  <th className="text-center font-mono text-[9.5px] tracking-[0.18em] uppercase text-white/20 px-5 py-3.5 bg-v-bg1 border-b border-v-border">
                    Free
                  </th>
                  <th className="text-center font-mono text-[9.5px] tracking-[0.18em] uppercase text-acid px-5 py-3.5 bg-v-bg1 border-b border-v-border">
                    Pro
                  </th>
                  <th className="text-center font-mono text-[9.5px] tracking-[0.18em] uppercase text-white/20 px-5 py-3.5 bg-v-bg1 border-b border-v-border">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((cat) => (
                  <>
                    {/* Category Row */}
                    <tr key={`cat-${cat.category}`}>
                      <td
                        colSpan={4}
                        className="font-mono text-[9px] tracking-[0.18em] uppercase text-acid bg-v-bg1 px-5 py-2.5"
                      >
                        {cat.category}
                      </td>
                    </tr>
                    {/* Feature Rows */}
                    {cat.rows.map((row, i) => (
                      <tr
                        key={`${cat.category}-${i}`}
                        className="hover:bg-white/[0.015] transition-colors"
                      >
                        <td className="text-[13px] text-v-muted font-light px-5 py-3.5 border-b border-v-border2">
                          {row.feature}
                        </td>
                        <td className="text-center font-mono text-[11px] px-5 py-3.5 border-b border-v-border2">
                          <CompareCell value={row.free} />
                        </td>
                        <td className="text-center font-mono text-[11px] px-5 py-3.5 border-b border-v-border2 bg-acid/[0.03]">
                          <CompareCell value={row.pro} />
                        </td>
                        <td className="text-center font-mono text-[11px] px-5 py-3.5 border-b border-v-border2">
                          <CompareCell value={row.enterprise} />
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pb-24">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-center mb-10">
            Frequently asked questions
          </h2>
          <div>
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="border-t border-v-border2 text-center py-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse,rgba(184,255,87,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <h2 className="font-mono text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Secure your AI <span className="text-acid">today</span>.
          </h2>
          <p className="text-[15px] text-v-muted font-light mb-9">
            Free scan. No credit card. 60 seconds to audit-ready.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/scanner"
              className="font-mono text-[11px] font-semibold tracking-widest bg-acid text-black px-6 py-3 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(184,255,87,0.3)] transition-all inline-flex items-center gap-1.5"
            >
              START FREE SCAN <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="mailto:sales@vulnra.ai"
              className="font-mono text-[11px] tracking-widest text-foreground border border-v-border px-6 py-3 rounded-sm hover:border-white/20 hover:-translate-y-0.5 transition-all inline-flex items-center gap-1.5"
            >
              TALK TO SALES
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
