"use client";

import { useState } from "react";
import {
  MODEL_PRICING,
  PATTERN_PROFILES,
  MEMORY_MULTIPLIERS,
  type ParsedSystem,
  type ParsedAgent,
} from "@/lib/knowledge-base";

interface GuidedFormProps {
  onSubmit: (data: ParsedSystem) => void;
  disabled: boolean;
}

const EMPTY_AGENT: ParsedAgent = {
  name: "",
  role: "",
  model: "claude-sonnet-4-5",
  has_tools: false,
  tool_count: 0,
  tools_described: [],
};

export default function GuidedForm({ onSubmit, disabled }: GuidedFormProps) {
  const [systemName, setSystemName] = useState("");
  const [agents, setAgents] = useState<ParsedAgent[]>([{ ...EMPTY_AGENT }]);
  const [pattern, setPattern] = useState("react_agent");
  const [memory, setMemory] = useState("buffer");
  const [turns, setTurns] = useState(5);
  const [dailyConvos, setDailyConvos] = useState(100);
  const [hasRag, setHasRag] = useState(false);
  const [customModel, setCustomModel] = useState({
    name: "",
    input: 0,
    output: 0,
  });
  const [showCustomModel, setShowCustomModel] = useState(false);

  function updateAgent(index: number, field: string, value: any) {
    const updated = [...agents];
    (updated[index] as any)[field] = value;
    if (field === "has_tools" && !value) {
      updated[index].tool_count = 0;
      updated[index].tools_described = [];
    }
    setAgents(updated);
  }

  function addAgent() {
    setAgents([...agents, { ...EMPTY_AGENT }]);
  }

  function removeAgent(index: number) {
    if (agents.length <= 1) return;
    setAgents(agents.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const data: ParsedSystem = {
      system_name: systemName || "Custom System",
      agents,
      pattern,
      memory_strategy: memory,
      avg_turns_per_conversation: turns,
      daily_conversations: dailyConvos,
      has_rag: hasRag,
      rag_details: hasRag ? "User specified RAG" : null,
      guardrails_mentioned: [],
      additional_services: [],
    };
    onSubmit(data);
  }

  const modelOptions = Object.entries(MODEL_PRICING).map(([key, val]) => ({
    value: key,
    label: val.label,
  }));

  return (
    <div className="space-y-6">
      {/* System name */}
      <div>
        <label className="block text-xs text-[var(--text-secondary)] mb-1">
          System Name
        </label>
        <input
          type="text"
          value={systemName}
          onChange={(e) => setSystemName(e.target.value)}
          placeholder="e.g., Customer Service Bot"
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* Agents */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-[var(--text-secondary)]">Agents</label>
          <button
            onClick={addAgent}
            className="text-xs text-[var(--accent)] hover:underline"
          >
            + Add Agent
          </button>
        </div>
        <div className="space-y-3">
          {agents.map((agent, i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)]">
                  Agent {i + 1}
                </span>
                {agents.length > 1 && (
                  <button
                    onClick={() => removeAgent(i)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={agent.name}
                  onChange={(e) => updateAgent(i, "name", e.target.value)}
                  placeholder="Agent name"
                  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                />
                <select
                  value={agent.model}
                  onChange={(e) => updateAgent(i, "model", e.target.value)}
                  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
                >
                  {modelOptions.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                  {showCustomModel && customModel.name && (
                    <option value={customModel.name}>
                      {customModel.name} (custom)
                    </option>
                  )}
                </select>
              </div>
              <input
                type="text"
                value={agent.role}
                onChange={(e) => updateAgent(i, "role", e.target.value)}
                placeholder="Role (e.g., handles billing queries)"
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={agent.has_tools}
                    onChange={(e) =>
                      updateAgent(i, "has_tools", e.target.checked)
                    }
                    className="accent-[var(--accent)]"
                  />
                  Has tools
                </label>
                {agent.has_tools && (
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[var(--text-secondary)]">
                      Tool count:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={agent.tool_count}
                      onChange={(e) =>
                        updateAgent(i, "tool_count", parseInt(e.target.value) || 0)
                      }
                      className="w-16 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-sm focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom model */}
      <div>
        <button
          onClick={() => setShowCustomModel(!showCustomModel)}
          className="text-xs text-[var(--accent)] hover:underline"
        >
          {showCustomModel ? "− Hide custom model" : "+ Add custom model pricing"}
        </button>
        {showCustomModel && (
          <div className="grid grid-cols-3 gap-3 mt-2">
            <input
              type="text"
              value={customModel.name}
              onChange={(e) =>
                setCustomModel({ ...customModel, name: e.target.value })
              }
              placeholder="Model name"
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <input
              type="number"
              step="0.01"
              value={customModel.input || ""}
              onChange={(e) =>
                setCustomModel({
                  ...customModel,
                  input: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="$/MTok input"
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
            <input
              type="number"
              step="0.01"
              value={customModel.output || ""}
              onChange={(e) =>
                setCustomModel({
                  ...customModel,
                  output: parseFloat(e.target.value) || 0,
                })
              }
              placeholder="$/MTok output"
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}
      </div>

      {/* Pattern + Memory + Volume */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">
            Architecture Pattern
          </label>
          <select
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          >
            {Object.entries(PATTERN_PROFILES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">
            Memory Strategy
          </label>
          <select
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          >
            {Object.entries(MEMORY_MULTIPLIERS).map(([key, val]) => (
              <option key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)} — {val.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">
            Conversations per day: {dailyConvos}
          </label>
          <input
            type="range"
            min={1}
            max={5000}
            value={dailyConvos}
            onChange={(e) => setDailyConvos(parseInt(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">
            Avg turns per conversation: {turns}
          </label>
          <input
            type="range"
            min={1}
            max={100}
            value={turns}
            onChange={(e) => setTurns(parseInt(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
        </div>
      </div>

      {/* RAG toggle */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={hasRag}
          onChange={(e) => setHasRag(e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Uses RAG (Retrieval Augmented Generation)
      </label>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={disabled || agents.every((a) => !a.name)}
        className="w-full bg-[var(--accent)] text-black font-semibold px-6 py-3 rounded-md hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        Review Assumptions →
      </button>
    </div>
  );
}
