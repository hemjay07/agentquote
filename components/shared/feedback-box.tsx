"use client";

import { useState } from "react";

export default function FeedbackBox() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setLoading(true);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_text: text }),
      });
      setSubmitted(true);
    } catch {
      // Don't block the user, but they'll see the form again to retry
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-[var(--bg-card)] border border-green-800/30 rounded-xl p-4">
        <p className="text-sm text-green-400">✓ Thanks for the feedback.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4">
      <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-3">
        Feedback
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Was this estimate helpful? What would make it better?
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Your feedback..."
        rows={3}
        className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-3 py-2 text-sm resize-y focus:outline-none focus:border-[var(--accent)]"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="mt-2 w-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] font-medium px-4 py-2 rounded-xl hover:border-[var(--accent)] transition-colors disabled:opacity-50 text-sm"
      >
        {loading ? "Sending..." : "Send Feedback"}
      </button>
    </div>
  );
}
