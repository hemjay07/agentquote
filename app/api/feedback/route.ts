/**
 * POST /api/feedback
 * Saves user feedback from the feedback box on results screen.
 * In v1: writes to local JSON file.
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "feedback.json");

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function readFeedback(): Promise<any[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

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

    await ensureDataDir();
    const feedback = await readFeedback();

    feedback.push({
      feedback_text,
      estimate_id: estimate_id || null,
      created_at: new Date().toISOString(),
    });

    await fs.writeFile(DATA_FILE, JSON.stringify(feedback, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
