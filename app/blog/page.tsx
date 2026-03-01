import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-posts";
import PageNav from "@/components/shared/page-nav";
import PageFooter from "@/components/shared/page-footer";

export const metadata: Metadata = {
  title: "Blog — AI Agent Cost Insights & Optimization Tips",
  description:
    "Practical guides on AI agent costs, optimization strategies, and architecture patterns. Based on real experimental data from building agent systems.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <main className="min-h-screen">
      <PageNav />

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-8">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          Blog
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          AI Agent Cost Insights
        </h1>
        <p className="text-[var(--text-secondary)] text-base max-w-lg">
          Practical guides on agent costs, optimization, and architecture — backed by real experimental data.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-12 space-y-4">
        {BLOG_POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent)]/10 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                {post.category}
              </span>
              <span className="text-xs text-[var(--text-dim)]">{post.readTime}</span>
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1.5">
              {post.title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {post.description}
            </p>
          </Link>
        ))}
      </section>

      <PageFooter />
    </main>
  );
}
