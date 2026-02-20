"use client";

import { useState } from "react";

const SMART_PROMPT = `Describe my AI agent system architecture in detail. Include:

1. How many agents are in the system and what each one does
2. What model each agent uses (e.g., Claude Sonnet, GPT-4o, Haiku)
3. What tools each agent has access to (e.g., web search, database, APIs)
4. The orchestration pattern (single agent, multi-agent with supervisor, prompt chain, etc.)
5. How many conversations or tasks per day you expect
6. Average number of turns per conversation
7. Any memory strategy (full history, summarized, entity extraction)
8. Any guardrails in place (max iterations, cost budgets, loop detection)
9. Any non-LLM services used (image generation, text-to-speech, embeddings)

Be specific about numbers where possible.`;

interface SmartPromptProps {
  onSubmit: (description: string) => void;
  disabled: boolean;
}

export default function SmartPrompt({ onSubmit, disabled }: SmartPromptProps) {
  const [response, setResponse] = useState("");
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(SMART_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Step 1: Copy the prompt */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">
          Step 1: Copy this prompt and paste it into your AI assistant
        </h3>
        <div className="relative">
          <pre className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-xs text-[var(--text-secondary)] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {SMART_PROMPT}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 text-xs bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 hover:border-[var(--accent)] transition-colors"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Step 2: Paste the response */}
      <div>
        <h3 className="text-sm font-medium mb-2">
          Step 2: Paste the AI&apos;s response here
        </h3>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Paste the response from Claude, ChatGPT, or any AI assistant..."
          disabled={disabled}
          rows={8}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-sm leading-relaxed resize-y focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-secondary)]/50 disabled:opacity-50"
        />
        <div className="flex justify-end mt-4">
          <button
            onClick={() => onSubmit(response)}
            disabled={disabled || !response.trim()}
            className="bg-[var(--accent)] text-black font-semibold px-6 py-2 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Analyze →
          </button>
        </div>
      </div>
    </div>
  );
}
