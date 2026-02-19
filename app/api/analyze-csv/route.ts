/**
 * POST /api/analyze-csv
 * Parses an Anthropic/OpenAI usage CSV and compares to the estimate.
 * Pure parsing — zero API calls, FREE.
 */

import { NextResponse } from "next/server";
import { analyzeCSV } from "@/lib/csv-analyzer";
import type { CostEstimate } from "@/lib/knowledge-base";

export async function POST(request: Request) {
  try {
    const { csv, estimate }: { csv: string; estimate?: CostEstimate } =
      await request.json();

    if (!csv || typeof csv !== "string") {
      return NextResponse.json(
        { error: "csv string is required" },
        { status: 400 }
      );
    }

    const analysis = analyzeCSV(csv, estimate);

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error("CSV analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze CSV" },
      { status: 422 }
    );
  }
}
