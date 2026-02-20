"use client";

import { useState, useEffect } from "react";

export default function UsageCounter({ refreshKey = 0 }: { refreshKey?: number }) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [total, setTotal] = useState(830);

  useEffect(() => {
    fetch("/api/usage")
      .then((res) => res.json())
      .then((data) => {
        setRemaining(data.remaining);
        setTotal(data.total);
      })
      .catch(() => {});
  }, [refreshKey]);

  if (remaining === null) return null;

  const pct = Math.round((remaining / total) * 100);
  const color =
    pct > 50
      ? "text-green-400 border-green-800/40"
      : pct > 20
      ? "text-yellow-400 border-yellow-800/40"
      : "text-red-400 border-red-800/40";

  return (
    <span className={`text-xs border rounded px-2 py-1 ${color}`}>
      {remaining} analyses left
    </span>
  );
}
