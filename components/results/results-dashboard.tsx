"use client";

import { useState, useRef } from "react";
import type {
  ParsedSystem,
  CostEstimate,
  OptimizationFlags,
} from "@/lib/knowledge-base";
import { MODEL_PRICING } from "@/lib/knowledge-base";
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

// ── Calculate cost driver from actual data (deterministic, no text parsing) ──

function calculateCostDriver(
  parsed: ParsedSystem
): { name: string; pct: number; reason: string } | null {
  if (parsed.agents.length === 0) return null;

  // Score each agent by model cost × tool overhead
  const scores: { name: string; score: number }[] = [];
  let total = 0;

  for (const agent of parsed.agents) {
    const pricing = MODEL_PRICING[agent.model];
    const modelCost = pricing ? pricing.input + pricing.output : 10;
    const toolOverhead = agent.has_tools ? agent.tool_count * 2 : 0;
    const score = modelCost + toolOverhead;
    scores.push({ name: agent.name || "Agent", score });
    total += score;
  }

  if (total === 0) return null;

  // Find the most expensive agent
  scores.sort((a, b) => b.score - a.score);
  const top = scores[0];
  const pct = Math.round((top.score / total) * 100);

  return {
    name: top.name,
    pct,
    reason: "of total monthly cost",
  };
}

// ── Parse warnings into individual items ──

function parseWarnings(
  text: string
): { title: string; summary: string; details: string }[] {
  if (!text) return [];

  // Strip leading/trailing whitespace
  const cleaned = text.trim();

  // Try multiple split strategies
  let parts: string[] = [];

  // Strategy 1: Split on numbered items (1. ..., 2. ...) — most reliable
  if (/^\d+\.\s+/m.test(cleaned)) {
    parts = cleaned.split(/(?=^|\n)\s*(?=\d+\.\s+)/m).filter((p) => p.trim());
    // Remove preamble before first numbered item
    if (parts.length > 0 && !/^\s*\d+\.\s+/.test(parts[0])) {
      parts.shift();
    }
  }

  // Strategy 2: Split on emoji-prefixed lines (🚨, ⚠️, etc.)
  if (parts.length <= 1) {
    const emojiSplit = cleaned.split(/\n(?=[🚨⚠🔴❗❌🔥])/);
    if (emojiSplit.filter((p) => p.trim()).length > 1) {
      parts = emojiSplit.filter((p) => p.trim());
    }
  }

  // Strategy 3: Split on bold headers (**HEADER**)
  if (parts.length <= 1) {
    const boldSplit = cleaned.split(/\n(?=\*\*[^*]+\*\*)/);
    if (boldSplit.filter((p) => p.trim()).length > 1) {
      parts = boldSplit.filter((p) => p.trim());
    }
  }

  // Strategy 4: Split on ALL-CAPS lines that look like headers
  if (parts.length <= 1) {
    const capsSplit = cleaned.split(/\n(?=[A-Z][A-Z\s:]{5,})/);
    if (capsSplit.filter((p) => p.trim()).length > 1) {
      parts = capsSplit.filter((p) => p.trim());
    }
  }

  // Fallback: whole text as one warning
  if (parts.length === 0) {
    parts = [cleaned];
  }

  return parts
    .filter((p) => p.trim())
    .map((part) => {
      const lines = part.trim().split("\n");

      // Clean up the title line: strip number prefix, bold markers, emojis
      const title = lines[0]
        .replace(/^\d+\.\s*/, "")
        .replace(/\*\*/g, "")
        .replace(/[🚨⚠️🔴❗❌🔥]\s*/g, "")
        .trim();

      // Find the first substantive line after title for summary
      const rest = lines.slice(1);
      const summaryLine = rest.find(
        (l) =>
          l.trim() &&
          !/^-{3,}$/.test(l.trim()) &&
          !/^_{3,}$/.test(l.trim())
      );
      const summary = summaryLine
        ? summaryLine
            .replace(/^[-•]\s*/, "")
            .replace(/\*\*/g, "")
            .trim()
            .slice(0, 150)
        : "";

      const details = rest.join("\n").trim();
      return { title, summary, details };
    });
}

// ── Render markdown table ──

function renderMarkdownTable(
  tableLines: string[],
  blockKey: number
): React.ReactNode {
  const rows = tableLines
    .filter(
      (line) => line.trim().startsWith("|") && line.trim().endsWith("|")
    )
    .map((line) =>
      line
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim())
    );

  // Filter out separator rows (all dashes/colons)
  const dataRows = rows.filter(
    (row) => !row.every((cell) => /^[-:]+$/.test(cell))
  );

  if (dataRows.length < 2) return null;

  const header = dataRows[0];
  const body = dataRows.slice(1);

  return (
    <div key={`table-${blockKey}`} className="overflow-x-auto my-3">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #27272a" }}>
            {header.map((cell, i) => (
              <th
                key={i}
                className="py-2 px-3 text-left text-xs uppercase tracking-wide"
                style={{ color: "#71717a", fontWeight: 500 }}
              >
                {cell.replace(/\*\*/g, "")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #1a1a1e" }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="py-2 px-3"
                  style={{
                    color: "#a1a1aa",
                    fontFamily:
                      j > 0
                        ? "var(--font-mono, monospace)"
                        : "inherit",
                    fontSize: "13px",
                  }}
                >
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Render markdown-ish text with table support ──

function renderFormattedText(text: string) {
  // Strip emojis that Claude sometimes adds
  const cleaned = text.replace(/[💰📊📈📉🚨⚠️🔴❗❌🔥✅🟢🟡]/g, "");

  const lines = cleaned.split("\n");

  // Split into blocks: table blocks vs text blocks
  const blocks: { type: "text" | "table"; lines: string[] }[] = [];
  let currentBlock: { type: "text" | "table"; lines: string[] } = {
    type: "text",
    lines: [],
  };

  for (const line of lines) {
    const isTableLine =
      line.trim().startsWith("|") && line.trim().endsWith("|");

    if (isTableLine && currentBlock.type !== "table") {
      if (currentBlock.lines.length > 0) blocks.push(currentBlock);
      currentBlock = { type: "table", lines: [line] };
    } else if (!isTableLine && currentBlock.type === "table") {
      blocks.push(currentBlock);
      currentBlock = { type: "text", lines: [line] };
    } else {
      currentBlock.lines.push(line);
    }
  }
  if (currentBlock.lines.length > 0) blocks.push(currentBlock);

  const elements: React.ReactNode[] = [];
  blocks.forEach((block, blockIdx) => {
    if (block.type === "table") {
      const tableEl = renderMarkdownTable(block.lines, blockIdx);
      if (tableEl) elements.push(tableEl);
    } else {
      block.lines.forEach((line, i) => {
        const key = `${blockIdx}-${i}`;
        const trimmed = line.trim();
        if (!trimmed) {
          elements.push(<div key={key} className="h-2" />);
          return;
        }
        if (/^-{3,}$|^_{3,}$|^[=]{3,}$/.test(trimmed)) {
          elements.push(
            <hr key={key} className="border-[#27272a] my-3" />
          );
          return;
        }
        // Bold headers on their own line
        if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
          elements.push(
            <p
              key={key}
              className="text-sm font-semibold text-[#e4e4e7] mt-3 mb-1"
            >
              {trimmed.replace(/\*\*/g, "")}
            </p>
          );
          return;
        }
        // ALL-CAPS headers (like "BIGGEST COST DRIVER:")
        if (/^[A-Z][A-Z\s:]{5,}/.test(trimmed) && !trimmed.includes("$")) {
          elements.push(
            <p
              key={key}
              className="text-xs uppercase tracking-wide text-[#a1a1aa] mt-3 mb-1 font-semibold"
            >
              {trimmed}
            </p>
          );
          return;
        }
        if (/^[\s]*(•|─|├|└|│|-)/.test(line)) {
          elements.push(
            <p
              key={key}
              className="text-sm text-[#a1a1aa] pl-4 leading-relaxed"
            >
              {renderInline(line)}
            </p>
          );
          return;
        }
        elements.push(
          <p key={key} className="text-sm text-[#a1a1aa] leading-relaxed">
            {renderInline(line)}
          </p>
        );
      });
    }
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
  const [warningsOpen, setWarningsOpen] = useState(false);
  const [expandedWarning, setExpandedWarning] = useState<number | null>(null);
  const csvRef = useRef<HTMLDivElement>(null);

  const sections = parseRecommendationSections(recommendations);
  const costDriver = calculateCostDriver(parsed);
  const warningItems = parseWarnings(sections.warnings);

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

      {/* ── Section 3: Cost driver (compact row) ── */}
      <div className="bg-[#111113] border border-[#27272a] rounded-[12px] px-5 py-4 mb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <p
            className="shrink-0"
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#71717a",
            }}
          >
            Biggest cost driver
          </p>
          {costDriver ? (
            <div className="flex items-baseline gap-2 min-w-0">
              <span
                className="text-xl font-bold text-white shrink-0"
                style={{ fontFamily: "var(--font-mono, monospace)" }}
              >
                {costDriver.pct}%
              </span>
              <span className="text-sm text-[#a1a1aa]">
                · {costDriver.name}
              </span>
            </div>
          ) : (
            <span className="text-sm text-[#a1a1aa]">
              {costs.mid.primary_model
                .replace("claude-", "")
                .replace(/-4-5$/, "")
                .replace(/-/g, " ")}{" "}
              · {formatMoney(costs.mid.monthly_cost)}/mo ·{" "}
              {costs.mid.total_calls_per_convo} API calls/convo
            </span>
          )}
        </div>
      </div>

      {/* ── Section 3b: Architecture diagram (full width) ── */}
      <FlowDiagram parsed={parsed} />

      {/* ── Section 4: Recommendations ── */}
      {sections.optimizations && (
        <div className="mb-6">
          <RecommendationCards text={sections.optimizations} />
        </div>
      )}

      {/* ── Warnings (collapsible with individual accordions) ── */}
      {warningItems.length > 0 && (
        <div className="bg-[#111113] border border-[#27272a] rounded-[12px] mb-6">
          <button
            onClick={() => setWarningsOpen(!warningsOpen)}
            className="w-full px-5 py-4 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">⚠</span>
              <span className="text-sm text-amber-400">
                {warningItems.length} warning
                {warningItems.length !== 1 ? "s" : ""} found
              </span>
            </div>
            <span className="text-[#a1a1aa] text-xs">
              {warningsOpen ? "\u2212" : "+"}
            </span>
          </button>
          {warningsOpen && (
            <div className="px-5 pb-4 space-y-2">
              {warningItems.map((w, i) => (
                <div
                  key={i}
                  className="border border-[#27272a] rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedWarning(expandedWarning === i ? null : i)
                    }
                    className="w-full px-4 py-3 text-left hover:bg-[#27272a]/20 transition-colors"
                  >
                    <p className="text-sm font-medium text-[#e4e4e7]">
                      {w.title}
                    </p>
                    {w.summary && (
                      <p className="text-xs text-[#a1a1aa] mt-1">
                        {w.summary}
                      </p>
                    )}
                  </button>
                  {expandedWarning === i && w.details && (
                    <div className="px-4 pb-3 border-t border-[#27272a] pt-2">
                      {renderFormattedText(w.details)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
