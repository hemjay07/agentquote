import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "AgentQuote — AI Agent Cost Calculator | Estimate LLM API Costs Free",
  description:
    "Calculate how much your AI agent system will cost to run. Get instant cost breakdowns, optimization suggestions (up to 49% savings), and architecture analysis — backed by 14 validated formulas from real experiments.",
  alternates: {
    canonical: "/",
  },
};

import EmailCaptureHome from "@/components/shared/email-capture-home";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does it cost to run an AI agent?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Costs range from $50/month for a simple single-agent chatbot to $13,000+/month for multi-agent orchestration systems. The main cost drivers are token consumption, model choice, tool call overhead, and conversation volume.",
      },
    },
    {
      "@type": "Question",
      name: "What makes AgentQuote different from other LLM cost calculators?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most calculators only do token math. AgentQuote models real-world agent behaviors: tool call overhead (2 API calls per tool use), multi-agent context duplication (4.8x measured overhead), memory strategy costs, and failure retry loops. Every formula comes from hands-on experiments.",
      },
    },
    {
      "@type": "Question",
      name: "Which AI models and patterns are supported?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We support all major models (Claude, GPT-4, GPT-4o, Llama, Mistral) and 8 architecture patterns: single agent, multi-agent orchestration, pipeline, parallel, RAG, evaluator-optimizer, agentic loop, and human-in-the-loop.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate are the cost estimates?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Our estimates are based on 14 validated formulas from real experiments measuring token economics, tool call overhead, pattern cost spectrums, multi-agent overhead (4.8x), and memory strategies. We provide low/mid/high scenarios.",
      },
    },
    {
      "@type": "Question",
      name: "Is AgentQuote free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, completely free. No signup required. Describe your system and get your cost breakdown in about 60 seconds, plus optimization suggestions that can save up to 49%.",
      },
    },
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] font-bold text-lg">◆</span>
          <span className="font-semibold tracking-tight text-[var(--text-primary)]">
            AgentQuote
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
          <Link href="/blog" className="hover:text-[var(--text-primary)] transition-colors hidden sm:inline">Blog</Link>
          <Link href="/costs" className="hover:text-[var(--text-primary)] transition-colors hidden sm:inline">Pricing</Link>
          <Link href="/patterns" className="hover:text-[var(--text-primary)] transition-colors hidden sm:inline">Patterns</Link>
          <span className="text-[10px] text-[var(--text-dim)] border border-[var(--border)] rounded-full px-2.5 py-0.5 uppercase tracking-widest">
            beta
          </span>
        </div>
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
          Built from real experiments: 4.8x multi-agent overhead · 49% max
          savings · 14 validated cost formulas
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { num: "8", label: "architecture patterns" },
              { num: "14", label: "validated insights" },
              { num: "49%", label: "max savings found" },
              { num: "4.8x", label: "multi-agent overhead" },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-lg font-bold text-[var(--accent)]">
                  {item.num}
                </p>
                <p className="text-[11px] text-[var(--text-dim)] mt-0.5">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built in Public */}
      <section className="max-w-3xl mx-auto px-6 pb-4">
        <div className="border border-[var(--border)] rounded-xl px-6 py-3.5 bg-[var(--bg-card)] flex items-center justify-between">
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="text-[var(--text-dim)]">Day 9/30</span> — AI Agent
            Costs
          </p>
          <a
            href="https://x.com/__mujeeb__"
            target="_blank"
            rel="noopener noreferrer"
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
                badgeColor:
                  "text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10",
              },
              {
                text: "Estimate vs actual comparison",
                desc: "Upload usage CSV to calibrate future estimates",
                badge: "Available",
                badgeColor:
                  "text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/10",
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
                    <p className="text-sm text-[var(--text-primary)] font-medium">
                      {item.text}
                    </p>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                      >
                        {item.done ? "✓ " : ""}
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* Resources — internal links */}
      <section className="max-w-3xl mx-auto px-6 py-4">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            {
              href: "/blog",
              title: "Blog",
              desc: "Guides on agent costs, optimization tips, and architecture deep-dives",
            },
            {
              href: "/costs",
              title: "Model Pricing",
              desc: "Compare input/output costs across Claude, GPT-4o, DeepSeek, and more",
            },
            {
              href: "/patterns",
              title: "Architecture Patterns",
              desc: "8 patterns ranked by cost — from single call to multi-agent orchestration",
            },
          ].map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="border border-[var(--border)] rounded-xl p-5 bg-[var(--bg-card)] hover:border-[var(--border-hover)] transition-colors"
            >
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{r.title}</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{r.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ — SEO-rich content */}
      <section className="max-w-3xl mx-auto px-6 py-4">
        <details className="border border-[var(--border)] rounded-xl bg-[var(--bg-card)] overflow-hidden">
          <summary className="px-6 py-3.5 cursor-pointer text-sm text-[var(--text-primary)] select-none hover:bg-[var(--bg-secondary)] transition-colors">
            Frequently asked questions
          </summary>
          <div className="px-6 pb-5 space-y-5 border-t border-[var(--border)] pt-4">
            {[
              {
                q: "How much does it cost to run an AI agent?",
                a: "Costs range from $50/month for a simple single-agent chatbot to $13,000+/month for multi-agent orchestration systems. The main cost drivers are token consumption, model choice, tool call overhead, and conversation volume. Our calculator gives you exact estimates based on your specific architecture.",
              },
              {
                q: "What makes this different from other LLM cost calculators?",
                a: "Most calculators only do token math. AgentQuote models real-world agent behaviors: tool call overhead (2 API calls per tool use), multi-agent context duplication (4.8x measured overhead), memory strategy costs, and failure retry loops. Every formula comes from hands-on experiments, not theory.",
              },
              {
                q: "Which AI models and patterns are supported?",
                a: "We support all major models (Claude, GPT-4, GPT-4o, Llama, Mistral) and 8 architecture patterns: single agent, multi-agent orchestration, pipeline, parallel, RAG, evaluator-optimizer, agentic loop, and human-in-the-loop. We also account for prompt caching, entity memory, and intelligent routing.",
              },
              {
                q: "How accurate are the cost estimates?",
                a: "Our estimates are based on 14 validated formulas from real experiments measuring token economics, tool call overhead, pattern cost spectrums, multi-agent overhead (4.8x), and memory strategies. We provide low/mid/high scenarios so you can plan for different usage levels.",
              },
              {
                q: "Is AgentQuote free to use?",
                a: "Yes, completely free. No signup required. Just describe your system and get your cost breakdown in about 60 seconds. You also get optimization suggestions that can save up to 49% on your agent costs.",
              },
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1.5">
                  {faq.q}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </details>
      </section>

      {/* Email capture — kept client-side for interactivity */}
      <section className="max-w-3xl mx-auto px-6 pt-4 pb-20">
        <div className="border border-[var(--border)] rounded-xl p-7 bg-[var(--bg-card)] text-center">
          <p className="text-sm font-medium text-[var(--text-primary)] mb-4">
            Get notified when new features launch
          </p>
          <EmailCaptureHome />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-8 text-center text-xs text-[var(--text-dim)]">
        AgentQuote — built in public by{" "}
        <a
          href="https://x.com/__mujeeb__"
          className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          @__mujeeb__
        </a>
      </footer>
    </main>
  );
}
