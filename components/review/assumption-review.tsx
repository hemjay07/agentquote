"use client";

import { useState } from "react";
import {
  MODEL_PRICING,
  PATTERN_PROFILES,
  MEMORY_MULTIPLIERS,
  SERVICE_PRESETS,
  type ParsedSystem,
  type ParsedAgent,
  type OptimizationFlags,
  type NonLLMService,
} from "@/lib/knowledge-base";

interface AssumptionReviewProps {
  parsed: ParsedSystem;
  optimizations: OptimizationFlags;
  nonLLMServices: NonLLMService[];
  onCalculate: (
    parsed: ParsedSystem,
    opts: OptimizationFlags,
    services: NonLLMService[]
  ) => void;
  onBack: () => void;
  disabled: boolean;
}

export default function AssumptionReview({
  parsed: initial,
  optimizations: initialOpts,
  nonLLMServices: initialServices,
  onCalculate,
  onBack,
  disabled,
}: AssumptionReviewProps) {
  const [parsed, setParsed] = useState<ParsedSystem>({ ...initial });
  const [opts, setOpts] = useState<OptimizationFlags>({ ...initialOpts });
  const [services, setServices] = useState<NonLLMService[]>([...initialServices]);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [editingAgent, setEditingAgent] = useState<number | null>(null);

  function updateField(field: keyof ParsedSystem, value: any) {
    setParsed({ ...parsed, [field]: value });
  }

  function updateAgent(index: number, field: keyof ParsedAgent, value: any) {
    const updated = [...parsed.agents];
    (updated[index] as any)[field] = value;
    setParsed({ ...parsed, agents: updated });
  }

  function addService() {
    services.push({ name: "", unit_price: 0, unit_label: "", daily_volume: 0 });
    setServices([...services]);
  }

  function updateService(index: number, field: string, value: any) {
    const updated = [...services];
    (updated[index] as any)[field] = value;
    setServices(updated);
  }

  function applyPreset(index: number, presetKey: string) {
    const preset = SERVICE_PRESETS[presetKey];
    if (!preset) return;
    const updated = [...services];
    updated[index] = {
      name: presetKey,
      unit_price: preset.unit_price,
      unit_label: preset.unit_label,
      daily_volume: updated[index].daily_volume || 100,
    };
    setServices(updated);
  }

  const patternLabel = PATTERN_PROFILES[parsed.pattern]?.label || parsed.pattern.replace(/_/g, " ");
  const memoryLabel = parsed.memory_strategy.charAt(0).toUpperCase() + parsed.memory_strategy.slice(1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Review Assumptions
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Correct anything that looks wrong — recalculation is free.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-3">
        {/* System overview — collapsed summary */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
          <div
            className="px-4 py-3 flex items-center justify-between cursor-pointer"
            onClick={() => setOverviewExpanded(!overviewExpanded)}
          >
            <p className="text-sm">
              <span className="text-[var(--text-primary)]">{patternLabel}</span>
              <span className="text-[var(--text-secondary)]"> · </span>
              <span className="text-[var(--text-primary)]">{memoryLabel} memory</span>
              <span className="text-[var(--text-secondary)]"> · </span>
              <span className="text-[var(--text-primary)]">{parsed.daily_conversations.toLocaleString()} convos/day</span>
              <span className="text-[var(--text-secondary)]"> · </span>
              <span className="text-[var(--text-primary)]">{parsed.avg_turns_per_conversation} turns</span>
            </p>
            <button className="text-xs text-[var(--accent)] ml-3 shrink-0">
              {overviewExpanded ? "close" : "edit"}
            </button>
          </div>
          {overviewExpanded && (
            <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-secondary)]">Pattern</label>
                  <select
                    value={parsed.pattern}
                    onChange={(e) => updateField("pattern", e.target.value)}
                    className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                  >
                    {Object.entries(PATTERN_PROFILES).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)]">Memory</label>
                  <select
                    value={parsed.memory_strategy}
                    onChange={(e) => updateField("memory_strategy", e.target.value)}
                    className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                  >
                    {Object.keys(MEMORY_MULTIPLIERS).map((key) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)]">Convos/day</label>
                  <input
                    type="number"
                    value={parsed.daily_conversations}
                    onChange={(e) => updateField("daily_conversations", parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)]">Turns/convo</label>
                  <input
                    type="number"
                    value={parsed.avg_turns_per_conversation}
                    onChange={(e) => updateField("avg_turns_per_conversation", parseInt(e.target.value) || 0)}
                    className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Agent table */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs text-[var(--text-secondary)] uppercase tracking-wide">
                <th className="px-4 py-2.5 text-left font-medium">Agent</th>
                <th className="px-4 py-2.5 text-left font-medium">Model</th>
                <th className="px-4 py-2.5 text-center font-medium">Tools</th>
                <th className="px-4 py-2.5 text-right font-medium w-16"></th>
              </tr>
            </thead>
            <tbody>
              {parsed.agents.map((agent, i) => (
                <AgentRow
                  key={i}
                  agent={agent}
                  index={i}
                  isEditing={editingAgent === i}
                  onToggleEdit={() => setEditingAgent(editingAgent === i ? null : i)}
                  onUpdate={updateAgent}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Optimizations — collapsed */}
        <details className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
          <summary className="px-4 py-3 cursor-pointer text-sm text-[var(--text-secondary)] select-none">
            Advanced: Optimizations in place
          </summary>
          <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
            <div className="grid grid-cols-2 gap-3">
              {([
                ["caching_enabled", "Prompt caching", "System prompt/tools cached (90% off reads)"],
                ["batch_processing", "Batch processing", "Non-real-time requests batched (50% off)"],
                ["loop_detection", "Loop/failure detection", "Tools blocked after repeated failures (49% savings)"],
                ["tool_specific_routing", "Tool-specific routing", "Only relevant tools sent per request (saves ~500 tokens/tool)"],
              ] as [keyof OptimizationFlags, string, string][]).map(([key, label, desc]) => (
                <label key={key} className="flex items-start gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opts[key]}
                    onChange={(e) => setOpts({ ...opts, [key]: e.target.checked })}
                    className="accent-[var(--accent)] mt-1"
                  />
                  <span>
                    {label}
                    <span className="block text-xs text-[var(--text-secondary)]">{desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </details>

        {/* Non-LLM services — collapsed */}
        <details className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
          <summary className="px-4 py-3 cursor-pointer text-sm text-[var(--text-secondary)] select-none">
            Advanced: Non-LLM services
          </summary>
          <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Add image generation, TTS, embeddings, etc.
              </p>
              <button
                onClick={addService}
                className="text-xs text-[var(--accent)] hover:underline"
              >
                + Add Service
              </button>
            </div>
            {services.length === 0 && (
              <p className="text-xs text-[var(--text-secondary)]">
                No additional services configured.
              </p>
            )}
            {services.map((svc, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <select
                  value={svc.name}
                  onChange={(e) => {
                    updateService(i, "name", e.target.value);
                    applyPreset(i, e.target.value);
                  }}
                  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">Select...</option>
                  {Object.keys(SERVICE_PRESETS).map((key) => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                  <option value="custom">Custom</option>
                </select>
                <input
                  type="number"
                  step="0.001"
                  value={svc.unit_price || ""}
                  onChange={(e) => updateService(i, "unit_price", parseFloat(e.target.value) || 0)}
                  placeholder="$/unit"
                  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="text"
                  value={svc.unit_label}
                  onChange={(e) => updateService(i, "unit_label", e.target.value)}
                  placeholder="per image"
                  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                />
                <input
                  type="number"
                  value={svc.daily_volume || ""}
                  onChange={(e) => updateService(i, "daily_volume", parseInt(e.target.value) || 0)}
                  placeholder="daily volume"
                  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={onBack}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← Adjust Description
        </button>
        <button
          onClick={() => onCalculate(parsed, opts, services)}
          disabled={disabled}
          className="bg-[var(--accent)] text-black font-semibold px-8 py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 text-sm"
        >
          Calculate Costs →
        </button>
      </div>
    </div>
  );
}

// ── Inline-editable agent row ──

function AgentRow({
  agent,
  index,
  isEditing,
  onToggleEdit,
  onUpdate,
}: {
  agent: ParsedAgent;
  index: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (index: number, field: keyof ParsedAgent, value: any) => void;
}) {
  const modelLabel = MODEL_PRICING[agent.model]?.label || agent.model;

  return (
    <>
      <tr className="border-b border-[var(--border)] last:border-b-0">
        <td className="px-4 py-2.5 text-[var(--text-primary)]">{agent.name || "Unnamed"}</td>
        <td className="px-4 py-2.5 text-[var(--text-secondary)]">{modelLabel}</td>
        <td className="px-4 py-2.5 text-center text-[var(--text-secondary)]">{agent.has_tools ? agent.tool_count : "—"}</td>
        <td className="px-4 py-2.5 text-right">
          <button
            onClick={onToggleEdit}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            {isEditing ? "close" : "edit"}
          </button>
        </td>
      </tr>
      {isEditing && (
        <tr className="border-b border-[var(--border)]">
          <td colSpan={4} className="px-4 py-3 bg-[var(--bg-secondary)]/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Name</label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => onUpdate(index, "name", e.target.value)}
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Model</label>
                <select
                  value={agent.model}
                  onChange={(e) => onUpdate(index, "model", e.target.value)}
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                >
                  {Object.entries(MODEL_PRICING).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Has tools</label>
                <select
                  value={agent.has_tools ? "yes" : "no"}
                  onChange={(e) => onUpdate(index, "has_tools", e.target.value === "yes")}
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Tool count</label>
                <input
                  type="number"
                  min={0}
                  value={agent.tool_count}
                  onChange={(e) => onUpdate(index, "tool_count", parseInt(e.target.value) || 0)}
                  disabled={!agent.has_tools}
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)] disabled:opacity-40"
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
