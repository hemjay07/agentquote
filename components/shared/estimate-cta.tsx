import Link from "next/link";

export default function EstimateCTA({
  heading = "Ready to estimate your agent costs?",
  subtext = "Describe your system, get a cost breakdown in 60 seconds. Free, no signup required.",
}: {
  heading?: string;
  subtext?: string;
}) {
  return (
    <section className="border border-[var(--border)] rounded-xl p-8 bg-[var(--bg-card)] text-center my-12">
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{heading}</h2>
      <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md mx-auto">{subtext}</p>
      <Link
        href="/estimate"
        className="inline-block bg-[var(--accent)] text-black font-semibold px-8 py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-base shadow-lg shadow-[var(--accent)]/10"
      >
        Estimate Your System →
      </Link>
    </section>
  );
}
