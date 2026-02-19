/**
 * GET /api/usage — returns remaining analysis count
 * POST /api/usage — decrements counter (called after parse or recommend)
 *
 * Budget: $5 / ~$0.006 per analysis = ~830 analyses
 * Each analysis = 2 API calls (parse + recommend)
 */

import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "usage.json");
const TOTAL_BUDGET_ANALYSES = 830;

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function readUsage(): Promise<{ used: number }> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { used: 0 };
  }
}

async function writeUsage(usage: { used: number }) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE, JSON.stringify(usage, null, 2));
}

export async function GET() {
  const usage = await readUsage();
  return NextResponse.json({
    used: usage.used,
    remaining: TOTAL_BUDGET_ANALYSES - usage.used,
    total: TOTAL_BUDGET_ANALYSES,
  });
}

export async function POST() {
  const usage = await readUsage();

  if (usage.used >= TOTAL_BUDGET_ANALYSES) {
    return NextResponse.json(
      { error: "Analysis budget exhausted", remaining: 0 },
      { status: 429 }
    );
  }

  usage.used += 1;
  await writeUsage(usage);

  return NextResponse.json({
    used: usage.used,
    remaining: TOTAL_BUDGET_ANALYSES - usage.used,
  });
}
