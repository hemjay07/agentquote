"use client";

import { useState } from "react";
import type { CostEstimate } from "@/lib/knowledge-base";

interface EmailCaptureProps {
  estimate: CostEstimate;
}

export default function EmailCapture({ estimate }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);

    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          estimate: {
            low: estimate.low.monthly_cost,
            mid: estimate.mid.monthly_cost,
            high: estimate.high.monthly_cost,
          },
          reminder_date: reminderDate || null,
        }),
      });
      setSubmitted(true);
    } catch {
      // Silently fail — don't block the user
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-[var(--bg-card)] border border-green-800/30 rounded-md p-4">
        <p className="text-sm text-green-400">
          ✓ You&apos;re on the list.{" "}
          {reminderDate && "We'll remind you to compare with real costs."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4">
      <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-3">
        Join the Waitlist
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Get notified when AgentQuote Pro launches. We&apos;ll also remind you to
        compare this estimate with your real costs.
      </p>
      <div className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
        />
        <div>
          <label className="text-xs text-[var(--text-secondary)]">
            When will your system be live? (optional)
          </label>
          <input
            type="date"
            value={reminderDate}
            onChange={(e) => setReminderDate(e.target.value)}
            className="w-full mt-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !email}
          className="w-full bg-[var(--accent)] text-black font-semibold px-4 py-2 rounded-md hover:bg-green-400 transition-colors disabled:opacity-50 text-sm"
        >
          {loading ? "Saving..." : "Subscribe"}
        </button>
      </div>
    </div>
  );
}
