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
            We parsed your description. Correct anything that looks wrong —
            recalculation is free.
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4">
        {/* System overview card */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4">
          <h3 className="text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
            System Overview
          </h3>
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

        {/* Agent cards */}
        {parsed.agents.map((agent, i) => (
          <div
            key={i}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4"
          >
            <h3 className="text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
              Agent {i + 1}: {agent.name || "Unnamed"}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Name</label>
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => updateAgent(i, "name", e.target.value)}
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-secondary)]">Model</label>
                <select
                  value={agent.model}
                  onChange={(e) => updateAgent(i, "model", e.target.value)}
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
                  onChange={(e) => updateAgent(i, "has_tools", e.target.value === "yes")}
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
                  onChange={(e) => updateAgent(i, "tool_count", parseInt(e.target.value) || 0)}
                  disabled={!agent.has_tools}
                  className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)] disabled:opacity-40"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Optimizations already in place */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4">
          <h3 className="text-xs text-[var(--text-secondary)] mb-3 uppercase tracking-wide">
            Optimizations In Place
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Check any optimizations your system already uses. This adjusts the estimate.
          </p>
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

        {/* Non-LLM services */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide">
              Non-LLM Services
            </h3>
            <button
              onClick={addService}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              + Add Service
            </button>
          </div>
          {services.length === 0 && (
            <p className="text-xs text-[var(--text-secondary)]">
              No additional services. Add image generation, TTS, embeddings, etc.
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
          className="bg-[var(--accent)] text-black font-semibold px-8 py-3 rounded-md hover:bg-green-400 transition-colors disabled:opacity-50 text-sm"
        >
          Calculate Costs →
        </button>
      </div>
    </div>
  );
}
