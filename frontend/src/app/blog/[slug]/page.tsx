import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import { POSTS, getPost } from "../data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — VULNRA Blog`,
    description: post.description,
    alternates: { canonical: `https://vulnra.ai/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://vulnra.ai/blog/${slug}`,
      siteName: "VULNRA",
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
    keywords: post.tags.join(", "),
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Attack Techniques": "text-v-red border-v-red/40 bg-v-red/8",
  "Compliance":        "text-[#4db8ff] border-[#4db8ff]/40 bg-[#4db8ff]/8",
  "RAG Security":      "text-v-amber border-v-amber/40 bg-v-amber/8",
  "Tools":             "text-acid border-acid/40 bg-acid/8",
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const catCls = CATEGORY_COLORS[post.category] ?? "text-acid border-acid/40 bg-acid/8";

  const otherPosts = POSTS.filter((p) => p.slug !== slug).slice(0, 3);

  // JSON-LD structured data for GEO/SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "author": { "@type": "Organization", "name": "VULNRA", "url": "https://vulnra.ai" },
    "publisher": {
      "@type": "Organization",
      "name": "VULNRA",
      "url": "https://vulnra.ai",
      "logo": { "@type": "ImageObject", "url": "https://vulnra.ai/og-image.png" },
    },
    "keywords": post.tags.join(", "),
    "url": `https://vulnra.ai/blog/${slug}`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://vulnra.ai/blog/${slug}` },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicNav />

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-16">

          {/* Main article */}
          <article>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-v-muted2 mb-8">
              <Link href="/blog" className="hover:text-acid transition-colors">BLOG</Link>
              <span>/</span>
              <span className={`px-1.5 py-0.5 rounded border text-[7.5px] font-bold ${catCls}`}>
                {post.category.toUpperCase()}
              </span>
            </nav>

            {/* Title block */}
            <header className="mb-10">
              <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-5 leading-snug">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] text-v-muted2 mb-6">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[8.5px] tracking-wider text-v-muted2 border border-v-border px-2 py-0.5 rounded-[2px]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-8 h-px bg-v-border2" />
            </header>

            {/* Body */}
            <div className="space-y-8">
              {post.body.map((section, i) => (
                <section key={i}>
                  {section.heading && (
                    <h2 className="font-mono text-lg font-bold tracking-tight text-foreground mb-3 flex items-center gap-3">
                      <span className="text-acid text-[13px] shrink-0">//</span>
                      {section.heading}
                    </h2>
                  )}
                  <p className="text-[14px] text-v-muted font-light leading-[1.85] whitespace-pre-line">
                    {section.text}
                  </p>
                </section>
              ))}
            </div>

            {/* Article footer CTA */}
            <div className="mt-14 border border-v-border rounded-lg p-8 bg-v-bg1 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-acid/30 to-transparent" />
              <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-acid mb-3">
                Test your LLM API now
              </p>
              <p className="text-sm text-v-muted font-light mb-5 leading-relaxed">
                VULNRA scans for every vulnerability category covered in this article — automated, documented, and mapped to OWASP LLM Top 10.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-widest bg-acid text-black px-5 py-2.5 rounded-sm hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(184,255,87,0.3)] transition-all"
              >
                START FREE SCAN →
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-8">

              {/* Table of Contents */}
              <div>
                <div className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-v-muted2 mb-4">In this article</div>
                <nav className="flex flex-col gap-1">
                  {post.body.filter((s) => s.heading).map((s) => (
                    <span
                      key={s.heading}
                      className="font-mono text-[10.5px] text-v-muted2 py-1 flex items-start gap-2 leading-snug"
                    >
                      <span className="w-3 h-px bg-v-border2 shrink-0 mt-2" />
                      {s.heading}
                    </span>
                  ))}
                </nav>
              </div>

              {/* More articles */}
              {otherPosts.length > 0 && (
                <div>
                  <div className="font-mono text-[8.5px] tracking-[0.2em] uppercase text-v-muted2 mb-4">More articles</div>
                  <div className="flex flex-col gap-3">
                    {otherPosts.map((p) => {
                      const cc = CATEGORY_COLORS[p.category] ?? "text-acid border-acid/40 bg-acid/8";
                      return (
                        <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                          <div className="border border-v-border rounded p-3 bg-v-bg1 hover:border-acid/25 hover:bg-acid/[0.025] transition-all">
                            <span className={`text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-widest mb-2 inline-block ${cc}`}>
                              {p.category.toUpperCase()}
                            </span>
                            <p className="font-mono text-[10.5px] text-v-muted group-hover:text-acid transition-colors leading-snug">
                              {p.title}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mini CTA */}
              <div className="border border-acid/20 rounded-lg p-4 bg-acid/5">
                <p className="font-mono text-[9px] tracking-widest text-acid uppercase mb-2">Free scan</p>
                <p className="font-mono text-[10.5px] text-v-muted leading-snug mb-3">
                  Test your LLM API with Garak, DeepTeam, and PyRIT — no install required.
                </p>
                <Link
                  href="/signup"
                  className="block text-center font-mono text-[9px] font-bold tracking-widest bg-acid text-black px-3 py-2 rounded-sm hover:opacity-90 transition-opacity"
                >
                  START FREE →
                </Link>
              </div>

            </div>
          </aside>

        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
