"use client";

import type {
  ParsedSystem,
  CostEstimate,
  OptimizationFlags,
} from "@/lib/knowledge-base";

interface ResultsDashboardProps {
  parsed: ParsedSystem;
  costs: CostEstimate;
  recommendations: string;
  optimizations: OptimizationFlags;
  onRecalculate: (parsed: ParsedSystem, opts: OptimizationFlags) => void;
  onBack: () => void;
}

function formatMoney(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

export default function ResultsDashboard({
  parsed,
  costs,
  recommendations,
  onBack,
}: ResultsDashboardProps) {
  const scenarios = [
    { key: "low" as const, label: "Low", color: "text-green-400" },
    { key: "mid" as const, label: "Mid", color: "text-yellow-400" },
    { key: "high" as const, label: "High", color: "text-red-400" },
  ];

  // Parse recommendation sections
  const sections = parseRecommendationSections(recommendations);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {parsed.system_name}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {parsed.agents.length} agent{parsed.agents.length > 1 ? "s" : ""} ·{" "}
            {parsed.pattern.replace(/_/g, " ")} ·{" "}
            {parsed.daily_conversations.toLocaleString()} convos/day ·{" "}
            {parsed.avg_turns_per_conversation} turns
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded px-3 py-1.5"
        >
          ← Edit Assumptions
        </button>
      </div>

      {/* Cost table */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <h2 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
            Monthly Cost Estimate
          </h2>
        </div>
        <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
          {scenarios.map(({ key, label, color }) => {
            const c = costs[key];
            return (
              <div key={key} className="p-4 text-center">
                <p className={`text-xs uppercase tracking-wide mb-2 ${color}`}>
                  {label}
                </p>
                <p className={`text-2xl font-bold ${color}`}>
                  {formatMoney(c.monthly_cost)}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">/month</p>
                <div className="mt-3 space-y-1 text-xs text-[var(--text-secondary)]">
                  <p>{formatMoney(c.cost_per_conversation)} per convo</p>
                  <p>{formatMoney(c.daily_cost)} per day</p>
                  <p>{c.total_calls_per_convo} API calls/convo</p>
                  <p>{c.input_tokens_per_convo.toLocaleString()} input tokens</p>
                </div>
                {c.caching_applicable && c.caching_savings_monthly > 0 && (
                  <div className="mt-3 bg-green-900/20 border border-green-800/30 rounded px-2 py-1">
                    <p className="text-xs text-green-400">
                      💰 Cache saves {formatMoney(c.caching_savings_monthly)}/mo
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat
          label="Model"
          value={costs.mid.primary_model.replace("claude-", "").replace("-4-5", "")}
        />
        <Stat
          label="Annual (mid)"
          value={formatMoney(costs.mid.monthly_cost * 12)}
        />
        <Stat
          label="Variance"
          value={`${Math.round((costs.high.monthly_cost / costs.low.monthly_cost) * 100)}%`}
          warning={costs.high.monthly_cost / costs.low.monthly_cost > 5}
        />
        <Stat
          label="Failure overhead"
          value={`${costs.mid.failure_token_overhead.toLocaleString()} tokens`}
          warning={costs.mid.failure_token_overhead > 10000}
        />
      </div>

      {/* Architecture diagram (text-based from recommendations) */}
      {sections.diagram && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md mb-6">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              Architecture Diagram
            </h2>
          </div>
          <pre className="p-4 text-xs text-[var(--text-secondary)] overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {sections.diagram}
          </pre>
        </div>
      )}

      {/* Optimization recommendations */}
      {sections.optimizations && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md mb-6">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              Optimization Recommendations
            </h2>
          </div>
          <div className="p-4 text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
            {sections.optimizations}
          </div>
        </div>
      )}

      {/* Warnings */}
      {sections.warnings && (
        <div className="bg-red-900/10 border border-red-800/30 rounded-md mb-6">
          <div className="px-4 py-3 border-b border-red-800/30">
            <h2 className="text-xs text-red-400 uppercase tracking-wide">
              ⚠ Warnings
            </h2>
          </div>
          <div className="p-4 text-sm text-red-300/80 whitespace-pre-wrap leading-relaxed">
            {sections.warnings}
          </div>
        </div>
      )}

      {/* Cost summary from recommendations */}
      {sections.costSummary && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md mb-6">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              Detailed Analysis
            </h2>
          </div>
          <div className="p-4 text-sm text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed">
            {sections.costSummary}
          </div>
        </div>
      )}

      {/* Share section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4 mb-6">
        <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Share
        </h3>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Just estimated my AI agent system costs with @AgentQuote:\n\n📊 ${parsed.system_name}\n💰 ${formatMoney(costs.low.monthly_cost)} - ${formatMoney(costs.high.monthly_cost)}/month\n🤖 ${parsed.agents.length} agents, ${parsed.daily_conversations} convos/day\n\nTry it free:`
          )}`}
          target="_blank"
          className="inline-block text-sm text-[var(--accent)] hover:underline"
        >
          Share on Twitter →
        </a>
      </div>
    </div>
  );
}

// ── Helper components ──

function Stat({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-3">
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p
        className={`text-sm font-semibold mt-1 ${
          warning ? "text-[var(--warning)]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// ── Parse recommendation text into sections ──

function parseRecommendationSections(text: string) {
  const sections: {
    diagram: string;
    costSummary: string;
    optimizations: string;
    warnings: string;
  } = { diagram: "", costSummary: "", optimizations: "", warnings: "" };

  if (!text) return sections;

  // Split by === SECTION NAME ===
  const diagramMatch = text.match(
    /=== ARCHITECTURE DIAGRAM ===([\s\S]*?)(?====[^=]|$)/
  );
  const costMatch = text.match(
    /=== COST SUMMARY ===([\s\S]*?)(?====[^=]|$)/
  );
  const optMatch = text.match(
    /=== OPTIMIZATION RECOMMENDATIONS ===([\s\S]*?)(?====[^=]|$)/
  );
  const warnMatch = text.match(
    /=== WARNINGS ===([\s\S]*?)(?====[^=]|$)/
  );

  if (diagramMatch) sections.diagram = diagramMatch[1].trim();
  if (costMatch) sections.costSummary = costMatch[1].trim();
  if (optMatch) sections.optimizations = optMatch[1].trim();
  if (warnMatch) sections.warnings = warnMatch[1].trim();

  return sections;
}
