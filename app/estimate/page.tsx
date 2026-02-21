"use client";

import { useState, useRef } from "react";
import type {
  ParsedSystem,
  CostEstimate,
  OptimizationFlags,
  NonLLMService,
} from "@/lib/knowledge-base";
import TextInput from "@/components/input/text-input";
import GuidedForm from "@/components/input/guided-form";
import SmartPrompt from "@/components/input/smart-prompt";
import AssumptionReview from "@/components/review/assumption-review";
import ResultsDashboard from "@/components/results/results-dashboard";
import UsageCounter from "@/components/shared/usage-counter";
import ProgressBar from "@/components/shared/progress-bar";
import Link from "next/link";

type Step = "input" | "review" | "results";
type InputTab = "text" | "guided" | "prompt";

export default function EstimatePage() {
  // Flow state
  const [step, setStep] = useState<Step>("input");
  const [inputTab, setInputTab] = useState<InputTab>("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data flowing through the pipeline
  const [parsed, setParsed] = useState<ParsedSystem | null>(null);
  const [costs, setCosts] = useState<CostEstimate | null>(null);
  const [recommendations, setRecommendations] = useState<string>("");
  const [optimizations, setOptimizations] = useState<OptimizationFlags>({
    caching_enabled: false,
    batch_processing: false,
    loop_detection: false,
    tool_specific_routing: false,
  });
  const [nonLLMServices, setNonLLMServices] = useState<NonLLMService[]>([]);
  const [usageRefresh, setUsageRefresh] = useState(0);

  // Analytics state
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<"text" | "guided" | "prompt">("text");
  const [rawDescription, setRawDescription] = useState<string | null>(null);

  // Progress bar ref for scroll-into-view
  const calcProgressRef = useRef<HTMLDivElement>(null);

  // ── Step 1 → 2: Parse description, move to review ──
  async function handleDescriptionSubmit(description: string) {
    setLoading(true);
    setError(null);
    setInputMethod(inputTab === "prompt" ? "prompt" : "text");
    setRawDescription(description);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!parseRes.ok) {
        const err = await parseRes.json();
        throw new Error(err.error || "Failed to parse description");
      }

      const { parsed: parsedData } = await parseRes.json();
      setParsed(parsedData);

      await fetch("/api/usage", { method: "POST" });
      setUsageRefresh((n) => n + 1);

      setStep("review");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1 (guided) → 2: Direct to review with structured data ──
  function handleGuidedSubmit(data: ParsedSystem) {
    setInputMethod("guided");
    setRawDescription(null);
    setParsed(data);
    setStep("review");
  }

  // ── Step 2 → 3: Calculate costs + get recommendations ──
  async function handleCalculate(
    updatedParsed: ParsedSystem,
    opts: OptimizationFlags,
    services: NonLLMService[]
  ) {
    setLoading(true);
    setError(null);
    setParsed(updatedParsed);
    setOptimizations(opts);
    setNonLLMServices(services);

    // Scroll to progress bar
    setTimeout(() => {
      calcProgressRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const calcRes = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsed: updatedParsed,
          optimizations: opts,
          nonLLMServices: services,
        }),
        signal: controller.signal,
      });

      if (!calcRes.ok) throw new Error("Calculation failed");
      const { costs: costData } = await calcRes.json();
      setCosts(costData);

      const recRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsed: updatedParsed, costs: costData, optimizations: opts }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!recRes.ok) throw new Error("Recommendations failed");
      const { recommendations: recData } = await recRes.json();
      setRecommendations(recData);

      await fetch("/api/usage", { method: "POST" });
      setUsageRefresh((n) => n + 1);

      // Log analysis for data moat (fire-and-forget, don't block the UI)
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_method: inputMethod,
          raw_description: rawDescription,
          parsed: updatedParsed,
          costs: costData,
          optimizations: opts,
          recommendations: recData,
        }),
      }).then(res => res.json()).then(data => {
        if (data.analysis_id) setAnalysisId(data.analysis_id);
      }).catch(() => {
        // Analytics failure should never block the user
      });

      setStep("results");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        const message =
          err instanceof Error ? err.message : "An error occurred";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Recalculate from results (FREE — no API calls) ──
  async function handleRecalculate(
    updatedParsed: ParsedSystem,
    opts: OptimizationFlags
  ) {
    setLoading(true);
    setParsed(updatedParsed);
    setOptimizations(opts);

    try {
      const calcRes = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsed: updatedParsed,
          optimizations: opts,
          nonLLMServices,
        }),
      });

      if (!calcRes.ok) throw new Error("Recalculation failed");
      const { costs: costData } = await calcRes.json();
      setCosts(costData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[var(--accent)] font-bold text-lg">◆</span>
          <span className="font-semibold tracking-tight">AgentQuote</span>
        </Link>
        <UsageCounter refreshKey={usageRefresh} />
      </nav>

      {/* Progress indicator */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-3 text-xs">
          {(["input", "review", "results"] as Step[]).map((s, i) => {
            const labels = ["Describe", "Review", "Results"];
            const isActive = step === s;
            const isPast = ["input", "review", "results"].indexOf(step) > i;
            return (
              <span key={s} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    className={`w-8 h-px ${isPast ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
                  />
                )}
                <span
                  className={`flex items-center gap-1.5 ${isActive ? "text-[var(--accent)] font-medium" : isPast ? "text-[var(--accent)]/60" : "text-[var(--text-dim)]"}`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold border ${isActive ? "border-[var(--accent)] bg-[var(--accent)]/10" : isPast ? "border-[var(--accent)]/40 bg-[var(--accent)]/5" : "border-[var(--border)]"}`}
                  >
                    {isPast ? "✓" : i + 1}
                  </span>
                  {labels[i]}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="bg-red-900/30 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-400 hover:text-red-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ── STEP 1: Input ── */}
        {step === "input" && (
          <div>
            <h1
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Describe your AI system
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Tell us about your agent architecture and we&apos;ll estimate the
              cost.
            </p>

            {/* Tab switcher */}
            <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
              {(
                [
                  ["text", "Free Text"],
                  ["guided", "Guided Form"],
                  ["prompt", "Smart Prompt"],
                ] as [InputTab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setInputTab(key)}
                  className={`px-4 py-2 text-sm transition-colors ${
                    inputTab === key
                      ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {inputTab === "text" && (
              <TextInput
                onSubmit={handleDescriptionSubmit}
                disabled={loading}
              />
            )}
            {inputTab === "guided" && (
              <GuidedForm onSubmit={handleGuidedSubmit} disabled={loading} />
            )}
            {inputTab === "prompt" && (
              <SmartPrompt
                onSubmit={handleDescriptionSubmit}
                disabled={loading}
              />
            )}
          </div>
        )}

        {/* ── STEP 2: Review assumptions ── */}
        {step === "review" && parsed && (
          <div>
            {/* Calculate progress bar — shown above review */}
            <div ref={calcProgressRef}>
              {loading && (
                <div className="mb-6">
                  <ProgressBar
                    isLoading={loading}
                    expectedDuration={10000}
                    label="Generating cost estimate and optimizations..."
                  />
                </div>
              )}
            </div>
            <AssumptionReview
              parsed={parsed}
              optimizations={optimizations}
              nonLLMServices={nonLLMServices}
              onCalculate={handleCalculate}
              onBack={() => setStep("input")}
              disabled={loading}
            />
          </div>
        )}

        {/* ── STEP 3: Results ── */}
        {step === "results" && parsed && costs && (
          <ResultsDashboard
            parsed={parsed}
            costs={costs}
            recommendations={recommendations}
            optimizations={optimizations}
            analysisId={analysisId}
            onRecalculate={handleRecalculate}
            onBack={() => setStep("review")}
          />
        )}
      </div>
    </main>
  );
}
