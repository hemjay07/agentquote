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

  // Split on "RECOMMENDATION N:" patterns
  const parts = text.split(/(?=RECOMMENDATION\s+\d+)/i);
  const recs: Recommendation[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Extract title
    const titleMatch = trimmed.match(/RECOMMENDATION\s+\d+[:\s]*\*?\*?(.+?)(?:\*\*)?$/m);
    const title = titleMatch
      ? titleMatch[1].replace(/\*\*/g, "").trim()
      : trimmed.split("\n")[0].replace(/\*\*/g, "").trim();

    // Extract savings amount
    const savingsMatch = trimmed.match(/(?:save|savings?)[:\s]*\$?([\d,]+(?:\.\d+)?)\s*(?:\/mo|per month|monthly)?/i)
      || trimmed.match(/\$([\d,]+(?:\.\d+)?)\s*(?:\/mo|per month|monthly)\s*(?:sav)/i);
    const savings = savingsMatch ? `$${savingsMatch[1]}/mo` : null;

    // Extract difficulty
    const diffMatch = trimmed.match(/(?:implementation\s+)?difficulty[:\s]*(easy|moderate|hard|trivial|complex)/i);
    const difficulty = diffMatch ? diffMatch[1].charAt(0).toUpperCase() + diffMatch[1].slice(1).toLowerCase() : null;

    // Extract quality impact
    const qualityMatch = trimmed.match(/quality\s*impact[:\s]*(none|minor|moderate|significant|major|minimal)/i);
    const quality = qualityMatch ? qualityMatch[1].charAt(0).toUpperCase() + qualityMatch[1].slice(1).toLowerCase() : null;

    // Body is everything after the first line
    const lines = trimmed.split("\n");
    const body = lines.slice(1).join("\n").trim();

    recs.push({ title, savings, difficulty, quality, body });
  }

  return recs;
}

function difficultyColor(d: string): string {
  const lower = d.toLowerCase();
  if (lower === "easy" || lower === "trivial") return "text-green-400 border-green-800/40";
  if (lower === "moderate") return "text-yellow-400 border-yellow-800/40";
  return "text-red-400 border-red-800/40";
}

function qualityColor(q: string): string {
  const lower = q.toLowerCase();
  if (lower === "none" || lower === "minimal") return "text-green-400 border-green-800/40";
  if (lower === "minor") return "text-yellow-400 border-yellow-800/40";
  return "text-red-400 border-red-800/40";
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
      elements.push(<hr key={i} className="border-[var(--border)] my-2" />);
      return;
    }
    if (/^(What to change|Estimated savings|Quality impact|Implementation difficulty|Prerequisites?):?/i.test(trimmed)) {
      elements.push(
        <p key={i} className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mt-2 mb-0.5 font-semibold">
          {trimmed}
        </p>
      );
      return;
    }
    if (/^[\s]*(•|─|├|└|│|-)/.test(line)) {
      elements.push(
        <p key={i} className="text-sm text-[var(--text-secondary)] pl-3 leading-relaxed">
          {renderInline(line)}
        </p>
      );
      return;
    }
    elements.push(
      <p key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">
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
      parts.push(<strong key={match.index} className="text-[var(--text-primary)] font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<code key={match.index} className="text-[var(--accent)] bg-[var(--accent)]/10 px-1 py-0.5 rounded text-xs">{match[3]}</code>);
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

  // Calculate total potential savings
  const totalSavings = recs.reduce((sum, r) => {
    if (!r.savings) return sum;
    const num = parseFloat(r.savings.replace(/[$,/mo]/g, ""));
    return isNaN(num) ? sum : sum + num;
  }, 0);

  return (
    <div className="mb-6">
      {/* Summary banner */}
      {totalSavings > 0 && (
        <div className="bg-green-900/15 border border-green-800/30 rounded-md px-4 py-3 mb-3">
          <p className="text-sm text-green-400">
            Found {recs.length} optimization{recs.length !== 1 ? "s" : ""} that could save up to <strong>${totalSavings.toLocaleString()}/month</strong>
          </p>
        </div>
      )}

      {/* Recommendation cards */}
      <div className="space-y-2">
        {recs.map((rec, i) => (
          <div
            key={i}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full px-4 py-3 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {rec.title}
                </p>
                <span className="text-xs text-[var(--text-secondary)] shrink-0 mt-0.5">
                  {expanded === i ? "−" : "+"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {rec.savings && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-green-800/40 text-green-400">
                    {rec.savings} savings
                  </span>
                )}
                {rec.difficulty && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${difficultyColor(rec.difficulty)}`}>
                    {rec.difficulty}
                  </span>
                )}
                {rec.quality && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${qualityColor(rec.quality)}`}>
                    Quality: {rec.quality}
                  </span>
                )}
              </div>
            </button>
            {expanded === i && rec.body && (
              <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
                {renderBody(rec.body)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
