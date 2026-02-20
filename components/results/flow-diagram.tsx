"use client";

import type { ParsedSystem } from "@/lib/knowledge-base";
import { MODEL_PRICING } from "@/lib/knowledge-base";

function agentBorderColor(model: string): string {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return "#3b82f6";
  if (pricing.output <= 5) return "#22c55e";   // green — cheap
  if (pricing.output <= 15) return "#3b82f6";  // blue — mid
  return "#f59e0b";                             // orange — expensive
}

function agentBgColor(model: string): string {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return "rgba(59,130,246,0.08)";
  if (pricing.output <= 5) return "rgba(34,197,94,0.08)";
  if (pricing.output <= 15) return "rgba(59,130,246,0.08)";
  return "rgba(245,158,11,0.08)";
}

export default function FlowDiagram({ parsed }: { parsed: ParsedSystem }) {
  const agentCount = parsed.agents.length;
  const hasTools = parsed.agents.some((a) => a.has_tools);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl mb-6">
      <div className="px-4 py-3 border-b border-[var(--border)]">
        <h2 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
          Architecture
        </h2>
      </div>
      <div className="px-6 py-6 overflow-x-auto">
        <div className="flex flex-col items-center gap-0 min-w-fit">
          {/* Entry point */}
          <div
            className="rounded-lg px-6 py-2.5 text-sm font-medium border-2"
            style={{
              borderColor: "#F59E0B",
              background: "rgba(245,158,11,0.06)",
              color: "#F59E0B",
            }}
          >
            User Input
          </div>

          {/* Arrow down */}
          <svg width="2" height="28" className="shrink-0">
            <line x1="1" y1="0" x2="1" y2="28" stroke="#3f3f46" strokeWidth="1.5" />
          </svg>

          {/* Agents row */}
          <div className="flex items-start gap-4">
            {parsed.agents.map((agent, i) => {
              const borderColor = agentBorderColor(agent.model);
              const bgColor = agentBgColor(agent.model);
              const modelLabel = MODEL_PRICING[agent.model]?.label || agent.model;

              return (
                <div key={i} className="flex flex-col items-center gap-0">
                  {/* Fan-out arrows for multiple agents */}
                  {agentCount > 1 && (
                    <svg width="2" height="16" className="shrink-0">
                      <line x1="1" y1="0" x2="1" y2="16" stroke="#3f3f46" strokeWidth="1.5" />
                    </svg>
                  )}

                  {/* Agent box */}
                  <div
                    className="rounded-lg px-5 py-3 border-2 text-center min-w-[140px]"
                    style={{ borderColor, background: bgColor }}
                  >
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {agent.name || "Agent"}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: borderColor }}>
                      {modelLabel}
                    </p>
                  </div>

                  {/* Tool badges */}
                  {agent.has_tools && agent.tool_count > 0 && (
                    <>
                      <svg width="2" height="12" className="shrink-0">
                        <line x1="1" y1="0" x2="1" y2="12" stroke="#3f3f46" strokeWidth="1" />
                      </svg>
                      <div className="flex flex-wrap gap-1 justify-center max-w-[160px]">
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-secondary)]">
                          {agent.tool_count} tool{agent.tool_count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {/* RAG box */}
            {parsed.has_rag && (
              <div className="flex flex-col items-center gap-0">
                {agentCount > 1 && <div className="h-4" />}
                <div
                  className="rounded-lg px-5 py-3 border-2 text-center min-w-[140px]"
                  style={{
                    borderColor: "#F59E0B",
                    background: "rgba(245,158,11,0.06)",
                  }}
                >
                  <p className="text-sm font-medium text-[var(--text-primary)]">RAG</p>
                  <p className="text-xs text-[var(--accent)] mt-0.5 line-clamp-2">
                    {parsed.rag_details || "Vector DB"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom label */}
          <div className="mt-5 text-xs text-[var(--text-secondary)] text-center">
            {parsed.pattern.replace(/_/g, " ")} · {parsed.memory_strategy} memory · {parsed.avg_turns_per_conversation} turns/convo
          </div>
        </div>
      </div>
    </div>
  );
}
