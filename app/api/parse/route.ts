/**
 * POST /api/parse
 * Calls Claude Haiku to parse a system description into structured data.
 * Costs ~$0.003 per call. Decrements usage counter.
 */

import { NextResponse } from "next/server";
import { parseDescription } from "@/lib/parser";

export async function POST(request: Request) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "description is required" },
        { status: 400 }
      );
    }

    if (description.length > 10000) {
      return NextResponse.json(
        { error: "Description too long (max 10,000 characters)" },
        { status: 400 }
      );
    }

    const parsed = await parseDescription(description);

    if (!parsed) {
      return NextResponse.json(
        { error: "Failed to parse system description" },
        { status: 422 }
      );
    }

    return NextResponse.json({ parsed });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
