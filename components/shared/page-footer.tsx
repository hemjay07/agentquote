import Link from "next/link";

export default function PageFooter() {
  return (
    <footer className="border-t border-[var(--border)] mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[var(--accent)] font-bold text-lg">◆</span>
              <span className="font-semibold text-[var(--text-primary)]">AgentQuote</span>
            </div>
            <p className="text-xs text-[var(--text-dim)] leading-relaxed">
              AI agent cost calculator backed by real experimental data.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Product</p>
            <div className="flex flex-col gap-2">
              <Link href="/estimate" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Cost Estimator</Link>
              <Link href="/costs" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Model Pricing</Link>
              <Link href="/patterns" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Architecture Patterns</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Learn</p>
            <div className="flex flex-col gap-2">
              <Link href="/blog" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Blog</Link>
              <Link href="/blog/ai-agent-cost-2026" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">AI Agent Costs 2026</Link>
              <Link href="/blog/reduce-agent-costs" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Reduce Agent Costs</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Connect</p>
            <div className="flex flex-col gap-2">
              <a href="https://x.com/__mujeeb__" target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors">Twitter / X</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-dim)]">
          AgentQuote — built in public by{" "}
          <a href="https://x.com/__mujeeb__" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors" target="_blank" rel="noopener noreferrer">
            @__mujeeb__
          </a>
        </div>
      </div>
    </footer>
  );
}
