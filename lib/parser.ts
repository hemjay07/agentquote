/**
 * Parser — Extracts structured data from a system description.
 * BUSINESS LAYER: One API call to Claude, returns typed object.
 *
 * Input: natural language description of an AI agent system
 * Output: ParsedSystem object with agents, pattern, memory, volume, etc.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ParsedSystem } from "./knowledge-base";

const PARSER_PROMPT = `You are an AI system architecture parser.
Extract structured information from a natural language description of an AI agent system.

Return ONLY valid JSON with this exact structure:
{
    "system_name": "short name for the system",
    "agents": [
        {
            "name": "agent name",
            "role": "what it does",
            "model": "model key — one of: claude-haiku-4-5, claude-sonnet-4-5, claude-opus-4-5, gpt-4o, gpt-4o-mini, deepseek-v3",
            "has_tools": true or false,
            "tool_count": number of tools (0 if no tools),
            "tools_described": ["list of tool names mentioned"]
        }
    ],
    "pattern": "one of: single_call, prompt_chain, routing, parallel, react_agent, multi_agent, eval_optimizer, reflexion",
    "memory_strategy": "one of: buffer, summary, entity, none",
    "avg_turns_per_conversation": number,
    "daily_conversations": number,
    "has_rag": true or false,
    "rag_details": "description of RAG setup if mentioned, else null",
    "guardrails_mentioned": ["list of any guardrails mentioned"],
    "additional_services": [
        {"name": "service name", "unit": "per image/per minute/etc", "estimated_daily_volume": number}
    ]
}

RULES:
- If the user doesn't specify a model, default to "claude-sonnet-4-5"
- If memory strategy isn't mentioned, infer from conversation length:
  exactly 1 turn: "none", 2-15 turns: "buffer", 16-40 turns: "entity", 40+ turns: "summary"
- If pattern isn't explicitly stated, infer from the description:
  One agent no tools: "single_call", one agent with tools: "react_agent",
  multiple agents with coordinator: "multi_agent", generate+review loop: "eval_optimizer"
- For daily_conversations default to 100 if not mentioned
- For avg_turns_per_conversation default to 5 if not mentioned
- additional_services covers non-LLM costs: image gen, TTS, STT, video, embeddings

Return ONLY the JSON. No markdown, no explanation, no backticks.`;


/**
 * Send the system description to Claude, get back structured data.
 * One API call to Haiku.
 */
export async function parseDescription(
  description: string
): Promise<ParsedSystem | null> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: PARSER_PROMPT,
    messages: [
      { role: "user", content: `Parse this AI system description:\n\n${description}` },
    ],
  });

  // Extract text from response
  const raw =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Defensive JSON parsing (same approach as Day 5 EntityMemory)
  try {
    return JSON.parse(raw.trim()) as ParsedSystem;
  } catch {
    // Fallback: find first { and last } and try to parse between them
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}") + 1;
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end)) as ParsedSystem;
      } catch {
        console.error("Failed to parse system description:", raw.slice(0, 100));
        return null;
      }
    }
    console.error("No JSON found in parser response:", raw.slice(0, 100));
    return null;
  }
}
