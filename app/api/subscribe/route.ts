/**
 * POST /api/subscribe
 * Saves email + estimate data for the feedback loop.
 * In v1: writes to a local JSON file. In production: Vercel KV or database.
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "subscribers.json");

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function readSubscribers(): Promise<any[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const { email, estimate, reminder_date } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "email is required" },
        { status: 400 }
      );
    }

    await ensureDataDir();
    const subscribers = await readSubscribers();

    subscribers.push({
      email,
      estimate: estimate || null,
      reminder_date: reminder_date || null,
      created_at: new Date().toISOString(),
    });

    await fs.writeFile(DATA_FILE, JSON.stringify(subscribers, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
