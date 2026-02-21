/**
 * POST /api/subscribe
 * Saves email + estimate data for the feedback loop.
 * Storage: Upstash Redis list "subscribers"
 */

import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const SUBSCRIBERS_KEY = "subscribers";

export async function POST(request: Request) {
  try {
    const { email, estimate, reminder_date } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const record = {
      email,
      estimate: estimate || null,
      reminder_date: reminder_date || null,
      created_at: new Date().toISOString(),
    };

    await redis.rpush(SUBSCRIBERS_KEY, JSON.stringify(record));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
