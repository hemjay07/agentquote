"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, estimate: null, reminder_date: null }),
      });
      setSubscribed(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

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
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-8 text-center">
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
        <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
          Describe your system. Get cost estimates in seconds.
        </p>
        <Link
          href="/estimate"
          className="inline-block bg-[var(--accent)] text-black font-semibold px-8 py-3 rounded-md hover:bg-green-400 transition-colors text-lg"
        >
          Estimate Your System →
        </Link>
        <p className="text-xs text-[var(--text-secondary)] mt-4 max-w-lg mx-auto">
          Built from real experiments: 4.8x multi-agent overhead · 49% max savings · 14 validated cost formulas
        </p>
      </section>

      {/* Built from real experiments — compact */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--bg-card)]">
          <h2
            className="text-lg font-bold mb-3"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Built from real experiments, not guesses
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-5">
            Every formula comes from hands-on experiments building agent systems
            from raw API calls. No frameworks, no abstractions — real token
            counts and real dollar amounts.
          </p>
          <div className="flex items-center justify-between text-center">
            {[
              { num: "5", label: "days of experiments" },
              { num: "14", label: "validated insights" },
              { num: "49%", label: "max savings found" },
              { num: "4.8x", label: "multi-agent overhead" },
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

      {/* Built in Public */}
      <section className="max-w-4xl mx-auto px-6 pb-8">
        <div className="border border-[var(--border)] rounded-lg px-6 py-3 bg-[var(--bg-card)] flex items-center justify-between">
          <p className="text-sm text-[var(--text-secondary)]">
            Day 9/30 — AI Mastery Curriculum
          </p>
          <a
            href="https://twitter.com/mikimujeeb"
            target="_blank"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Follow the build →
          </a>
        </div>
      </section>

      {/* What's Coming */}
      <section className="max-w-4xl mx-auto px-6 pb-8">
        <details className="border border-[var(--border)] rounded-lg bg-[var(--bg-card)]">
          <summary className="px-6 py-4 cursor-pointer text-sm font-medium text-[var(--text-primary)] select-none">
            What&apos;s coming next
          </summary>
          <div className="px-6 pb-4 space-y-2">
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Compare estimates vs actual costs (CSV upload)
            </p>
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <span className="text-[var(--text-secondary)]">○</span>
              SDK usage tracker for real-time monitoring
            </p>
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <span className="text-[var(--text-secondary)]">○</span>
              Multi-provider cost comparison (Anthropic, OpenAI, Google)
            </p>
            <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
              <span className="text-[var(--text-secondary)]">○</span>
              Team dashboards for agency-wide cost tracking
            </p>
          </div>
        </details>
      </section>

      {/* Email capture */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--bg-card)] text-center">
          <p className="text-sm font-medium mb-4">
            Get notified when new features launch
          </p>
          {subscribed ? (
            <p className="text-sm text-green-400">You&apos;re on the list.</p>
          ) : (
            <div className="flex items-center gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              />
              <button
                onClick={handleSubscribe}
                disabled={loading || !email}
                className="bg-[var(--accent)] text-black font-semibold px-5 py-2 rounded-md hover:bg-green-400 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
              >
                {loading ? "..." : "Subscribe"}
              </button>
            </div>
          )}
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
