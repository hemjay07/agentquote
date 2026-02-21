/**
 * POST /api/recommend
 * Calls Claude Haiku to generate optimization recommendations.
 * Costs ~$0.003 per call.
 */

import { NextResponse } from "next/server";
import { generateRecommendations } from "@/lib/recommender";
import type { ParsedSystem, CostEstimate, OptimizationFlags } from "@/lib/knowledge-base";

export async function POST(request: Request) {
  try {
    const { parsed, costs, optimizations }: { parsed: ParsedSystem; costs: CostEstimate; optimizations?: OptimizationFlags } =
      await request.json();

    if (!parsed || !costs) {
      return NextResponse.json(
        { error: "parsed and costs are required" },
        { status: 400 }
      );
    }

    const recommendations = await generateRecommendations(parsed, costs, optimizations);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
