import type { Metadata } from "next";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import { POSTS } from "./data";

export const metadata: Metadata = {
  title: "Blog — VULNRA | AI Security & LLM Vulnerability Research",
  description:
    "In-depth articles on LLM security, prompt injection, OWASP LLM Top 10, RAG pipeline security, EU AI Act compliance, and AI red teaming best practices.",
  alternates: { canonical: "https://vulnra.ai/blog" },
  openGraph: {
    title: "VULNRA Blog — AI Security & LLM Vulnerability Research",
    description: "Expert guides on prompt injection, RAG security, OWASP LLM Top 10, and EU AI Act compliance.",
    url: "https://vulnra.ai/blog",
    siteName: "VULNRA",
    type: "website",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Attack Techniques": "text-v-red border-v-red/40 bg-v-red/8",
  "Compliance":        "text-[#4db8ff] border-[#4db8ff]/40 bg-[#4db8ff]/8",
  "RAG Security":      "text-v-amber border-v-amber/40 bg-v-amber/8",
  "Tools":             "text-acid border-acid/40 bg-acid/8",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-28 pb-20">

        {/* Header */}
        <div className="mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2.5 font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-5">
            <span className="w-5 h-px bg-acid/35" />
            Research & Insights
            <span className="w-5 h-px bg-acid/35" />
          </div>
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight mb-5 leading-[1.1]">
            AI Security<br />
            <span style={{ color: "#b8ff57" }}>Intelligence</span>
          </h1>
          <p className="text-base text-v-muted font-light leading-relaxed">
            Expert-written guides on LLM vulnerability research, prompt injection, RAG security,
            and regulatory compliance. Built for security engineers and developers shipping AI in production.
          </p>
        </div>

        {/* Featured post */}
        <div className="mb-10">
          {(() => {
            const post = POSTS[0];
            const catCls = CATEGORY_COLORS[post.category] ?? "text-acid border-acid/40 bg-acid/8";
            return (
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="border border-v-border rounded-lg p-8 bg-v-bg1 hover:border-acid/30 hover:bg-acid/[0.03] transition-all duration-200 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-acid/30 to-transparent" />
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`text-[7.5px] font-mono font-bold px-2 py-1 rounded border tracking-widest ${catCls}`}>
                      {post.category.toUpperCase()}
                    </span>
                    <span className="text-[9px] font-mono text-v-muted2">FEATURED</span>
                  </div>
                  <h2 className="font-mono text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-4 group-hover:text-acid transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-sm text-v-muted font-light leading-relaxed mb-6 max-w-3xl">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="font-mono text-[8.5px] tracking-wider text-v-muted2 border border-v-border px-2 py-0.5 rounded-[2px]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="font-mono text-[9px] text-v-muted2 ml-auto">{post.date} · {post.readTime}</span>
                  </div>
                </div>
              </Link>
            );
          })()}
        </div>

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {POSTS.slice(1).map((post) => {
            const catCls = CATEGORY_COLORS[post.category] ?? "text-acid border-acid/40 bg-acid/8";
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="h-full border border-v-border rounded-lg p-6 bg-v-bg1 hover:border-acid/30 hover:bg-acid/[0.03] transition-all duration-200 flex flex-col">
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className={`text-[7.5px] font-mono font-bold px-2 py-1 rounded border tracking-widest ${catCls}`}>
                      {post.category.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="font-mono text-base font-bold tracking-tight text-foreground mb-3 group-hover:text-acid transition-colors leading-snug flex-1">
                    {post.title}
                  </h2>
                  <p className="text-[12.5px] text-v-muted font-light leading-relaxed mb-5 line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="font-mono text-[8px] tracking-wider text-v-muted2 border border-v-border px-1.5 py-0.5 rounded-[2px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="font-mono text-[9px] text-v-muted2">
                    {post.date} · {post.readTime}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 border border-v-border rounded-lg p-10 text-center bg-v-bg1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-acid/30 to-transparent" />
          <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-acid mb-4">Ready to test your LLM?</p>
          <h3 className="font-mono text-2xl font-bold text-foreground mb-4">
            Stop reading about vulnerabilities.<br />Start finding them.
          </h3>
          <p className="text-sm text-v-muted font-light mb-8 max-w-lg mx-auto leading-relaxed">
            VULNRA runs Garak, DeepTeam, PyRIT, and EasyJailbreak against your API in one scan — with OWASP mapping and PDF compliance reports.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest bg-acid text-black px-6 py-3 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(184,255,87,0.3)] transition-all"
          >
            START FREE SCAN →
          </Link>
        </div>

      </div>

      <PublicFooter />
    </div>
  );
}
