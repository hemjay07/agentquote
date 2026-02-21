/**
 * CSV Analyzer — Parses usage data and compares to our estimate.
 * BUSINESS LAYER: Pure parsing + comparison, zero API calls.
 *
 * Handles Anthropic and OpenAI usage export formats.
 * Returns actual costs and a comparison against the estimate.
 */

import type { CostEstimate } from "./knowledge-base";

export interface CSVAnalysisResult {
  provider: "anthropic" | "openai" | "unknown";
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

/**
 * Parse a CSV string from a usage export and analyze costs.
 */
export function analyzeCSV(
  csvText: string,
  estimate?: CostEstimate
): CSVAnalysisResult {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV must have at least a header and one data row");
  }

  const header = lines[0].toLowerCase();

  // Detect provider from header columns
  let provider: "anthropic" | "openai" | "unknown" = "unknown";
  if (header.includes("model") && header.includes("input_tokens")) {
    provider = "anthropic";
  } else if (header.includes("model") && header.includes("prompt_tokens")) {
    provider = "openai";
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });

  let totalCost = 0;
  let totalInput = 0;
  let totalOutput = 0;
  const modelBreakdown: Record<string, { cost: number; calls: number }> = {};
  const dates: string[] = [];

  for (const row of rows) {
    // Extract cost
    const cost = parseFloat(row["cost"] || row["total_cost"] || row["usd"] || "0");
    totalCost += cost;

    // Extract tokens
    const input = parseInt(
      row["input_tokens"] || row["prompt_tokens"] || "0",
      10
    );
    const output = parseInt(
      row["output_tokens"] || row["completion_tokens"] || "0",
      10
    );
    totalInput += input;
    totalOutput += output;

    // Model breakdown
    const model = row["model"] || "unknown";
    if (!modelBreakdown[model]) {
      modelBreakdown[model] = { cost: 0, calls: 0 };
    }
    modelBreakdown[model].cost += cost;
    modelBreakdown[model].calls += 1;

    // Date tracking
    const date = row["date"] || row["timestamp"] || row["created_at"] || "";
    if (date) dates.push(date);
  }

  // Calculate date range and daily average
  const sortedDates = dates.sort();
  const startDate = sortedDates[0] || "unknown";
  const endDate = sortedDates[sortedDates.length - 1] || "unknown";

  let daySpan = 1;
  if (startDate !== "unknown" && endDate !== "unknown") {
    const diff =
      new Date(endDate).getTime() - new Date(startDate).getTime();
    daySpan = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const dailyAverage = totalCost / daySpan;

  // Comparison with estimate
  let comparison = null;
  if (estimate) {
    const actualMonthly = dailyAverage * 30;
    const estimateMonthly = estimate.mid.monthly_cost;
    const diffPct = actualMonthly > 0
      ? ((estimateMonthly - actualMonthly) / actualMonthly) * 100
      : 0;

    let verdict: string;
    if (Math.abs(diffPct) < 15) {
      verdict = "Our estimate was within 15% of your actual costs. Solid accuracy.";
    } else if (diffPct > 0) {
      verdict = `Our estimate was ${Math.abs(diffPct).toFixed(0)}% higher than actual. We were conservative — your system is more efficient than expected.`;
    } else {
      verdict = `Our estimate was ${Math.abs(diffPct).toFixed(0)}% lower than actual. Your system costs more than modeled — check for hidden overhead like retries or context bloat.`;
    }

    comparison = {
      estimate_monthly: estimateMonthly,
      actual_monthly: Number(actualMonthly.toFixed(2)),
      difference_pct: Number(diffPct.toFixed(1)),
      verdict,
    };
  }

  return {
    provider,
    total_cost: Number(totalCost.toFixed(2)),
    total_input_tokens: totalInput,
    total_output_tokens: totalOutput,
    model_breakdown: modelBreakdown,
    daily_average: Number(dailyAverage.toFixed(2)),
    date_range: { start: startDate, end: endDate },
    comparison,
  };
}
