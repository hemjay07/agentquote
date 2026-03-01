import type { Metadata } from "next";
import Link from "next/link";
import { MODEL_PAGES } from "@/lib/model-pages";
import PageNav from "@/components/shared/page-nav";
import PageFooter from "@/components/shared/page-footer";
import EstimateCTA from "@/components/shared/estimate-cta";

export const metadata: Metadata = {
  title: "AI Model Pricing Comparison — LLM API Costs for Agents",
  description:
    "Compare AI model pricing for agent systems: Claude Haiku, Sonnet, Opus, GPT-4o, GPT-4o Mini, and DeepSeek V3. Input/output costs, scenarios, and optimization tips.",
  alternates: { canonical: "/costs" },
};

export default function CostsIndex() {
  return (
    <main className="min-h-screen">
      <PageNav />

      <section className="max-w-4xl mx-auto px-6 pt-20 pb-8">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          Model Pricing
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          AI Model Costs for Agent Systems
        </h1>
        <p className="text-[var(--text-secondary)] text-base max-w-xl">
          Compare input and output pricing across 6 major LLMs. See real cost scenarios for agent workloads at different volumes.
        </p>
      </section>

      {/* Pricing comparison table */}
      <section className="max-w-4xl mx-auto px-6 pb-8">
        <div className="border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--bg-card)]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="px-5 py-3 text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider">Model</th>
                  <th className="px-5 py-3 text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider">Provider</th>
                  <th className="px-5 py-3 text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider text-right">Input $/M</th>
                  <th className="px-5 py-3 text-xs text-[var(--text-dim)] font-medium uppercase tracking-wider text-right">Output $/M</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {MODEL_PAGES.map((model) => (
                  <tr key={model.slug} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{model.pricing.label}</td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">{model.provider}</td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--text-primary)]">${model.pricing.input.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right font-mono text-[var(--text-primary)]">${model.pricing.output.toFixed(2)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/costs/${model.slug}`} className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-xs transition-colors">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Model cards */}
      <section className="max-w-4xl mx-auto px-6 pb-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODEL_PAGES.map((model) => (
          <Link
            key={model.slug}
            href={`/costs/${model.slug}`}
            className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[var(--text-primary)]">{model.pricing.label}</span>
              <span className="text-[10px] text-[var(--text-dim)] border border-[var(--border)] rounded-full px-2 py-0.5">{model.provider}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3 line-clamp-2">
              {model.description}
            </p>
            <div className="flex gap-4 text-xs">
              <div>
                <span className="text-[var(--text-dim)]">Input: </span>
                <span className="font-mono text-[var(--accent)]">${model.pricing.input.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[var(--text-dim)]">Output: </span>
                <span className="font-mono text-[var(--accent)]">${model.pricing.output.toFixed(2)}</span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <div className="max-w-3xl mx-auto px-6">
        <EstimateCTA heading="Get a cost estimate for your specific system" />
      </div>

      <PageFooter />
    </main>
  );
}
