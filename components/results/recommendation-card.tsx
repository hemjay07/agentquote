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

  // Try multiple split strategies to handle different Claude output formats

  // Strategy 1: Split on "RECOMMENDATION N" headers (with colon, bold, or dash)
  const recHeaderPattern = /(?=RECOMMENDATION\s+\d+\s*[:\-—*])/im;
  // Strategy 2: Split on numbered items "1. **Title**" or "1. Title"
  const numberedPattern = /(?=\n\d+\.\s+)/;

  let parts: string[];
  if (recHeaderPattern.test(text)) {
    parts = text.split(/(?=RECOMMENDATION\s+\d+\s*[:\-—*])/im);
  } else if (numberedPattern.test(text)) {
    parts = text.split(/(?=\n\d+\.\s+)/);
    // The first part before "1." is preamble — skip it if short
    if (parts[0] && !/^\s*\d+\.\s+/.test(parts[0].trim())) {
      parts.shift();
    }
  } else {
    // Strategy 3: Split on bold headers "**Title**" at line start
    parts = text.split(/(?=\n\*\*[^*]+\*\*)/);
    if (parts[0] && !parts[0].trim().startsWith("**")) {
      parts.shift();
    }
  }

  const recs: Recommendation[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    if (lines.length < 2) continue;

    // Extract title from first line
    let title = lines[0]
      .replace(/^RECOMMENDATION\s+\d+\s*[:\-—*]\s*/i, "")
      .replace(/^\d+\.\s*/, "")
      .replace(/\*\*/g, "")
      .trim();

    // Skip if title looks like a summary table line (contains brackets like [BIGGEST IMPACT])
    if (/\[.*IMPACT\]/i.test(title)) continue;
    // Skip if title is just a price range
    if (/^\$[\d,]+\s*[-–—]\s*\$[\d,]+/.test(title)) continue;
    // Skip very short titles (likely parsing artifacts)
    if (title.length < 5) continue;

    // Build body from lines after title, stripping metadata lines
    const bodyLines = lines.slice(1).filter((line) => {
      const t = line.trim();
      // Strip metadata lines that we extract as pills
      if (/^estimated\s+savings?:/i.test(t)) return false;
      if (/^quality\s*impact:/i.test(t)) return false;
      if (/^implementation\s+difficulty:/i.test(t)) return false;
      return true;
    });
    const body = bodyLines.join("\n").trim();
    // Skip entries with very short bodies
    if (body.length < 10) continue;

    // Extract metadata from the full text (before stripping)
    const savingsMatch =
      trimmed.match(
        /(?:estimated\s+)?(?:save|savings?)[:\s]*~?\$?([\d,]+(?:\.\d+)?)\s*(?:\/mo|per month|monthly)?/i
      ) ||
      trimmed.match(
        /(?:estimated\s+)?(?:save|savings?)[:\s]*~?(\d+(?:\.\d+)?)\s*%/i
      ) ||
      trimmed.match(
        /\$?([\d,]+(?:\.\d+)?)\s*(?:\/mo|per month|monthly)\s*(?:sav)/i
      );
    let savings: string | null = null;
    if (savingsMatch) {
      const val = savingsMatch[1];
      // If it's a percentage
      if (trimmed.includes(val + "%") || trimmed.includes(val + " %")) {
        savings = `${val}%`;
      } else {
        savings = `$${val}/mo`;
      }
    }

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

    recs.push({ title, savings, difficulty, quality, body });
  }

  return recs;
}

// ── Split body into tier1 (what to change) and tier2 (full analysis) ──

function splitContent(body: string): { tier1: string; tier2: string } {
  // Since metadata lines are stripped, show "What to change" as tier1
  // and everything else as tier2
  const whatToChangeMatch = body.match(
    /What to change:?\s*([\s\S]*)/i
  );

  if (whatToChangeMatch) {
    const content = whatToChangeMatch[1].trim();
    // Split at first blank line or after ~3 lines for tier1/tier2
    const lines = content.split("\n");
    const blankIdx = lines.findIndex((l, i) => i > 0 && !l.trim());
    if (blankIdx > 0 && blankIdx < lines.length - 1) {
      return {
        tier1: lines.slice(0, blankIdx).join("\n").trim(),
        tier2: lines.slice(blankIdx + 1).join("\n").trim(),
      };
    }
    return { tier1: content, tier2: "" };
  }

  // Fallback: first 3 lines as tier1, rest as tier2
  const lines = body.split("\n").filter((l) => l.trim());
  if (lines.length <= 3) {
    return { tier1: body, tier2: "" };
  }
  return {
    tier1: lines.slice(0, 3).join("\n"),
    tier2: lines.slice(3).join("\n"),
  };
}

// ── Color helpers ──

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

// ── Text rendering ──

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

// ── Main component ──

export default function RecommendationCards({ text }: { text: string }) {
  const recs = parseRecommendations(text);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showFullAnalysis, setShowFullAnalysis] = useState<number | null>(null);

  if (recs.length === 0) {
    // Fallback: if parsing failed, render the raw text in a card
    if (text.trim()) {
      return (
        <div>
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
          </div>
          <div className="bg-[#111113] border border-[#27272a] rounded-[12px] p-4">
            {renderBody(text)}
          </div>
        </div>
      );
    }
    return null;
  }

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
        <p className="text-xs text-[#52525b]">
          {recs.length} recommendation{recs.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-2">
        {recs.map((rec, i) => (
          <div
            key={i}
            className="bg-[#111113] border border-[#27272a] rounded-[12px] overflow-hidden"
          >
            <button
              onClick={() => {
                setExpanded(expanded === i ? null : i);
                setShowFullAnalysis(null);
              }}
              className="w-full px-4 py-3 text-left hover:bg-[#27272a]/20 transition-colors"
            >
              {/* Pills row ABOVE title */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {rec.savings && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20 text-[#22c55e]">
                    {rec.savings}
                  </span>
                )}
                {rec.difficulty &&
                  (() => {
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
                  rec.quality.toLowerCase() !== "none" &&
                  (() => {
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

            {/* Two-tier expanded content */}
            {expanded === i &&
              rec.body &&
              (() => {
                const { tier1, tier2 } = splitContent(rec.body);
                return (
                  <div className="px-4 pb-4 border-t border-[#27272a] pt-3">
                    {/* Tier 1: What to change */}
                    {renderBody(tier1)}

                    {/* Tier 2: Full analysis (hidden behind link) */}
                    {tier2 && (
                      <>
                        {showFullAnalysis === i ? (
                          <>
                            <div className="mt-3 pt-3 border-t border-[#27272a]">
                              {renderBody(tier2)}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowFullAnalysis(null);
                              }}
                              className="text-xs text-[#a1a1aa] mt-2 hover:text-[#e4e4e7] transition-colors"
                            >
                              Hide details
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowFullAnalysis(i);
                            }}
                            className="text-xs text-[#22c55e] mt-3 hover:underline"
                          >
                            Show full analysis →
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}
          </div>
        ))}
      </div>
    </div>
  );
}
