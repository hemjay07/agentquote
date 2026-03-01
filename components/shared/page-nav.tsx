import Link from "next/link";

export default function PageNav({ rightElement }: { rightElement?: React.ReactNode }) {
  return (
    <nav className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-[var(--accent)] font-bold text-lg">◆</span>
        <span className="font-semibold tracking-tight text-[var(--text-primary)]">
          AgentQuote
        </span>
      </Link>
      {rightElement ?? (
        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
          <Link href="/blog" className="hover:text-[var(--text-primary)] transition-colors">Blog</Link>
          <Link href="/costs" className="hover:text-[var(--text-primary)] transition-colors">Pricing</Link>
          <Link href="/patterns" className="hover:text-[var(--text-primary)] transition-colors">Patterns</Link>
          <Link
            href="/estimate"
            className="bg-[var(--accent)] text-black font-semibold px-4 py-1.5 rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-sm"
          >
            Estimate
          </Link>
        </div>
      )}
    </nav>
  );
}
