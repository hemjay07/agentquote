"use client";

import { useState } from "react";

export default function EmailCaptureHome() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, estimate: null, reminder_date: null }),
      });
      setSubscribed(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  if (subscribed) {
    return <p className="text-sm text-[var(--accent)]">You&apos;re on the list.</p>;
  }

  return (
    <div className="flex items-center gap-2.5 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-dim)]"
        onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
      />
      <button
        onClick={handleSubscribe}
        disabled={loading || !email}
        className="bg-[var(--accent)] text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
      >
        {loading ? "..." : "Subscribe"}
      </button>
    </div>
  );
}
