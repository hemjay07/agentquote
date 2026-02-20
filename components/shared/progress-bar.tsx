"use client";

import { useState, useEffect, useRef } from "react";

interface ProgressBarProps {
  isLoading: boolean;
  expectedDuration?: number;
  label?: string;
}

export default function ProgressBar({
  isLoading,
  expectedDuration = 8000,
  label = "Analyzing your system...",
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "loading" | "completing">("idle");
  const startTimeRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (isLoading && phase === "idle") {
      setPhase("loading");
      setProgress(0);
      startTimeRef.current = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = 90 * (1 - Math.exp(-elapsed / expectedDuration));
        setProgress(newProgress);
        frameRef.current = requestAnimationFrame(animate);
      };
      frameRef.current = requestAnimationFrame(animate);
    }

    if (!isLoading && phase === "loading") {
      cancelAnimationFrame(frameRef.current);
      setPhase("completing");
      setProgress(100);
      setTimeout(() => {
        setPhase("idle");
        setProgress(0);
      }, 500);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isLoading, phase, expectedDuration]);

  if (phase === "idle") return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[var(--accent)] animate-pulse text-sm">◆</span>
          <span className="text-sm text-[var(--text-secondary)]">{label}</span>
        </div>
        <span
          className="text-xs text-[var(--text-secondary)]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            background: "var(--accent)",
          }}
        />
      </div>
    </div>
  );
}
