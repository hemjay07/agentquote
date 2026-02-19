import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] font-bold text-lg">◆</span>
          <span className="font-semibold tracking-tight">AgentQuote</span>
        </div>
        <span className="text-xs text-[var(--text-secondary)] border border-[var(--border)] rounded px-2 py-1">
          beta
        </span>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <p className="text-[var(--accent)] text-sm font-medium tracking-wide uppercase mb-4">
          Stop guessing. Start estimating.
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight mb-6"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Know what your AI agents
          <br />
          <span className="text-[var(--accent)]">will actually cost</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Describe your agent system. Get a detailed cost breakdown with
          low/medium/high scenarios, architecture diagram, and optimization
          recommendations — in seconds.
        </p>
        <Link
          href="/estimate"
          className="inline-block bg-[var(--accent)] text-black font-semibold px-8 py-3 rounded-md hover:bg-green-400 transition-colors text-lg"
        >
          Estimate Your System →
        </Link>
      </section>

      {/* Problem stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { stat: "500-1000%", label: "how much agencies underestimate AI costs at scale" },
            { stat: "65%", label: "of IT leaders report unexpected AI charges" },
            { stat: "$0", label: "tools that do this estimation properly" },
          ].map((item) => (
            <div
              key={item.stat}
              className="border border-[var(--border)] rounded-lg p-5 bg-[var(--bg-card)]"
            >
              <p className="text-2xl font-bold text-[var(--accent)] mb-1">
                {item.stat}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2
          className="text-2xl font-bold text-center mb-10"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Describe",
              desc: "Paste a description of your agent system, or use our guided form to configure it step by step.",
            },
            {
              step: "02",
              title: "Review",
              desc: "We parse your description and show our assumptions. Correct anything that's wrong — recalculation is free.",
            },
            {
              step: "03",
              title: "Estimate",
              desc: "Get low/mid/high cost scenarios, an architecture diagram, and ranked optimization recommendations.",
            },
          ].map((item) => (
            <div key={item.step} className="relative">
              <span className="text-5xl font-bold text-[var(--bg-card)] absolute -top-2 -left-1">
                {item.step}
              </span>
              <div className="relative pt-8">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Built from real data */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="border border-[var(--border)] rounded-lg p-8 bg-[var(--bg-card)]">
          <h2
            className="text-xl font-bold mb-4"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Built from real experiments, not guesses
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
            Every formula in AgentQuote comes from hands-on experiments building
            agent systems from raw API calls. No frameworks, no abstractions —
            just real token counts and real dollar amounts.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { num: "5", label: "days of experiments" },
              { num: "14", label: "validated insights" },
              { num: "49%", label: "max savings found" },
              { num: "4.8x", label: "multi-agent overhead measured" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xl font-bold text-[var(--accent)]">
                  {item.num}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-xs text-[var(--text-secondary)]">
        <p>
          AgentQuote — built in public by{" "}
          <a
            href="https://twitter.com/mikimujeeb"
            className="text-[var(--accent)] hover:underline"
            target="_blank"
          >
            @mikimujeeb
          </a>
        </p>
      </footer>
    </main>
  );
}
