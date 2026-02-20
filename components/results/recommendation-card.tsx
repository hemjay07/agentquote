"use client";

import { useState } from "react";

interface Recommendation {
  title: string;
  savings: string | null;
  difficulty: string | null;
  quality: string | null;
  body: string;
}

function parseRecommendations(text: string): Recommendation[] {
  if (!text) return [];

  const parts = text.split(/(?=RECOMMENDATION\s+\d+)/i);
  const recs: Recommendation[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const titleMatch = trimmed.match(
      /RECOMMENDATION\s+\d+[:\s]*\*?\*?(.+?)(?:\*\*)?$/m
    );
    const title = titleMatch
      ? titleMatch[1].replace(/\*\*/g, "").trim()
      : trimmed.split("\n")[0].replace(/\*\*/g, "").trim();

    const savingsMatch =
      trimmed.match(
        /(?:save|savings?)[:\s]*\$?([\d,]+(?:\.\d+)?)\s*(?:\/mo|per month|monthly)?/i
      ) ||
      trimmed.match(
        /\$([\d,]+(?:\.\d+)?)\s*(?:\/mo|per month|monthly)\s*(?:sav)/i
      );
    const savings = savingsMatch ? `$${savingsMatch[1]}/mo` : null;

    const diffMatch = trimmed.match(
      /(?:implementation\s+)?difficulty[:\s]*(easy|moderate|hard|trivial|complex)/i
    );
    const difficulty = diffMatch
      ? diffMatch[1].charAt(0).toUpperCase() +
        diffMatch[1].slice(1).toLowerCase()
      : null;

    const qualityMatch = trimmed.match(
      /quality\s*impact[:\s]*(none|minor|moderate|significant|major|minimal)/i
    );
    const quality = qualityMatch
      ? qualityMatch[1].charAt(0).toUpperCase() +
        qualityMatch[1].slice(1).toLowerCase()
      : null;

    const lines = trimmed.split("\n");
    const body = lines.slice(1).join("\n").trim();

    recs.push({ title, savings, difficulty, quality, body });
  }

  return recs;
}

function difficultyColor(d: string): {
  text: string;
  bg: string;
  border: string;
} {
  const lower = d.toLowerCase();
  if (lower === "easy" || lower === "trivial")
    return {
      text: "text-[#22c55e]",
      bg: "bg-[#22c55e]/10",
      border: "border-[#22c55e]/20",
    };
  if (lower === "moderate")
    return {
      text: "text-[#f59e0b]",
      bg: "bg-[#f59e0b]/10",
      border: "border-[#f59e0b]/20",
    };
  return {
    text: "text-[#ef4444]",
    bg: "bg-[#ef4444]/10",
    border: "border-[#ef4444]/20",
  };
}

function qualityColor(q: string): {
  text: string;
  bg: string;
  border: string;
} {
  const lower = q.toLowerCase();
  if (lower === "none" || lower === "minimal")
    return {
      text: "text-[#22c55e]",
      bg: "bg-[#22c55e]/10",
      border: "border-[#22c55e]/20",
    };
  if (lower === "minor")
    return {
      text: "text-[#f59e0b]",
      bg: "bg-[#f59e0b]/10",
      border: "border-[#f59e0b]/20",
    };
  return {
    text: "text-[#ef4444]",
    bg: "bg-[#ef4444]/10",
    border: "border-[#ef4444]/20",
  };
}

function renderBody(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={i} className="h-1.5" />);
      return;
    }
    if (/^-{3,}$|^_{3,}$/.test(trimmed)) {
      elements.push(<hr key={i} className="border-[#27272a] my-2" />);
      return;
    }
    if (
      /^(What to change|Estimated savings|Quality impact|Implementation difficulty|Prerequisites?):?/i.test(
        trimmed
      )
    ) {
      elements.push(
        <p
          key={i}
          className="text-xs uppercase tracking-wide text-[#a1a1aa] mt-2 mb-0.5 font-semibold"
        >
          {trimmed}
        </p>
      );
      return;
    }
    if (/^[\s]*(•|─|├|└|│|-)/.test(line)) {
      elements.push(
        <p key={i} className="text-sm text-[#a1a1aa] pl-3 leading-relaxed">
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

export default function RecommendationCards({ text }: { text: string }) {
  const recs = parseRecommendations(text);
  const [expanded, setExpanded] = useState<number | null>(null);

  if (recs.length === 0) return null;

  const totalSavings = recs.reduce((sum, r) => {
    if (!r.savings) return sum;
    const num = parseFloat(r.savings.replace(/[$,/mo]/g, ""));
    return isNaN(num) ? sum : sum + num;
  }, 0);

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <p
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#71717a",
          }}
        >
          Optimizations
        </p>
        {totalSavings > 0 && (
          <p
            className="text-sm text-[#22c55e] font-medium"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            Save up to ${totalSavings.toLocaleString()}/mo
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {recs.map((rec, i) => (
          <div
            key={i}
            className="bg-[#111113] border border-[#27272a] rounded-[12px] overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full px-4 py-3 text-left hover:bg-[#27272a]/20 transition-colors"
            >
              {/* Pills row ABOVE title */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {rec.savings && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e]">
                    {rec.savings}
                  </span>
                )}
                {rec.difficulty && (() => {
                  const c = difficultyColor(rec.difficulty);
                  return (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${c.bg} border ${c.border} ${c.text}`}
                    >
                      {rec.difficulty}
                    </span>
                  );
                })()}
                {rec.quality &&
                  rec.quality.toLowerCase() !== "none" && (() => {
                    const c = qualityColor(rec.quality);
                    return (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full ${c.bg} border ${c.border} ${c.text}`}
                      >
                        Quality: {rec.quality}
                      </span>
                    );
                  })()}
                <span className="ml-auto text-xs text-[#52525b] shrink-0">
                  {expanded === i ? "\u2212" : "+"}
                </span>
              </div>
              {/* Title below pills */}
              <p className="text-sm font-medium text-[#e4e4e7]">{rec.title}</p>
            </button>
            {expanded === i && rec.body && (
              <div className="px-4 pb-4 border-t border-[#27272a] pt-3">
                {renderBody(rec.body)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
