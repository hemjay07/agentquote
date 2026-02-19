"use client";

import { useState } from "react";
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
import CSVUpload from "@/components/results/csv-upload";
import EmailCapture from "@/components/shared/email-capture";
import FeedbackBox from "@/components/shared/feedback-box";
import UsageCounter from "@/components/shared/usage-counter";
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

  // ── Step 1 → 2: Parse description, move to review ──
  async function handleDescriptionSubmit(description: string) {
    setLoading(true);
    setError(null);

    try {
      // Call parse API (1 Haiku call, costs ~$0.003)
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!parseRes.ok) {
        const err = await parseRes.json();
        throw new Error(err.error || "Failed to parse description");
      }

      const { parsed: parsedData } = await parseRes.json();
      setParsed(parsedData);

      // Decrement usage counter
      await fetch("/api/usage", { method: "POST" });

      setStep("review");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Step 1 (guided) → 2: Direct to review with structured data ──
  function handleGuidedSubmit(data: ParsedSystem) {
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

    try {
      // Calculate costs (FREE — pure math)
      const calcRes = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsed: updatedParsed,
          optimizations: opts,
          nonLLMServices: services,
        }),
      });

      if (!calcRes.ok) throw new Error("Calculation failed");
      const { costs: costData } = await calcRes.json();
      setCosts(costData);

      // Get recommendations (1 Haiku call, costs ~$0.003)
      const recRes = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parsed: updatedParsed, costs: costData }),
      });

      if (!recRes.ok) throw new Error("Recommendations failed");
      const { recommendations: recData } = await recRes.json();
      setRecommendations(recData);

      // Decrement usage counter
      await fetch("/api/usage", { method: "POST" });

      setStep("results");
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
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
        <UsageCounter />
      </nav>

      {/* Progress indicator */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className={step === "input" ? "text-[var(--accent)]" : ""}>
            01 Describe
          </span>
          <span>→</span>
          <span className={step === "review" ? "text-[var(--accent)]" : ""}>
            02 Review
          </span>
          <span>→</span>
          <span className={step === "results" ? "text-[var(--accent)]" : ""}>
            03 Results
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="bg-red-900/30 border border-red-800 rounded-md px-4 py-3 text-sm text-red-300">
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

      {/* Loading overlay */}
      {loading && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md px-4 py-3 text-sm text-[var(--text-secondary)] flex items-center gap-2">
            <span className="animate-pulse">◆</span>
            Analyzing your system...
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
          <AssumptionReview
            parsed={parsed}
            optimizations={optimizations}
            nonLLMServices={nonLLMServices}
            onCalculate={handleCalculate}
            onBack={() => setStep("input")}
            disabled={loading}
          />
        )}

        {/* ── STEP 3: Results ── */}
        {step === "results" && parsed && costs && (
          <div>
            <ResultsDashboard
              parsed={parsed}
              costs={costs}
              recommendations={recommendations}
              optimizations={optimizations}
              onRecalculate={handleRecalculate}
              onBack={() => setStep("review")}
            />

            {/* CSV comparison */}
            <CSVUpload estimate={costs} />

            {/* Capture section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <EmailCapture estimate={costs} />
              <FeedbackBox />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}