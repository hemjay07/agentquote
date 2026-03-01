"use client";

import { useState, useEffect } from "react";
import type { ParsedSystem } from "@/lib/knowledge-base";
import { MODEL_PRICING, MODEL_TIER_THRESHOLDS, API_CALLS_PER_TOOL_USE, TOOL_DEF_OVERHEAD_TOKENS } from "@/lib/knowledge-base";

// Layout constants — bigger boxes for full-width
const BOX_W = 160;
const BOX_H = 65;
const GAP_X = 30;
const GAP_Y = 70;
const ENTRY_W = 110;
const ENTRY_H = 36;
const TOOL_H = 22;
const TOOL_GAP = 8;
const PAD = 24;
const RAG_W = 150;
const LABEL_H = 30;

function modelTierColor(model: string): string {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return "#60a5fa";
  if (pricing.output <= MODEL_TIER_THRESHOLDS.cheap) return "#22c55e";
  if (pricing.output <= MODEL_TIER_THRESHOLDS.mid) return "#60a5fa";
  return "#ef4444";
}

function modelTierFill(model: string): string {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return "rgba(96,165,250,0.05)";
  if (pricing.output <= MODEL_TIER_THRESHOLDS.cheap) return "rgba(34,197,94,0.05)";
  if (pricing.output <= MODEL_TIER_THRESHOLDS.mid) return "rgba(96,165,250,0.05)";
  return "rgba(239,68,68,0.05)";
}

// Per-agent cost % weighted by model pricing × API call volume
function estimateAgentCosts(parsed: ParsedSystem): Record<string, number> {
  const scores: Record<string, number> = {};
  let total = 0;

  for (const agent of parsed.agents) {
    const pricing = MODEL_PRICING[agent.model];
    if (!pricing) {
      scores[agent.name] = 5;
      total += 5;
      continue;
    }
    const modelCost = pricing.input + pricing.output;
    const toolCalls = agent.has_tools ? agent.tool_count * 2 * API_CALLS_PER_TOOL_USE : 0;
    const toolDefOverhead = agent.has_tools ? agent.tool_count * TOOL_DEF_OVERHEAD_TOKENS : 0;
    const estimatedCalls = 1 + toolCalls;
    const score = modelCost * estimatedCalls + (toolDefOverhead * pricing.input / 1_000_000) * estimatedCalls;
    scores[agent.name] = score;
    total += score;
  }

  const pcts: Record<string, number> = {};
  for (const name in scores) {
    pcts[name] = total > 0 ? Math.round((scores[name] / total) * 100) : 0;
  }
  return pcts;
}

export default function FlowDiagram({ parsed }: { parsed: ParsedSystem }) {
  const [expanded, setExpanded] = useState(false);
  const agents = parsed.agents;
  const agentCount = agents.length;
  const hasRag = parsed.has_rag;
  const hasAnyTools = agents.some((a) => a.has_tools && a.tool_count > 0);
  const costPcts = estimateAgentCosts(parsed);
  const maxPct = Math.max(...Object.values(costPcts));

  // Escape to close modal
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [expanded]);

  // Dimensions
  const agentsTotalW =
    agentCount * BOX_W + Math.max(0, agentCount - 1) * GAP_X;
  const ragExtra = hasRag ? RAG_W + GAP_X : 0;
  const contentW = agentsTotalW + ragExtra;
  const viewW = Math.max(contentW + PAD * 2, 500);
  const toolRow = hasAnyTools ? TOOL_H + TOOL_GAP : 0;
  const viewH = PAD + ENTRY_H + GAP_Y + BOX_H + toolRow + LABEL_H + PAD;

  const entryCX = viewW / 2;
  const entryY = PAD;
  const agentY = entryY + ENTRY_H + GAP_Y;
  const startX = (viewW - contentW) / 2;

  const diagram = (
    <svg
      width="100%"
      viewBox={`0 0 ${viewW} ${viewH}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#3f3f46" />
        </marker>
      </defs>

      {/* Entry node */}
      <rect
        x={entryCX - ENTRY_W / 2}
        y={entryY}
        width={ENTRY_W}
        height={ENTRY_H}
        rx={8}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={1.5}
      />
      <text
        x={entryCX}
        y={entryY + ENTRY_H / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#f59e0b"
        fontSize={12}
        fontWeight={500}
      >
        User Input
      </text>

      {/* Connection lines */}
      {agents.map((_, i) => {
        const agentCX = startX + i * (BOX_W + GAP_X) + BOX_W / 2;
        return (
          <line
            key={`line-${i}`}
            x1={entryCX}
            y1={entryY + ENTRY_H}
            x2={agentCX}
            y2={agentY}
            stroke="#3f3f46"
            strokeWidth={1.5}
            markerEnd="url(#arrow)"
          />
        );
      })}

      {/* Agent nodes */}
      {agents.map((agent, i) => {
        const x = startX + i * (BOX_W + GAP_X);
        const cx = x + BOX_W / 2;
        const color = modelTierColor(agent.model);
        const fill = modelTierFill(agent.model);
        const modelLabel = MODEL_PRICING[agent.model]?.label || agent.model;
        const name = agent.name || "Agent";
        const displayName =
          name.length > 18 ? name.slice(0, 17) + "\u2026" : name;
        const pct = costPcts[agent.name] || 0;
        const isExpensive = pct === maxPct && agentCount > 1;

        return (
          <g key={`agent-${i}`}>
            <rect
              x={x}
              y={agentY}
              width={BOX_W}
              height={BOX_H}
              rx={8}
              fill={isExpensive ? fill : "none"}
              stroke={color}
              strokeWidth={isExpensive ? 2.5 : 1.5}
            />
            <text
              x={cx}
              y={agentY + 18}
              textAnchor="middle"
              fill="#e4e4e7"
              fontSize={12}
              fontWeight={500}
            >
              {displayName}
            </text>
            <text
              x={cx}
              y={agentY + 35}
              textAnchor="middle"
              fill={color}
              fontSize={10}
            >
              {modelLabel}
            </text>
            <text
              x={cx}
              y={agentY + 50}
              textAnchor="middle"
              fill="#52525b"
              fontSize={9}
            >
              {pct}% of cost
            </text>

            {/* Tool badge */}
            {agent.has_tools && agent.tool_count > 0 && (
              <>
                <line
                  x1={cx}
                  y1={agentY + BOX_H}
                  x2={cx}
                  y2={agentY + BOX_H + TOOL_GAP}
                  stroke="#3f3f46"
                  strokeWidth={1}
                />
                <rect
                  x={cx - 30}
                  y={agentY + BOX_H + TOOL_GAP}
                  width={60}
                  height={TOOL_H}
                  rx={4}
                  fill="none"
                  stroke="#3f3f46"
                  strokeWidth={1}
                />
                <text
                  x={cx}
                  y={agentY + BOX_H + TOOL_GAP + TOOL_H / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#a1a1aa"
                  fontSize={9}
                >
                  {agent.tool_count} tool
                  {agent.tool_count !== 1 ? "s" : ""}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* RAG box */}
      {hasRag &&
        (() => {
          const ragX = startX + agentsTotalW + GAP_X;
          const ragCX = ragX + RAG_W / 2;
          const lastAgentRight =
            startX + (agentCount - 1) * (BOX_W + GAP_X) + BOX_W;
          const ragLabel = parsed.rag_details || "Vector DB";
          const displayLabel =
            ragLabel.length > 20
              ? ragLabel.slice(0, 19) + "\u2026"
              : ragLabel;

          return (
            <g>
              <line
                x1={lastAgentRight}
                y1={agentY + BOX_H / 2}
                x2={ragX}
                y2={agentY + BOX_H / 2}
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <rect
                x={ragX}
                y={agentY}
                width={RAG_W}
                height={BOX_H}
                rx={8}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="6 3"
              />
              <text
                x={ragCX}
                y={agentY + 24}
                textAnchor="middle"
                fill="#e4e4e7"
                fontSize={12}
                fontWeight={500}
              >
                RAG
              </text>
              <text
                x={ragCX}
                y={agentY + 42}
                textAnchor="middle"
                fill="#f59e0b"
                fontSize={10}
              >
                {displayLabel}
              </text>
            </g>
          );
        })()}

      {/* Bottom label */}
      <text
        x={viewW / 2}
        y={viewH - PAD + 5}
        textAnchor="middle"
        fill="#52525b"
        fontSize={10}
      >
        {parsed.pattern.replace(/_/g, " ")} · {parsed.memory_strategy} memory ·{" "}
        {parsed.avg_turns_per_conversation} turns/convo
      </text>
    </svg>
  );

  return (
    <>
      <div className="bg-[#111113] border border-[#27272a] rounded-[12px] overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-[#27272a]">
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#71717a",
            }}
          >
            Architecture
          </p>
        </div>
        <div
          className="px-4 py-4 overflow-x-auto cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          {diagram}
          <p
            className="text-xs text-center mt-2"
            style={{ color: "#52525b" }}
          >
            Click to expand
          </p>
        </div>
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setExpanded(false)}
        >
          <div
            className="w-[90vw] max-h-[90vh] bg-[#111113] border border-[#27272a] rounded-[16px] p-6 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {diagram}
          </div>
        </div>
      )}
    </>
  );
}
