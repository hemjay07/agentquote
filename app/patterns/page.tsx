import type { Metadata } from "next";
import Link from "next/link";
import { PATTERN_PAGES } from "@/lib/pattern-pages";
import PageNav from "@/components/shared/page-nav";
import PageFooter from "@/components/shared/page-footer";
import EstimateCTA from "@/components/shared/estimate-cta";

export const metadata: Metadata = {
  title: "AI Agent Architecture Patterns — Cost Comparison & Guide",
  description:
    "Compare 8 AI agent architecture patterns by cost: single call, prompt chaining, routing, parallelization, ReAct agent, multi-agent, eval-optimizer, and reflexion.",
  alternates: { canonical: "/patterns" },
};

export default function PatternsIndex() {
  return (
    <main className="min-h-screen">
      <PageNav />

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-8">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          Architecture Patterns
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          AI Agent Patterns by Cost
        </h1>
        <p className="text-[var(--text-secondary)] text-base max-w-xl">
          8 architecture patterns ranked from cheapest to most expensive. Each pattern includes cost drivers, real scenarios, and optimization tips.
        </p>
      </section>

      {/* Pattern comparison table */}
      <section className="max-w-4xl mx-auto px-6 pb-8">
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-5 py-3 text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider">Pattern</th>
                  <th className="px-5 py-3 text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider text-center">Low</th>
                  <th className="px-5 py-3 text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider text-center">Mid</th>
                  <th className="px-5 py-3 text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider text-center">High</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {PATTERN_PAGES.map((pattern) => (
                  <tr key={pattern.slug} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[var(--text-primary)]">{pattern.profile.label}</p>
                      <p className="text-xs text-[var(--text-dim)] mt-0.5 max-w-xs">{pattern.profile.description}</p>
                    </td>
                    <td className="px-5 py-3 text-center font-mono text-[var(--text-secondary)]">{pattern.profile.base_calls_low}</td>
                    <td className="px-5 py-3 text-center font-mono text-[var(--text-primary)]">{pattern.profile.base_calls_mid}</td>
                    <td className="px-5 py-3 text-center font-mono text-[var(--warning)]">{pattern.profile.base_calls_high}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/patterns/${pattern.slug}`} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs transition-colors">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 border-t border-[var(--border)] text-xs text-[var(--text-dim)]">
            API calls per conversation (low / mid / high scenario)
          </div>
        </div>
      </section>

      {/* Pattern cards */}
      <section className="max-w-4xl mx-auto px-6 pb-8 grid sm:grid-cols-2 gap-4">
        {PATTERN_PAGES.map((pattern) => (
          <Link
            key={pattern.slug}
            href={`/patterns/${pattern.slug}`}
            className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-colors"
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
              {pattern.profile.label}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
              {pattern.profile.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {pattern.useCases.slice(0, 2).map((u) => (
                <span key={u} className="text-[10px] bg-[var(--bg-elevated)] text-[var(--text-dim)] border border-[var(--border)] rounded px-2 py-0.5">
                  {u}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>

      <div className="max-w-3xl mx-auto px-6">
        <EstimateCTA heading="Estimate costs for your architecture pattern" />
      </div>

      <PageFooter />
    </main>
  );
}
