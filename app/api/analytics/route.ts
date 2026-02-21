/**
 * POST /api/analytics
 * Logs a completed analysis for the data moat.
 * Called once per completed flow (after costs + recommendations are ready).
 *
 * Also handles CSV calibration updates when body contains analysis_id + actual_monthly.
 */

import { NextResponse } from "next/server";
import { logAnalysis, updateAnalysisWithCSV } from "@/lib/analytics";
import type { ParsedSystem, CostEstimate, OptimizationFlags } from "@/lib/knowledge-base";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if this is a CSV update
    if (body.analysis_id && body.actual_monthly !== undefined) {
      await updateAnalysisWithCSV(
        body.analysis_id,
        body.actual_monthly,
        body.diff_pct
      );
      return NextResponse.json({ success: true });
    }

    // Otherwise it's a new analysis log
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

    const id = await logAnalysis({
      input_method,
      raw_description,
      parsed,
      costs,
      optimizations,
      recommendations,
    });

    return NextResponse.json({ success: true, analysis_id: id });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
