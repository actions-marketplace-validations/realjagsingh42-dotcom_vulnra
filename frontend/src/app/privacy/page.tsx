import type { Metadata } from "next";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — VULNRA",
  description:
    "VULNRA's privacy policy explains what data we collect, how we use it, and your rights under GDPR, DPDP Act 2023, and CCPA.",
  alternates: { canonical: "https://vulnra.ai/privacy" },
};

const SECTIONS = [
  {
    id: "overview",
    num: "01",
    title: "Overview",
    body: `VULNRA ("we", "us", "our") is an AI vulnerability scanning platform. This Privacy Policy explains what personal data we collect when you use vulnra.ai and our API, how we process it, and the rights available to you.

This policy applies to all users globally and is designed to meet the requirements of the EU General Data Protection Regulation (GDPR), India's Digital Personal Data Protection Act 2023 (DPDP Act), and the California Consumer Privacy Act (CCPA). If you have questions, contact us at privacy@vulnra.ai.`,
  },
  {
    id: "data-collected",
    num: "02",
    title: "Data We Collect",
    body: `Account data: email address, hashed password, OAuth provider ID (GitHub or Google). We never store plain-text passwords.

Scan data: LLM API endpoint URLs you submit for scanning, probe results, risk scores, and AI Judge outputs. This data is stored in Supabase PostgreSQL and linked to your account.

API keys: we store only the SHA-256 hash of your vk_live_ API keys, not the keys themselves. The full key is shown once at creation time.

Usage and telemetry: scan counts, scan timestamps, tier information, and rate-limit counters stored in Redis and Supabase for quota enforcement.

Billing data: subscription tier, Lemon Squeezy customer ID and subscription ID. We do not store payment card details — these are handled entirely by Lemon Squeezy.

Log data: HTTP request logs (IP address, user agent, request path, timestamp) retained for up to 90 days for security monitoring and debugging.`,
  },
  {
    id: "how-we-use",
    num: "03",
    title: "How We Use Your Data",
    body: `Service delivery: to authenticate you, execute scans, store and retrieve your results, and generate PDF compliance reports.

Security and fraud prevention: to detect abuse, enforce usage quotas, investigate suspected unauthorized scanning, and protect the integrity of the platform.

Billing: to validate your subscription tier, process payments via Lemon Squeezy, and send billing-related emails.

Communications: to send transactional emails (email confirmation, password reset, Sentinel alerts) via Resend. We do not send marketing emails without your explicit opt-in.

Platform improvement: aggregate, anonymised scan statistics to improve probe coverage and detection accuracy. We never use individual scan data to train external models.`,
  },
  {
    id: "legal-basis",
    num: "04",
    title: "Legal Basis for Processing (GDPR)",
    body: `Contract performance (Art. 6(1)(b)): processing your account data and scan results to deliver the Service you signed up for.

Legitimate interests (Art. 6(1)(f)): security monitoring, fraud prevention, and aggregate analytics to improve the platform.

Legal obligation (Art. 6(1)(c)): retaining billing records as required by applicable tax and accounting laws.

Consent (Art. 6(1)(a)): marketing communications, if and when you opt in. You may withdraw consent at any time by contacting privacy@vulnra.ai.`,
  },
  {
    id: "data-retention",
    num: "05",
    title: "Data Retention",
    body: `Scan results: retained for the duration of your account plus 30 days after account deletion.

Account data: deleted within 30 days of account deletion request.

HTTP logs: retained for 90 days then automatically purged.

Billing records: retained for 7 years as required by Indian and international accounting regulations.

You may request deletion of all your personal data at any time by emailing privacy@vulnra.ai. We will complete deletion within 30 days (or within the timeframe required by applicable law).`,
  },
  {
    id: "data-sharing",
    num: "06",
    title: "Data Sharing & Sub-processors",
    body: `We share personal data only with the following sub-processors, all of whom are bound by GDPR-compliant Data Processing Agreements:

• Supabase Inc. (database, auth) — United States
• Railway Corporation (hosting/deployment) — United States
• Lemon Squeezy (billing) — United States
• Resend Inc. (transactional email) — United States
• Anthropic, PBC (AI Judge — Claude API) — United States; only probe response text is sent, no account PII

We do not sell, rent, or trade your personal data to third parties for advertising or marketing purposes.`,
  },
  {
    id: "international-transfers",
    num: "07",
    title: "International Data Transfers",
    body: `Our sub-processors are based in the United States. Data transfers from the EU/EEA to the US rely on Standard Contractual Clauses (SCCs) as the legal transfer mechanism. For Indian users, data transfers comply with the requirements of the DPDP Act 2023, including use of trusted geographies and contractual safeguards where required.`,
  },
  {
    id: "your-rights",
    num: "08",
    title: "Your Rights",
    body: `Depending on your location, you have the following rights regarding your personal data:

Right to access: request a copy of the personal data we hold about you.
Right to rectification: request correction of inaccurate data.
Right to erasure ("right to be forgotten"): request deletion of your data, subject to legal retention requirements.
Right to restrict processing: request that we limit how we use your data.
Right to data portability: receive your scan results in a machine-readable format (JSON or CSV).
Right to object: object to processing based on legitimate interests.
Right to withdraw consent: where processing is based on consent, withdraw it at any time.
CCPA rights: California residents may request disclosure, deletion, and opt-out of sale (we do not sell data).
DPDP rights: Indian residents may access, correct, and request erasure of their data under the DPDP Act 2023.

To exercise any of these rights, contact privacy@vulnra.ai. We will respond within 30 days (or within the period required by applicable law).`,
  },
  {
    id: "cookies",
    num: "09",
    title: "Cookies & Local Storage",
    body: `We use the following cookies and storage mechanisms:

Authentication cookies: Supabase session cookies (sb-access-token, sb-refresh-token) are strictly necessary for authentication. They are HttpOnly, Secure, and SameSite=Lax.

No tracking or advertising cookies are set. We do not use Google Analytics, Facebook Pixel, or any third-party analytics that tracks individual behaviour across websites.

You can disable cookies in your browser settings, but this will prevent authentication from working.`,
  },
  {
    id: "security",
    num: "10",
    title: "Security Measures",
    body: `We apply the following technical and organisational measures to protect your data:

• All data in transit is encrypted with TLS 1.2+
• Passwords are hashed using Supabase Auth (bcrypt)
• API keys are stored as SHA-256 hashes; the plain-text key is never persisted
• Database access is restricted to application service accounts with least-privilege permissions
• Scan result data is stored in row-level-security-enabled Supabase tables
• Security incidents are disclosed to affected users within 72 hours of discovery

To report a security vulnerability in VULNRA, email security@vulnra.ai.`,
  },
  {
    id: "children",
    num: "11",
    title: "Children's Privacy",
    body: `VULNRA is a professional security tool intended for use by developers and security engineers aged 18 and over. We do not knowingly collect personal data from anyone under the age of 18. If you believe a minor has created an account, contact privacy@vulnra.ai and we will delete the account promptly.`,
  },
  {
    id: "changes",
    num: "12",
    title: "Changes to This Policy",
    body: `We may update this Privacy Policy to reflect changes in our practices or applicable law. We will notify registered users by email at least 14 days before material changes take effect. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of the Service after the effective date constitutes acceptance.`,
  },
  {
    id: "contact-privacy",
    num: "13",
    title: "Contact & Data Controller",
    body: `Data controller: VULNRA
Privacy enquiries: privacy@vulnra.ai
Security reports: security@vulnra.ai
Legal: legal@vulnra.ai

For EU/EEA users exercising GDPR rights, we aim to respond within 30 days. For DPDP Act requests from Indian users, we aim to respond within 30 days as required by law.`,
  },
];

const TOC_ITEMS = SECTIONS.map((s) => [s.title, `#${s.id}`]);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16">

          {/* Sticky TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <div className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-v-muted2 mb-4">Contents</div>
              <nav className="flex flex-col gap-1">
                {TOC_ITEMS.map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="font-mono text-[11px] text-v-muted2 hover:text-acid transition-colors py-1 flex items-center gap-2 group"
                  >
                    <span className="w-3 h-px bg-v-border2 group-hover:bg-acid/50 transition-colors shrink-0" />
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <article>
            <div className="mb-12">
              <div className="inline-flex items-center gap-2.5 font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-4">
                <span className="w-5 h-px bg-acid/35" />
                Legal
                <span className="w-5 h-px bg-acid/35" />
              </div>
              <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px] text-v-muted2">
                <span>Last updated: <span className="text-acid">15 March 2026</span></span>
                <span>·</span>
                <span>Effective: <span className="text-acid">15 March 2026</span></span>
              </div>
            </div>

            <div className="space-y-10">
              {SECTIONS.map((section) => (
                <section key={section.id} id={section.id}>
                  <h2 className="font-mono text-xl font-bold tracking-tight mb-4 flex items-center gap-3">
                    <span className="text-acid text-[13px]">{section.num}</span>
                    {section.title}
                  </h2>
                  <p className="text-[14px] text-v-muted font-light leading-[1.8] whitespace-pre-line">
                    {section.body}
                  </p>
                  <div className="mt-8 h-px bg-v-border2" />
                </section>
              ))}
            </div>
          </article>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
