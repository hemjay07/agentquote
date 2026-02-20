"use client";

import type {
  ParsedSystem,
  CostEstimate,
  OptimizationFlags,
} from "@/lib/knowledge-base";
import FlowDiagram from "./flow-diagram";
import RecommendationCards from "./recommendation-card";

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

// ── Render markdown-ish text into React elements ──

function renderFormattedText(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const key = i;
    if (line.trim() === "") {
      elements.push(<div key={key} className="h-2" />);
      return;
    }
    if (/^-{3,}$|^_{3,}$/.test(line.trim())) {
      elements.push(<hr key={key} className="border-[var(--border)] my-3" />);
      return;
    }
    if (line.includes("RECOMMENDATION") && line.includes("**")) {
      elements.push(
        <h3 key={key} className="text-sm font-bold text-[var(--text-primary)] mt-4 mb-1">
          {line.replace(/\*\*/g, "")}
        </h3>
      );
      return;
    }
    if (/^(What to change|Estimated savings|Quality impact|Implementation difficulty|WORST CASE|COST DRIVER|TOKEN ACCUMULATION):?/i.test(line.trim())) {
      elements.push(
        <p key={key} className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mt-3 mb-1 font-semibold">
          {line.trim()}
        </p>
      );
      return;
    }
    if (/^[\s]*(•|─|├|└|│|-)/.test(line)) {
      elements.push(
        <p key={key} className="text-sm text-[var(--text-secondary)] pl-4 leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
      return;
    }
    elements.push(
      <p key={key} className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
  });

  return <>{elements}</>;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) {
      parts.push(<strong key={match.index} className="text-[var(--text-primary)] font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<code key={match.index} className="text-[var(--accent)] bg-[var(--accent)]/10 px-1 py-0.5 rounded text-xs">{match[3]}</code>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
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
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden mb-6">
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
                      Cache saves {formatMoney(c.caching_savings_monthly)}/mo
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

      {/* Architecture diagram (CSS-based) */}
      <FlowDiagram parsed={parsed} />

      {/* Optimization recommendations (card-based) */}
      {sections.optimizations && (
        <div className="mb-6">
          <h2 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-3">
            Optimization Recommendations
          </h2>
          <RecommendationCards text={sections.optimizations} />
        </div>
      )}

      {/* Warnings */}
      {sections.warnings && (
        <div className="bg-red-900/10 border border-red-800/30 rounded-xl mb-6">
          <div className="px-4 py-3 border-b border-red-800/30 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <h2 className="text-xs text-red-400 uppercase tracking-wide">
              Warnings
            </h2>
          </div>
          <div className="p-4">
            {renderFormattedText(sections.warnings)}
          </div>
        </div>
      )}

      {/* Detailed analysis */}
      {sections.costSummary && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl mb-6">
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <h2 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              Detailed Analysis
            </h2>
          </div>
          <div className="p-4">
            {renderFormattedText(sections.costSummary)}
          </div>
        </div>
      )}

      {/* Share section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 mb-6">
        <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-3">
          Share
        </h3>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Just estimated my AI agent system costs with @AgentQuote:\n\n${parsed.system_name}\n${formatMoney(costs.low.monthly_cost)} - ${formatMoney(costs.high.monthly_cost)}/month\n${parsed.agents.length} agents, ${parsed.daily_conversations} convos/day\n\nTry it free:`
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
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-3">
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

  const diagramMatch = text.match(/=== ARCHITECTURE DIAGRAM ===([\s\S]*?)(?====[^=]|$)/);
  const costMatch = text.match(/=== COST SUMMARY ===([\s\S]*?)(?====[^=]|$)/);
  const optMatch = text.match(/=== OPTIMIZATION RECOMMENDATIONS ===([\s\S]*?)(?====[^=]|$)/);
  const warnMatch = text.match(/=== WARNINGS ===([\s\S]*?)(?====[^=]|$)/);

  if (diagramMatch) sections.diagram = diagramMatch[1].trim();
  if (costMatch) sections.costSummary = costMatch[1].trim();
  if (optMatch) sections.optimizations = optMatch[1].trim();
  if (warnMatch) sections.warnings = warnMatch[1].trim();

  return sections;
}
