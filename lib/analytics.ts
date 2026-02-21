/**
 * Analytics — Data moat read utilities.
 * BUSINESS LAYER: Read helpers for analytics data.
 *
 * Write operations happen in app/api/analytics/route.ts.
 * This file provides read utilities for future dashboards and exports.
 */

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const ANALYSES_LIST_KEY = "analyses:list";

export interface AnalysisRecord {
  id: string;
  timestamp: string;
  input_method: "text" | "guided" | "prompt";
  raw_description: string | null;
  system_name: string;
  pattern: string;
  memory_strategy: string;
  agent_count: number;
  agents: { model: string; has_tools: boolean; tool_count: number }[];
  has_rag: boolean;
  daily_conversations: number;
  avg_turns: number;
  guardrails_mentioned: string[];
  cost_low: number;
  cost_mid: number;
  cost_high: number;
  primary_model: string;
  caching_applicable: boolean;
  optimizations: Record<string, boolean>;
  recommendations_text: string;
  warnings_count: number;
  csv_actual_monthly: number | null;
  csv_diff_pct: number | null;
}

/**
 * Get total analysis count.
 */
export async function getAnalysisCount(): Promise<number> {
  return await redis.llen(ANALYSES_LIST_KEY);
}

/**
 * Get recent analyses (for future admin dashboard).
 */
export async function getRecentAnalyses(limit: number = 20): Promise<AnalysisRecord[]> {
  const ids = await redis.lrange(ANALYSES_LIST_KEY, -limit, -1);
  const records: AnalysisRecord[] = [];
  for (const id of ids) {
    const data = await redis.get<string>(`analysis:${id}`);
    if (data) {
      records.push(typeof data === "string" ? JSON.parse(data) : data);
    }
  }
  return records.reverse();
}
