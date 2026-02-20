"use client";

import { useState } from "react";

const PLACEHOLDER = `Example: I have a customer service bot with RAG for our knowledge base. There's a supervisor agent that routes queries to 3 specialists:
- Billing agent with access to our billing API
- Technical agent with docs search and ticket system
- General agent for FAQs

We expect 500 conversations/day, averaging 8 turns each. Using Claude Sonnet for specialists and Haiku for the router.`;

interface TextInputProps {
  onSubmit: (description: string) => void;
  disabled: boolean;
}

export default function TextInput({ onSubmit, disabled }: TextInputProps) {
  const [description, setDescription] = useState("");

  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={PLACEHOLDER}
        disabled={disabled}
        rows={10}
        className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-sm leading-relaxed resize-y focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-secondary)]/50 disabled:opacity-50"
      />
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-[var(--text-secondary)]">
          Be as specific as you can — models, tools, volume, turns.
          We&apos;ll infer anything you leave out.
        </p>
        <button
          onClick={() => onSubmit(description)}
          disabled={disabled || !description.trim()}
          className="bg-[var(--accent)] text-black font-semibold px-6 py-2 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Analyze →
        </button>
      </div>
    </div>
  );
}
