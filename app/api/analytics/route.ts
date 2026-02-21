/**
 * POST /api/analytics
 * Logs a completed analysis for the data moat.
 * Also handles CSV calibration updates.
 * Storage: Upstash Redis — key per analysis + list index
 */

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { ParsedSystem, CostEstimate, OptimizationFlags } from "@/lib/knowledge-base";

const redis = Redis.fromEnv();
const ANALYSES_LIST_KEY = "analyses:list";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // CSV calibration update
    if (body.analysis_id && body.actual_monthly !== undefined) {
      const existing = await redis.get<string>(`analysis:${body.analysis_id}`);
      if (existing) {
        const record = typeof existing === "string" ? JSON.parse(existing) : existing;
        record.csv_actual_monthly = body.actual_monthly;
        record.csv_diff_pct = body.diff_pct;
        await redis.set(`analysis:${body.analysis_id}`, JSON.stringify(record));
      }
      return NextResponse.json({ success: true });
    }

    // New analysis log
    const {
      input_method,
      raw_description,
      parsed,
      costs,
      optimizations,
      recommendations,
    }: {
      input_method: "text" | "guided" | "prompt";
      raw_description: string | null;
      parsed: ParsedSystem;
      costs: CostEstimate;
      optimizations: OptimizationFlags;
      recommendations: string;
    } = body;

    if (!parsed || !costs || !recommendations) {
      return NextResponse.json(
        { error: "parsed, costs, and recommendations are required" },
        { status: 400 }
      );
    }

    // Count warnings
    const warningsMatch = recommendations.match(/=== WARNINGS ===([\s\S]*?)(?====[^=]|$)/);
    const warningsText = warningsMatch ? warningsMatch[1].trim() : "";
    const warningsCount = warningsText
      ? warningsText.split(/\n/).filter((line: string) => line.trim().length > 10).length
      : 0;

    const id = generateId();

    const record = {
      id,
      timestamp: new Date().toISOString(),
      input_method,
      raw_description,

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

      cost_low: costs.low.monthly_cost,
      cost_mid: costs.mid.monthly_cost,
      cost_high: costs.high.monthly_cost,
      primary_model: costs.mid.primary_model,
      caching_applicable: costs.mid.caching_applicable,

      optimizations,
      recommendations_text: recommendations,
      warnings_count: warningsCount,

      csv_actual_monthly: null,
      csv_diff_pct: null,
    };

    await redis.set(`analysis:${id}`, JSON.stringify(record));
    await redis.rpush(ANALYSES_LIST_KEY, id);

    return NextResponse.json({ success: true, analysis_id: id });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
