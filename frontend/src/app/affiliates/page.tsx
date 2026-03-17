import type { Metadata } from "next";
import Link from "next/link";
import { DollarSign, Users, BarChart2, ArrowRight, Check, Shield } from "lucide-react";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Affiliate Program — Earn 20% Recurring Commission — VULNRA",
  description: "Join the VULNRA partner program. Earn 20% recurring commission on every Pro and Enterprise referral. No cap. Monthly payouts.",
};

const PARTNER_TRACKS = [
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Content Creator",
    description: "Blog posts, YouTube videos, newsletters, or social content about AI security, LLM red-teaming, or compliance.",
    bestFor: "Security bloggers, AI safety researchers, developer advocates",
    commission: "20% recurring",
    payout: "Monthly",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community Builder",
    description: "Discord servers, Slack communities, LinkedIn groups, or meetups focused on AI, security, or compliance.",
    bestFor: "Community managers, CISO networks, security conference organizers",
    commission: "20% recurring",
    payout: "Monthly",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Security Consultant",
    description: "Recommend VULNRA to clients during AI risk assessments, security audits, or compliance engagements.",
    bestFor: "Penetration testers, AI risk consultants, compliance firms",
    commission: "20% recurring",
    payout: "Monthly",
  },
  {
    icon: <DollarSign className="w-5 h-5" />,
    title: "Agency / Reseller",
    description: "White-label or bundle VULNRA scans into your service offering. Volume discounts available.",
    bestFor: "MSPs, security agencies, AI development studios",
    commission: "20–30% recurring",
    payout: "Monthly",
  },
];

const COMMISSION_TABLE = [
  { plan: "Pro Monthly",    price: "$49/mo",   commission: "$9.80/mo",   annual: "$117.60" },
  { plan: "Pro Annual",     price: "$470/yr",  commission: "$94.00/yr",  annual: "$94.00" },
  { plan: "Enterprise",     price: "$299/mo",  commission: "$59.80/mo",  annual: "$717.60" },
  { plan: "5× Pro",         price: "$245/mo",  commission: "$49.00/mo",  annual: "$588.00" },
  { plan: "10× Enterprise", price: "$2,990/mo", commission: "$598.00/mo", annual: "$7,176.00" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Apply",         body: "Fill out the application form. We review within 48 hours." },
  { step: "02", title: "Get your link", body: "Receive a unique tracking link and access to our affiliate dashboard." },
  { step: "03", title: "Refer",         body: "Share your link in content, communities, or client proposals." },
  { step: "04", title: "Earn",          body: "Earn 20% of every payment your referrals make — for as long as they subscribe." },
  { step: "05", title: "Get paid",      body: "Monthly payouts via bank transfer or Wise. Minimum payout: $50." },
];

const FAQS = [
  {
    q: "How long does the cookie last?",
    a: "90 days. If a visitor you referred converts within 90 days of clicking your link, you earn the commission.",
  },
  {
    q: "Is there a cap on earnings?",
    a: "No. There is no cap on the number of referrals or total commission you can earn.",
  },
  {
    q: "What happens if a customer upgrades?",
    a: "You earn 20% of the new plan price going forward. Plan upgrades always increase your commission.",
  },
  {
    q: "What happens if a customer cancels?",
    a: "Commission stops when a customer cancels. Reactivations restart the commission.",
  },
  {
    q: "Can I refer my own account?",
    a: "No. Self-referrals are not permitted and will result in account termination.",
  },
  {
    q: "What countries are eligible?",
    a: "All countries are eligible. Payouts are in USD via Wise (international bank transfer) or local bank transfer for India.",
  },
];

export default function AffiliatesPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="pt-20 pb-12 px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-acid/30 bg-acid/5 mb-6">
            <DollarSign className="w-3 h-3 text-acid" />
            <span className="font-mono text-[11px] tracking-widest text-acid">AFFILIATE PROGRAM</span>
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Earn 20% Recurring Commission
          </h1>
          <p className="text-v-muted text-lg max-w-2xl mx-auto">
            Refer customers to VULNRA and earn 20% of every payment they make — for the lifetime of their subscription. No cap. Monthly payouts.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="mailto:partners@vulnra.com"
              className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest bg-acid text-black px-8 py-3 rounded-lg font-bold hover:bg-acid/90 transition-colors"
            >
              APPLY NOW <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="font-mono text-[11px] text-v-muted">partners@vulnra.com</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 pb-12">
        <div className="max-w-[1000px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "20%",   label: "Recurring commission" },
            { num: "90d",   label: "Cookie duration" },
            { num: "No cap", label: "Max earnings" },
            { num: "$50",   label: "Min payout threshold" },
          ].map((s) => (
            <div key={s.label} className="border border-v-border2 rounded-lg p-4 bg-white/2 text-center">
              <p className="font-mono text-2xl font-bold text-acid">{s.num}</p>
              <p className="font-mono text-[10px] tracking-widest text-v-muted mt-1">{s.label.toUpperCase()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partner tracks */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">PARTNER TRACKS</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PARTNER_TRACKS.map((track) => (
              <div key={track.title} className="border border-v-border2 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-acid/10 border border-acid/20 flex items-center justify-center text-acid">
                    {track.icon}
                  </div>
                  <h3 className="font-mono text-sm font-semibold">{track.title}</h3>
                </div>
                <p className="text-v-muted text-sm mb-3">{track.description}</p>
                <p className="font-mono text-[10px] text-v-muted2 mb-3">
                  <span className="text-v-muted">Best for: </span>{track.bestFor}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border border-acid/20 bg-acid/5 rounded p-2 text-center">
                    <p className="font-mono text-[9px] text-v-muted mb-0.5">COMMISSION</p>
                    <p className="font-mono text-sm font-bold text-acid">{track.commission}</p>
                  </div>
                  <div className="border border-v-border2 rounded p-2 text-center">
                    <p className="font-mono text-[9px] text-v-muted mb-0.5">PAYOUT</p>
                    <p className="font-mono text-sm">{track.payout}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission table */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[800px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4">COMMISSION EXAMPLES</h2>
          <div className="border border-v-border2 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-v-border2 bg-white/3">
                  <th className="text-left font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">REFERRAL</th>
                  <th className="text-right font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">PLAN PRICE</th>
                  <th className="text-right font-mono text-[10px] tracking-widest text-v-muted px-5 py-3">YOUR CUT</th>
                  <th className="text-right font-mono text-[10px] tracking-widest text-acid px-5 py-3">ANNUAL EARNINGS</th>
                </tr>
              </thead>
              <tbody>
                {COMMISSION_TABLE.map((row, i) => (
                  <tr key={row.plan} className={`border-b border-v-border2 last:border-0 ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                    <td className="font-mono text-xs px-5 py-3">{row.plan}</td>
                    <td className="font-mono text-xs text-v-muted text-right px-5 py-3">{row.price}</td>
                    <td className="font-mono text-xs text-right px-5 py-3">{row.commission}</td>
                    <td className="font-mono text-sm text-acid font-bold text-right px-5 py-3">{row.annual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[700px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4 text-center">HOW IT WORKS</h2>
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-v-border2" />
            <div className="space-y-0">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className="flex gap-5 pb-6">
                  <div className="relative z-10 w-10 h-10 rounded-full border border-acid/40 bg-acid/10 flex items-center justify-center shrink-0">
                    <span className="font-mono text-[10px] font-bold text-acid">{step.step}</span>
                  </div>
                  <div className="pt-2">
                    <h3 className="font-mono text-sm font-semibold mb-1">{step.title}</h3>
                    <p className="text-v-muted text-sm">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="px-6 md:px-12 pb-14">
        <div className="max-w-[700px] mx-auto">
          <h2 className="font-mono text-xs tracking-widest text-v-muted mb-4 text-center">WHAT YOU GET</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Real-time affiliate dashboard",
              "Custom tracking link",
              "Marketing assets & copy",
              "Priority support channel",
              "Early access to new features",
              "Co-marketing opportunities",
              "Monthly performance reports",
              "Dedicated affiliate manager",
            ].map((perk) => (
              <div key={perk} className="flex items-center gap-3 border border-v-border2 rounded-lg px-4 py-3">
                <Check className="w-4 h-4 text-acid shrink-0" />
                <span className="font-mono text-xs">{perk}</span>
              </div>
            ))}
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
          <DollarSign className="w-10 h-10 text-acid mx-auto mb-3" />
          <h2 className="font-mono text-2xl font-bold mb-3">Start earning today</h2>
          <p className="text-v-muted text-sm mb-6">
            Join 50+ partners already earning monthly recurring income from VULNRA referrals. Applications reviewed within 48 hours.
          </p>
          <Link
            href="mailto:partners@vulnra.com"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest bg-acid text-black px-8 py-3 rounded-lg font-bold hover:bg-acid/90 transition-colors"
          >
            APPLY NOW — IT&apos;S FREE <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <p className="font-mono text-[10px] text-v-muted mt-4">partners@vulnra.com</p>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
