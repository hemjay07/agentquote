import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog-posts";
import PageNav from "@/components/shared/page-nav";
import PageFooter from "@/components/shared/page-footer";
import EstimateCTA from "@/components/shared/estimate-cta";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: ["Mujeeb"],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Person", name: "Mujeeb", url: "https://x.com/__mujeeb__" },
    publisher: { "@type": "Organization", name: "AgentQuote", url: "https://agentquote.vercel.app" },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <PageNav />

      <article className="max-w-2xl mx-auto px-6 pt-16 pb-8">
        <Link
          href="/blog"
          className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors mb-6 inline-block"
        >
          &larr; All posts
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] text-[var(--accent)] border border-[var(--accent)]/30 bg-[var(--accent)]/10 rounded-full px-2.5 py-0.5 uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-xs text-[var(--text-dim)]">{post.readTime}</span>
          <span className="text-xs text-[var(--text-dim)]">{post.date}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="prose-custom">{post.content()}</div>

        <EstimateCTA />
      </article>

      <PageFooter />
    </main>
  );
}
