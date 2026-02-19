"use client";

import { useState } from "react";
import type { CostEstimate } from "@/lib/knowledge-base";

interface CSVUploadProps {
  estimate: CostEstimate;
}

interface Analysis {
  provider: string;
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  model_breakdown: Record<string, { cost: number; calls: number }>;
  daily_average: number;
  date_range: { start: string; end: string };
  comparison: {
    estimate_monthly: number;
    actual_monthly: number;
    difference_pct: number;
    verdict: string;
  } | null;
}

export default function CSVUpload({ estimate }: CSVUploadProps) {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();

      const res = await fetch("/api/analyze-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text, estimate }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze CSV");
      }

      const { analysis: data } = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        setError("Clipboard is empty");
        return;
      }

      setLoading(true);
      setError(null);

      const res = await fetch("/api/analyze-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: text, estimate }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to analyze CSV");
      }

      const { analysis: data } = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!expanded && !analysis) {
    return (
      <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border)] rounded-md p-4 mt-6">
        <button
          onClick={() => setExpanded(true)}
          className="w-full text-left"
        >
          <h3 className="text-sm font-medium text-[var(--text-primary)]">
            📊 Have real usage data? Compare with this estimate
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Upload your Anthropic or OpenAI usage CSV to see how accurate our
            estimate is.
          </p>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-md p-4 mt-6">
      <h3 className="text-xs text-[var(--text-secondary)] uppercase tracking-wide mb-3">
        Compare with Real Costs
      </h3>

      {!analysis && (
        <div>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            Upload your usage export CSV from Anthropic Console or OpenAI Usage
            page. We&apos;ll parse it and compare against our estimate. Your
            data stays in your browser.
          </p>

          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <div className="border border-dashed border-[var(--border)] rounded-md p-4 text-center hover:border-[var(--accent)] transition-colors">
                <p className="text-sm text-[var(--text-primary)]">
                  Upload CSV
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  .csv file from your provider
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              onClick={handlePaste}
              className="flex-1 border border-dashed border-[var(--border)] rounded-md p-4 text-center hover:border-[var(--accent)] transition-colors"
            >
              <p className="text-sm text-[var(--text-primary)]">
                Paste from Clipboard
              </p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Copy CSV data and paste here
              </p>
            </button>
          </div>

          {loading && (
            <p className="text-xs text-[var(--text-secondary)] mt-3 animate-pulse">
              Analyzing your usage data...
            </p>
          )}
          {error && (
            <p className="text-xs text-red-400 mt-3">{error}</p>
          )}
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          {/* Comparison headline */}
          {analysis.comparison && (
            <div
              className={`rounded-md p-4 ${
                Math.abs(analysis.comparison.difference_pct) < 15
                  ? "bg-green-900/20 border border-green-800/30"
                  : analysis.comparison.difference_pct > 0
                  ? "bg-yellow-900/20 border border-yellow-800/30"
                  : "bg-red-900/20 border border-red-800/30"
              }`}
            >
              <div className="grid grid-cols-3 gap-4 text-center mb-3">
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Our Estimate
                  </p>
                  <p className="text-lg font-bold">
                    ${analysis.comparison.estimate_monthly.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">/month</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">vs</p>
                  <p
                    className={`text-lg font-bold ${
                      Math.abs(analysis.comparison.difference_pct) < 15
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {analysis.comparison.difference_pct > 0 ? "+" : ""}
                    {analysis.comparison.difference_pct}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Your Actual
                  </p>
                  <p className="text-lg font-bold">
                    ${analysis.comparison.actual_monthly.toLocaleString()}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">/month</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {analysis.comparison.verdict}
              </p>
            </div>
          )}

          {/* Usage breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Provider</p>
              <p className="text-sm font-medium mt-1">{analysis.provider}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Total Cost</p>
              <p className="text-sm font-medium mt-1">
                ${analysis.total_cost.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Daily Avg</p>
              <p className="text-sm font-medium mt-1">
                ${analysis.daily_average.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-secondary)]">Date Range</p>
              <p className="text-sm font-medium mt-1">
                {analysis.date_range.start.slice(0, 10)} →{" "}
                {analysis.date_range.end.slice(0, 10)}
              </p>
            </div>
          </div>

          {/* Model breakdown */}
          {Object.keys(analysis.model_breakdown).length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Cost by Model
              </p>
              <div className="space-y-1">
                {Object.entries(analysis.model_breakdown)
                  .sort(([, a], [, b]) => b.cost - a.cost)
                  .map(([model, data]) => (
                    <div
                      key={model}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-[var(--text-secondary)]">
                        {model}
                      </span>
                      <span>
                        ${data.cost.toFixed(2)} ({data.calls} calls)
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Reset */}
          <button
            onClick={() => {
              setAnalysis(null);
              setExpanded(true);
            }}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            ← Upload different data
          </button>
        </div>
      )}
    </div>
  );
}