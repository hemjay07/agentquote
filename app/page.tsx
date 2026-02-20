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
          <span className="font-semibold tracking-tight text-[var(--text-primary)]">
            AgentQuote
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-dim)] border border-[var(--border)] rounded-full px-2.5 py-0.5 uppercase tracking-widest">
          beta
        </span>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-28 pb-6 text-center">
        <p className="text-[var(--accent)] text-xs font-semibold tracking-[0.2em] uppercase mb-5">
          Stop guessing. Start estimating.
        </p>
        <h1 className="text-4xl md:text-5xl font-bold leading-[1.15] mb-5 tracking-tight">
          Know what your AI agents
          <br />
          <span className="text-[var(--accent)]">will actually cost</span>
        </h1>
        <p className="text-base text-[var(--text-secondary)] max-w-md mx-auto mb-8">
          Describe your system. Get cost estimates in seconds.
        </p>
        <Link
          href="/estimate"
          className="inline-block bg-[var(--accent)] text-black font-semibold px-8 py-3 rounded-lg hover:bg-[var(--accent-hover)] transition-colors text-base shadow-lg shadow-[var(--accent)]/10"
        >
          Estimate Your System →
        </Link>
        <p className="text-[11px] text-[var(--text-dim)] mt-5 max-w-lg mx-auto leading-relaxed">
          Built from real experiments: 4.8x multi-agent overhead · 49% max savings · 14 validated cost formulas
        </p>
      </section>

      {/* Built from real experiments */}
      <section className="max-w-3xl mx-auto px-6 py-14">
        <div className="border border-[var(--border)] rounded-xl p-7 bg-[var(--bg-card)]">
          <h2 className="text-base font-semibold mb-2 text-[var(--text-primary)]">
            Built from real experiments, not guesses
          </h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
            Every formula comes from hands-on experiments building agent systems
            from raw API calls. Real token counts, real dollar amounts.
          </p>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { num: "5", label: "days of experiments" },
              { num: "14", label: "validated insights" },
              { num: "49%", label: "max savings found" },
              { num: "4.8x", label: "multi-agent overhead" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-lg font-bold text-[var(--accent)]">{item.num}</p>
                <p className="text-[11px] text-[var(--text-dim)] mt-0.5">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built in Public */}
      <section className="max-w-3xl mx-auto px-6 pb-4">
        <div className="border border-[var(--border)] rounded-xl px-6 py-3.5 bg-[var(--bg-card)] flex items-center justify-between">
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--text-dim)]">Day 14/30</span> — AI Mastery Curriculum
          </p>
          <a
            href="https://twitter.com/mikimujeeb"
            target="_blank"
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Follow the build →
          </a>
        </div>
      </section>

      {/* What's Coming */}
      <section className="max-w-3xl mx-auto px-6 py-4">
        <details className="border border-[var(--border)] rounded-xl bg-[var(--bg-card)] overflow-hidden">
          <summary className="px-6 py-3.5 cursor-pointer text-sm text-[var(--text-primary)] select-none hover:bg-[var(--bg-secondary)] transition-colors">
            What&apos;s coming next
          </summary>
          <div className="px-6 pb-4 space-y-3 border-t border-[var(--border)] pt-3">
            {[
              {
                text: "White-label PDF reports",
                desc: "Brand with your agency logo, send to clients as a professional cost proposal",
                badge: "Coming next",
                badgeColor: "text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10",
              },
              {
                text: "Estimate vs actual comparison",
                desc: "Upload usage CSV to calibrate future estimates",
                badge: "Available",
                badgeColor: "text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10",
                done: true,
              },
              {
                text: "Full proposal generation",
                desc: "Scope, timeline, deliverables + cost breakdown in one document",
              },
              {
                text: "Post-project cost tracking",
                desc: "Monitor real spend against your original estimate",
              },
              {
                text: "Client verification portal",
                desc: "Let clients independently verify agency quotes",
              },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2.5">
                <span className="mt-1.5 shrink-0">
                  {item.done ? (
                    <span className="text-[var(--accent)] text-xs">✓</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)] inline-block" />
                  )}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[var(--text-primary)] font-medium">{item.text}</p>
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.done ? "✓ " : ""}{item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* Email capture */}
      <section className="max-w-3xl mx-auto px-6 pt-4 pb-20">
        <div className="border border-[var(--border)] rounded-xl p-7 bg-[var(--bg-card)] text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-4">
            Get notified when new features launch
          </p>
          {subscribed ? (
            <p className="text-sm text-[var(--accent)]">You&apos;re on the list.</p>
          ) : (
            <div className="flex items-center gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-dim)]"
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              />
              <button
                onClick={handleSubscribe}
                disabled={loading || !email}
                className="bg-[var(--accent)] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
              >
                {loading ? "..." : "Subscribe"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-8 text-center text-xs text-[var(--text-dim)]">
        AgentQuote — built in public by{" "}
        <a
          href="https://twitter.com/mikimujeeb"
          className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          target="_blank"
        >
          @mikimujeeb
        </a>
      </footer>
    </main>
  );
}
