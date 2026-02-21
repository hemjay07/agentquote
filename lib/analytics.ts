/**
 * Analytics — Logs every completed analysis for the data moat.
 * BUSINESS LAYER: Pure data logging, zero API calls.
 *
 * Every completed analysis (parse -> calculate -> recommend) produces
 * one record capturing the full picture: what was built, what it costs,
 * what optimizations were suggested, and (if CSV uploaded) how accurate we were.
 *
 * This data becomes AgentQuote's defensible advantage:
 * - How agencies actually architect AI systems
 * - Which patterns and models are most common
 * - Where our estimates are accurate vs off
 * - Which optimizations are most frequently needed
 */

import { promises as fs } from "fs";
import path from "path";
import type {
  ParsedSystem,
  CostEstimate,
  OptimizationFlags,
} from "./knowledge-base";

const DATA_FILE = path.join(process.cwd(), "data", "analyses.json");

export interface AnalysisRecord {
  id: string;
  timestamp: string;

  // How the user provided input
  input_method: "text" | "guided" | "prompt";

  // Raw input (sensitive — anonymize before any public use)
  raw_description: string | null;

  // Architecture data (THE MOAT)
  system_name: string;
  pattern: string;
  memory_strategy: string;
  agent_count: number;
  agents: {
    model: string;
    has_tools: boolean;
    tool_count: number;
  }[];
  has_rag: boolean;
  daily_conversations: number;
  avg_turns: number;
  guardrails_mentioned: string[];

  // Cost results
  cost_low: number;
  cost_mid: number;
  cost_high: number;
  primary_model: string;
  caching_applicable: boolean;

  // Optimization state (what the user already has)
  optimizations: OptimizationFlags;

  // Claude's analysis (non-reproducible, valuable for mining)
  recommendations_text: string;
  warnings_count: number;

  // Accuracy calibration (only if CSV uploaded later)
  csv_actual_monthly: number | null;
  csv_diff_pct: number | null;
}

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function readAnalyses(): Promise<AnalysisRecord[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Log a completed analysis. Called once after step 3 (costs + recommendations ready).
 * Returns the generated analysis ID.
 */
export async function logAnalysis(params: {
  input_method: "text" | "guided" | "prompt";
  raw_description: string | null;
  parsed: ParsedSystem;
  costs: CostEstimate;
  optimizations: OptimizationFlags;
  recommendations: string;
}): Promise<string> {
  const { input_method, raw_description, parsed, costs, optimizations, recommendations } = params;

  // Count warnings from recommendations text
  const warningsMatch = recommendations.match(/=== WARNINGS ===([\s\S]*?)(?====[^=]|$)/);
  const warningsText = warningsMatch ? warningsMatch[1].trim() : "";
  // Count by numbered items, emoji prefixes, or line breaks with content
  const warningsCount = warningsText
    ? warningsText.split(/\n/).filter(line => line.trim().length > 10).length
    : 0;

  const id = generateId();

  const record: AnalysisRecord = {
    id,
    timestamp: new Date().toISOString(),

    input_method,
    raw_description,

    // Architecture — strip agent names/roles for privacy, keep structure
    system_name: parsed.system_name,
    pattern: parsed.pattern,
    memory_strategy: parsed.memory_strategy,
    agent_count: parsed.agents.length,
    agents: parsed.agents.map(a => ({
      model: a.model,
      has_tools: a.has_tools,
      tool_count: a.tool_count,
    })),
    has_rag: parsed.has_rag,
    daily_conversations: parsed.daily_conversations,
    avg_turns: parsed.avg_turns_per_conversation,
    guardrails_mentioned: parsed.guardrails_mentioned || [],

    // Costs
    cost_low: costs.low.monthly_cost,
    cost_mid: costs.mid.monthly_cost,
    cost_high: costs.high.monthly_cost,
    primary_model: costs.mid.primary_model,
    caching_applicable: costs.mid.caching_applicable,

    // Optimizations
    optimizations,

    // Claude's analysis
    recommendations_text: recommendations,
    warnings_count: warningsCount,

    // CSV calibration — null until user uploads
    csv_actual_monthly: null,
    csv_diff_pct: null,
  };

  await ensureDataDir();
  const analyses = await readAnalyses();
  analyses.push(record);
  await fs.writeFile(DATA_FILE, JSON.stringify(analyses, null, 2));

  return id;
}

/**
 * Update an analysis with CSV calibration data.
 * Called when user uploads actual usage CSV on the results page.
 */
export async function updateAnalysisWithCSV(
  analysisId: string,
  actualMonthly: number,
  diffPct: number
): Promise<void> {
  const analyses = await readAnalyses();
  const record = analyses.find(a => a.id === analysisId);
  if (record) {
    record.csv_actual_monthly = actualMonthly;
    record.csv_diff_pct = diffPct;
    await fs.writeFile(DATA_FILE, JSON.stringify(analyses, null, 2));
  }
}

/**
 * Simple ID generator — 8 char hex string.
 * Good enough for local storage. Replace with uuid when moving to a database.
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
