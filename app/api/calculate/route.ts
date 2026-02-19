/**
 * POST /api/calculate
 * Pure deterministic math. Zero API calls. FREE.
 * Used for recalculation after user corrects assumptions.
 */

import { NextResponse } from "next/server";
import { calculateCosts } from "@/lib/calculator";
import type { ParsedSystem, OptimizationFlags, NonLLMService } from "@/lib/knowledge-base";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed: ParsedSystem = body.parsed;
    const optimizations: OptimizationFlags | undefined = body.optimizations;
    const customModels: Record<string, { input: number; output: number }> | undefined = body.customModels;
    const nonLLMServices: NonLLMService[] | undefined = body.nonLLMServices;

    if (!parsed || !parsed.agents) {
      return NextResponse.json(
        { error: "parsed system data is required" },
        { status: 400 }
      );
    }

    const costs = calculateCosts(parsed, optimizations, customModels, nonLLMServices);

    return NextResponse.json({ costs });
  } catch (error) {
    console.error("Calculate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
