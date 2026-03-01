import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MODEL_PAGES, getModelPage } from "@/lib/model-pages";
import PageNav from "@/components/shared/page-nav";
import PageFooter from "@/components/shared/page-footer";
import EstimateCTA from "@/components/shared/estimate-cta";

export function generateStaticParams() {
  return MODEL_PAGES.map((m) => ({ model: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ model: string }>;
}): Promise<Metadata> {
  const { model: slug } = await params;
  const model = getModelPage(slug);
  if (!model) return {};
  return {
    title: `${model.pricing.label} Pricing — AI Agent Cost Calculator`,
    description: `${model.pricing.label} costs $${model.pricing.input}/M input, $${model.pricing.output}/M output. See real agent cost scenarios, comparisons, and optimization tips.`,
    alternates: { canonical: `/costs/${slug}` },
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: slug } = await params;
  const model = getModelPage(slug);
  if (!model) notFound();

  return (
    <main className="min-h-screen">
      <PageNav />

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8">
        <Link
          href="/costs"
          className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors mb-6 inline-block"
        >
          &larr; All models
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] text-[var(--text-dim)] border border-[var(--border)] rounded-full px-2.5 py-0.5 uppercase tracking-wider">
            {model.provider}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {model.pricing.label} Pricing
        </h1>
        <p className="text-[var(--text-secondary)] text-base max-w-lg mb-8">
          {model.description}
        </p>

        {/* Pricing card */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider">Token Pricing</h2>
            <span className="text-[10px] text-[var(--text-dim)]">Last updated: {model.lastUpdated}</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-[var(--text-dim)] mb-1">Input (per 1M tokens)</p>
              <p className="text-2xl font-bold font-mono text-[var(--accent)]">${model.pricing.input.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-dim)] mb-1">Output (per 1M tokens)</p>
              <p className="text-2xl font-bold font-mono text-[var(--accent)]">${model.pricing.output.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Best for */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-4">Best For</h2>
          <div className="flex flex-wrap gap-2">
            {model.bestFor.map((use) => (
              <span key={use} className="text-xs bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5">
                {use}
              </span>
            ))}
          </div>
        </div>

        {/* Scenarios */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-4">Cost Scenarios</h2>
          <div className="space-y-3">
            {model.scenarios.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{s.label}</p>
                  <p className="text-xs text-[var(--text-dim)]">{s.turnsPerConversation} turns/convo</p>
                </div>
                <p className="text-lg font-bold font-mono text-[var(--accent)]">{s.monthlyCost}<span className="text-xs text-[var(--text-dim)] font-normal">/mo</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Comparisons */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-4">Compared To</h2>
          <div className="space-y-4">
            {model.comparedTo.map((c) => (
              <div key={c.slug}>
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/costs/${c.slug}`} className="text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                    {c.label}
                  </Link>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.verdict}</p>
              </div>
            ))}
          </div>
        </div>

        <EstimateCTA heading={`Get a ${model.pricing.label} cost estimate for your system`} />
      </section>

      <PageFooter />
    </main>
  );
}
