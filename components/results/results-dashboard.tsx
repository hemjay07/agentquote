"use client";

import { useState, useRef } from "react";
import type {
  ParsedSystem,
  CostEstimate,
  OptimizationFlags,
} from "@/lib/knowledge-base";
import FlowDiagram from "./flow-diagram";
import RecommendationCards from "./recommendation-card";
import CSVUpload from "./csv-upload";
import EmailCapture from "../shared/email-capture";
import FeedbackBox from "../shared/feedback-box";

interface ResultsDashboardProps {
  parsed: ParsedSystem;
  costs: CostEstimate;
  recommendations: string;
  optimizations: OptimizationFlags;
  onRecalculate: (parsed: ParsedSystem, opts: OptimizationFlags) => void;
  onBack: () => void;
}

function formatMoney(n: number): string {
  if (n >= 1000)
    return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

// ── Parse recommendation text into sections ──

function parseRecommendationSections(text: string) {
  const sections: {
    costSummary: string;
    optimizations: string;
    warnings: string;
  } = { costSummary: "", optimizations: "", warnings: "" };

  if (!text) return sections;

  const costMatch = text.match(
    /=== COST SUMMARY ===([\s\S]*?)(?====[^=]|$)/
  );
  const optMatch = text.match(
    /=== OPTIMIZATION RECOMMENDATIONS ===([\s\S]*?)(?====[^=]|$)/
  );
  const warnMatch = text.match(/=== WARNINGS ===([\s\S]*?)(?====[^=]|$)/);

  if (costMatch) sections.costSummary = costMatch[1].trim();
  if (optMatch) sections.optimizations = optMatch[1].trim();
  if (warnMatch) sections.warnings = warnMatch[1].trim();

  return sections;
}

// ── Try to extract cost driver info ──

function parseCostDriver(
  costSummary: string,
  parsed: ParsedSystem
): { name: string; pct: number; reason: string } | null {
  if (!costSummary) return null;

  // Try "X accounts for 65% of total cost" or "biggest cost driver is X (65%)"
  const driverMatch =
    costSummary.match(
      /(?:biggest|largest|primary|main)\s*(?:cost\s*)?driver[:\s]*(?:is\s*)?(?:the\s*)?([^,.(]+)/i
    ) ||
    costSummary.match(
      /([^,.(]+?)(?:\s*(?:is|accounts?\s*for|represents?)\s*(?:the\s*)?(?:biggest|largest|primary))/i
    );

  // Find a percentage near the driver mention
  if (driverMatch) {
    const nearby = costSummary.slice(
      Math.max(0, driverMatch.index! - 30),
      driverMatch.index! + driverMatch[0].length + 60
    );
    const pctMatch = nearby.match(/(\d+)%/);
    if (pctMatch) {
      return {
        name: driverMatch[1].trim().replace(/\*\*/g, ""),
        pct: parseInt(pctMatch[1]),
        reason: "of total monthly cost",
      };
    }
  }

  // Fall back: find any agent name + percentage
  for (const agent of parsed.agents) {
    if (!agent.name) continue;
    const escaped = agent.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`${escaped}[^\\d]*(\\d+)%`, "i");
    const match = costSummary.match(pattern);
    if (match) {
      return {
        name: agent.name,
        pct: parseInt(match[1]),
        reason: "of total monthly cost",
      };
    }
  }

  return null;
}

// ── Render markdown-ish text ──

function renderFormattedText(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }
    if (/^-{3,}$|^_{3,}$/.test(trimmed)) {
      elements.push(<hr key={i} className="border-[#27272a] my-3" />);
      return;
    }
    if (/^[\s]*(•|─|├|└|│|-)/.test(line)) {
      elements.push(
        <p key={i} className="text-sm text-[#a1a1aa] pl-4 leading-relaxed">
          {renderInline(line)}
        </p>
      );
      return;
    }
    elements.push(
      <p key={i} className="text-sm text-[#a1a1aa] leading-relaxed">
        {renderInline(line)}
      </p>
    );
  });

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    if (match[2]) {
      parts.push(
        <strong key={match.index} className="text-[#e4e4e7] font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <code
          key={match.index}
          className="text-[#22c55e] bg-[#22c55e]/10 px-1 py-0.5 rounded text-xs"
        >
          {match[3]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

// ── Main component ──

export default function ResultsDashboard({
  parsed,
  costs,
  recommendations,
  onBack,
}: ResultsDashboardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showCSV, setShowCSV] = useState(false);
  const csvRef = useRef<HTMLDivElement>(null);

  const sections = parseRecommendationSections(recommendations);
  const costDriver = parseCostDriver(sections.costSummary, parsed);

  const low = costs.low.monthly_cost;
  const mid = costs.mid.monthly_cost;
  const high = costs.high.monthly_cost;
  const midPosition = high > low ? ((mid - low) / (high - low)) * 100 : 50;
  const cachingSavings = costs.mid.caching_savings_monthly;

  const tweetText = `Just estimated my AI agent system costs with AgentQuote:\n\n${parsed.system_name}\n${formatMoney(low)} - ${formatMoney(high)}/month\n${parsed.agents.length} agents, ${parsed.daily_conversations} convos/day\n\nTry it free:`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

  function handleCompare() {
    setShowCSV(true);
    setTimeout(() => {
      csvRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <div>
      {/* ── Section 1: Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#71717a",
            }}
          >
            Cost Estimate
          </p>
          <h1 className="text-2xl font-bold text-[#e4e4e7] mt-1">
            {parsed.system_name}
          </h1>
          <p className="text-[13px] text-[#71717a] mt-1">
            {parsed.agents.length} agent
            {parsed.agents.length > 1 ? "s" : ""} ·{" "}
            {parsed.pattern.replace(/_/g, " ")} ·{" "}
            {parsed.daily_conversations.toLocaleString()} convos/day ·{" "}
            {parsed.avg_turns_per_conversation} turns
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-[#a1a1aa] hover:text-[#e4e4e7] border border-[#27272a] hover:border-[#3f3f46] rounded-lg px-3 py-1.5 transition-colors"
        >
          ← Edit Assumptions
        </button>
      </div>

      {/* ── Section 2: Hero Cost Card ── */}
      <div className="bg-[#111113] border border-[#27272a] rounded-[16px] p-6 mb-6">
        <div className="text-center">
          <p
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#71717a",
            }}
          >
            Estimated monthly cost
          </p>
          <p
            className="text-[48px] font-bold text-white mt-2 tracking-tight"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            {formatMoney(mid)}
          </p>
          <p className="text-[13px] text-[#71717a] mt-1">
            {formatMoney(costs.mid.cost_per_conversation)} per conversation ·{" "}
            {formatMoney(costs.mid.daily_cost)} per day
          </p>
        </div>

        {/* Range bar */}
        <div className="mt-6 px-2">
          <div className="relative">
            <div
              className="h-[6px] rounded-full"
              style={{
                background:
                  "linear-gradient(to right, #166534, #713f12, #7f1d1d)",
              }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#22c55e]"
              style={{ left: `${midPosition}%`, marginLeft: -6 }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <div>
              <p className="text-[11px] text-[#52525b]">Best case</p>
              <p
                className="text-lg text-[#a1a1aa] font-medium"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                {formatMoney(low)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#52525b]">Worst case</p>
              <p
                className="text-lg text-[#a1a1aa] font-medium"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                {formatMoney(high)}
              </p>
            </div>
          </div>
        </div>

        {cachingSavings > 0 && (
          <p className="text-center text-[12px] text-[#52525b] mt-4">
            With prompt caching, save up to {formatMoney(cachingSavings)}/mo
          </p>
        )}
      </div>

      {/* ── Section 3: Two-column grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Left: Cost driver */}
        <div className="bg-[#111113] border border-[#27272a] rounded-[12px] p-5">
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#71717a",
              marginBottom: 12,
            }}
          >
            Biggest cost driver
          </p>
          {costDriver ? (
            <>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[28px] font-bold text-white"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  {costDriver.pct}%
                </span>
                <span className="text-sm text-[#a1a1aa]">
                  {costDriver.reason}
                </span>
              </div>
              <p className="text-sm text-[#a1a1aa] mt-2">{costDriver.name}</p>
            </>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[28px] font-bold text-white"
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                >
                  {costs.mid.primary_model
                    .replace("claude-", "")
                    .replace(/-4-5$/, "")
                    .replace(/-/g, " ")}
                </span>
              </div>
              <p className="text-sm text-[#a1a1aa] mt-2">
                {formatMoney(costs.mid.monthly_cost)}/mo ·{" "}
                {costs.mid.total_calls_per_convo} API calls/convo ·{" "}
                {costs.mid.input_tokens_per_convo.toLocaleString()} input
                tokens/convo
              </p>
            </>
          )}
        </div>

        {/* Right: Architecture */}
        <FlowDiagram parsed={parsed} />
      </div>

      {/* ── Section 4: Recommendations ── */}
      {sections.optimizations && (
        <div className="mb-6">
          <RecommendationCards text={sections.optimizations} />
        </div>
      )}

      {/* ── Warnings ── */}
      {sections.warnings && (
        <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-[12px] mb-6">
          <div className="px-4 py-3 border-b border-[#ef4444]/20 flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-[#ef4444]"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#ef4444",
              }}
            >
              Warnings
            </p>
          </div>
          <div className="p-4">{renderFormattedText(sections.warnings)}</div>
        </div>
      )}

      {/* ── Section 5: Detailed breakdown (collapsed) ── */}
      <div className="mb-6">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
        >
          <span className="text-xs w-4 text-center">
            {showBreakdown ? "\u2212" : "+"}
          </span>
          Detailed cost breakdown per agent
        </button>
        {showBreakdown && sections.costSummary && (
          <div className="mt-3 bg-[#111113] border border-[#27272a] rounded-[12px] p-4">
            {renderFormattedText(sections.costSummary)}
          </div>
        )}
      </div>

      {/* ── Section 6: Actions row ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#111113] border border-[#27272a] hover:border-[#3f3f46] rounded-[12px] px-4 py-3 text-center text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
        >
          Share on Twitter
        </a>
        <button
          onClick={handleCompare}
          className="bg-[#111113] border border-[#27272a] hover:border-[#3f3f46] rounded-[12px] px-4 py-3 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
        >
          Compare with real data
        </button>
        <button
          onClick={onBack}
          className="bg-[#111113] border border-[#27272a] hover:border-[#3f3f46] rounded-[12px] px-4 py-3 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors"
        >
          Edit assumptions
        </button>
      </div>

      {/* CSV Upload (toggleable) */}
      <div ref={csvRef}>{showCSV && <CSVUpload estimate={costs} />}</div>

      {/* ── Section 7: Footer — email + feedback ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <EmailCapture estimate={costs} />
        <FeedbackBox />
      </div>
    </div>
  );
}
