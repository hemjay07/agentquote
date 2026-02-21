/**
 * POST /api/feedback
 * Saves user feedback from the feedback box on results screen.
 * Storage: Upstash Redis list "feedback"
 */

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const FEEDBACK_KEY = "feedback";

export async function POST(request: Request) {
  try {
    const { feedback_text, estimate_id } = await request.json();

    if (!feedback_text || typeof feedback_text !== "string") {
      return NextResponse.json(
        { error: "feedback_text is required" },
        { status: 400 }
      );
    }

    if (feedback_text.length > 5000) {
      return NextResponse.json(
        { error: "Feedback too long (max 5,000 characters)" },
        { status: 400 }
      );
    }

    const record = {
      feedback_text,
      estimate_id: estimate_id || null,
      created_at: new Date().toISOString(),
    };

    await redis.rpush(FEEDBACK_KEY, JSON.stringify(record));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
