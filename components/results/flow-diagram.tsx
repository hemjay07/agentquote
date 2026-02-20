"use client";

import type { ParsedSystem } from "@/lib/knowledge-base";
import { MODEL_PRICING } from "@/lib/knowledge-base";

// Layout constants
const BOX_W = 130;
const BOX_H = 50;
const GAP_X = 30;
const GAP_Y = 70;
const ENTRY_W = 100;
const ENTRY_H = 34;
const TOOL_H = 20;
const TOOL_GAP = 8;
const PAD = 20;
const RAG_W = 140;
const LABEL_H = 30;

function modelTierColor(model: string): string {
  const pricing = MODEL_PRICING[model];
  if (!pricing) return "#60a5fa";
  if (pricing.output <= 5) return "#22c55e";
  if (pricing.output <= 15) return "#60a5fa";
  return "#ef4444";
}

export default function FlowDiagram({ parsed }: { parsed: ParsedSystem }) {
  const agents = parsed.agents;
  const agentCount = agents.length;
  const hasRag = parsed.has_rag;
  const hasAnyTools = agents.some((a) => a.has_tools && a.tool_count > 0);

  // Calculate dimensions
  const agentsTotalW = agentCount * BOX_W + Math.max(0, agentCount - 1) * GAP_X;
  const ragExtra = hasRag ? RAG_W + GAP_X : 0;
  const contentW = agentsTotalW + ragExtra;
  const viewW = Math.max(contentW + PAD * 2, 400);
  const toolRow = hasAnyTools ? TOOL_H + TOOL_GAP : 0;
  const viewH = PAD + ENTRY_H + GAP_Y + BOX_H + toolRow + LABEL_H + PAD;

  // Positions
  const entryCX = viewW / 2;
  const entryY = PAD;
  const agentY = entryY + ENTRY_H + GAP_Y;
  const startX = (viewW - contentW) / 2;

  return (
    <div className="bg-[#111113] border border-[#27272a] rounded-[12px] overflow-hidden">
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
      <div className="px-4 py-4 overflow-x-auto">
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
            fontSize={11}
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
            const modelLabel =
              MODEL_PRICING[agent.model]?.label || agent.model;
            const name = agent.name || "Agent";
            const displayName =
              name.length > 16 ? name.slice(0, 15) + "\u2026" : name;

            return (
              <g key={`agent-${i}`}>
                <rect
                  x={x}
                  y={agentY}
                  width={BOX_W}
                  height={BOX_H}
                  rx={8}
                  fill="none"
                  stroke={color}
                  strokeWidth={1.5}
                />
                <text
                  x={cx}
                  y={agentY + 19}
                  textAnchor="middle"
                  fill="#e4e4e7"
                  fontSize={10}
                  fontWeight={500}
                >
                  {displayName}
                </text>
                <text
                  x={cx}
                  y={agentY + 35}
                  textAnchor="middle"
                  fill={color}
                  fontSize={9}
                >
                  {modelLabel}
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
                      x={cx - 28}
                      y={agentY + BOX_H + TOOL_GAP}
                      width={56}
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
          {hasRag && (() => {
            const ragX = startX + agentsTotalW + GAP_X;
            const ragCX = ragX + RAG_W / 2;
            const lastAgentCX =
              startX + (agentCount - 1) * (BOX_W + GAP_X) + BOX_W;
            const ragLabel = parsed.rag_details || "Vector DB";
            const displayLabel =
              ragLabel.length > 18 ? ragLabel.slice(0, 17) + "\u2026" : ragLabel;

            return (
              <g>
                <line
                  x1={lastAgentCX}
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
                  y={agentY + 19}
                  textAnchor="middle"
                  fill="#e4e4e7"
                  fontSize={10}
                  fontWeight={500}
                >
                  RAG
                </text>
                <text
                  x={ragCX}
                  y={agentY + 35}
                  textAnchor="middle"
                  fill="#f59e0b"
                  fontSize={9}
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
            {parsed.pattern.replace(/_/g, " ")} · {parsed.memory_strategy}{" "}
            memory · {parsed.avg_turns_per_conversation} turns/convo
          </text>
        </svg>
      </div>
    </div>
  );
}
