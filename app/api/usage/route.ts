/**
 * GET /api/usage — returns remaining analysis count
 * POST /api/usage — increments counter (called after parse or recommend)
 *
 * Budget: $5 / ~$0.006 per analysis = ~830 analyses
 * Storage: Upstash Redis key "usage:count"
 */

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const TOTAL_BUDGET_ANALYSES = 830;
const USAGE_KEY = "usage:count";

export async function GET() {
  const used = (await redis.get<number>(USAGE_KEY)) || 0;
  return NextResponse.json({
    used,
    remaining: TOTAL_BUDGET_ANALYSES - used,
    total: TOTAL_BUDGET_ANALYSES,
  });
}

export async function POST() {
  const used = (await redis.get<number>(USAGE_KEY)) || 0;

  if (used >= TOTAL_BUDGET_ANALYSES) {
    return NextResponse.json(
      { error: "Analysis budget exhausted", remaining: 0 },
      { status: 429 }
    );
  }

  const newUsed = await redis.incr(USAGE_KEY);

  return NextResponse.json({
    used: newUsed,
    remaining: TOTAL_BUDGET_ANALYSES - newUsed,
  });
}
