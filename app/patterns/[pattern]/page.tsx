import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PATTERN_PAGES, getPatternPage } from "@/lib/pattern-pages";
import PageNav from "@/components/shared/page-nav";
import PageFooter from "@/components/shared/page-footer";
import EstimateCTA from "@/components/shared/estimate-cta";

export function generateStaticParams() {
  return PATTERN_PAGES.map((p) => ({ pattern: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pattern: string }>;
}): Promise<Metadata> {
  const { pattern: slug } = await params;
  const pattern = getPatternPage(slug);
  if (!pattern) return {};
  return {
    title: `${pattern.profile.label} — AI Agent Architecture Cost Guide`,
    description: `${pattern.profile.label}: ${pattern.profile.description} ${pattern.profile.base_calls_low}-${pattern.profile.base_calls_high} API calls per conversation. Cost scenarios and optimization tips.`,
    alternates: { canonical: `/patterns/${slug}` },
  };
}

export default async function PatternDetailPage({
  params,
}: {
  params: Promise<{ pattern: string }>;
}) {
  const { pattern: slug } = await params;
  const pattern = getPatternPage(slug);
  if (!pattern) notFound();

  return (
    <main className="min-h-screen">
      <PageNav />

      <section className="max-w-3xl mx-auto px-6 pt-16 pb-8">
        <Link
          href="/patterns"
          className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors mb-6 inline-block"
        >
          &larr; All patterns
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          {pattern.profile.label}
        </h1>
        <p className="text-[var(--text-secondary)] text-base max-w-lg mb-8">
          {pattern.profile.description}
        </p>

        {/* API calls card */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-4">API Calls per Conversation</h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-xs text-[var(--text-dim)] mb-1">Low</p>
              <p className="text-2xl font-bold font-mono text-[var(--text-secondary)]">{pattern.profile.base_calls_low}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-dim)] mb-1">Mid</p>
              <p className="text-2xl font-bold font-mono text-[var(--accent)]">{pattern.profile.base_calls_mid}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-dim)] mb-1">High</p>
              <p className="text-2xl font-bold font-mono text-[var(--warning)]">{pattern.profile.base_calls_high}</p>
            </div>
          </div>
        </div>

        {/* Use cases */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-4">Best Use Cases</h2>
          <div className="flex flex-wrap gap-2">
            {pattern.useCases.map((u) => (
              <span key={u} className="text-xs bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border)] rounded-lg px-3 py-1.5">
                {u}
              </span>
            ))}
          </div>
        </div>

        {/* Cost drivers */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-4">Cost Drivers</h2>
          <ul className="space-y-2">
            {pattern.costDrivers.map((d) => (
              <li key={d} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent)] mt-1 shrink-0">•</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Cost scenarios */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-4">Monthly Cost Scenarios</h2>
          <div className="space-y-3">
            {pattern.exampleMonthly.map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{s.volume}</p>
                  <p className="text-xs text-[var(--text-dim)]">{s.model}</p>
                </div>
                <p className="text-lg font-bold font-mono text-[var(--accent)]">{s.cost}<span className="text-xs text-[var(--text-dim)] font-normal">/mo</span></p>
              </div>
            ))}
          </div>
        </div>

        {/* Optimization tips */}
        <div className="border border-[var(--border)] rounded-xl p-6 bg-[var(--bg-card)] mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-dim)] uppercase tracking-wider mb-4">Optimization Tips</h2>
          <ul className="space-y-2">
            {pattern.optimizationTips.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="text-[var(--accent)] mt-1 shrink-0">→</span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <EstimateCTA heading={`Estimate your ${pattern.profile.label.toLowerCase()} costs`} />
      </section>

      <PageFooter />
    </main>
  );
}
