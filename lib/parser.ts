/**
 * Parser — Extracts structured data from a system description.
 * BUSINESS LAYER: One API call to Claude, returns typed object.
 *
 * Input: natural language description of an AI agent system
 * Output: ParsedSystem object with agents, pattern, memory, volume, etc.
 *
 * Consistency strategy:
 * 1. Temperature 0 for minimal randomness
 * 2. Few-shot examples for ambiguous pattern classification
 * 3. Post-validation to catch and correct remaining inconsistencies
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ParsedSystem, ParsedAgent } from "./knowledge-base";

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
- TOOL INFERENCE: Only set has_tools=true and count tools that are EXPLICITLY mentioned for that agent (e.g. "has access to billing API" = 1 tool). Do NOT infer tools that are not described. If an agent "handles FAQs" with no tools mentioned, set has_tools=false, tool_count=0, tools_described=[].
- For daily_conversations default to 100 if not mentioned
- For avg_turns_per_conversation default to 5 if not mentioned
- additional_services covers non-LLM costs: image gen, TTS, STT, video, embeddings

PATTERN CLASSIFICATION — follow these rules exactly:

1. ONE agent, no tools → "single_call"
2. ONE agent with tools → "react_agent"
3. Fixed sequential pipeline where output of step N feeds into step N+1 → "prompt_chain"
4. Classifier/router that PICKS ONE specialist per query → "routing"
5. Multiple agents that COLLABORATE on the SAME task, sharing context → "multi_agent"
6. Independent subtasks running in parallel → "parallel"
7. Generate → evaluate → revise loop → "eval_optimizer"
8. Agent that self-critiques and retries autonomously → "reflexion"

KEY DISTINCTION — routing vs multi_agent:
- ROUTING: A supervisor/classifier receives a query and DISPATCHES it to ONE specialist. The specialist handles it independently. Think "phone tree" — caller gets routed to the right department.
- MULTI_AGENT: An orchestrator coordinates MULTIPLE agents working on the SAME task. Agents may share context, produce partial results that get combined, or iterate together. Think "team project" — everyone contributes to one deliverable.

EXAMPLES:

Input: "Supervisor routes customer queries to billing, technical, or general specialist agents"
Pattern: "routing" (supervisor picks ONE handler per query)

Input: "Coordinator assigns research topics to 3 researchers, then a synthesizer combines their findings into a report"
Pattern: "multi_agent" (multiple agents collaborate to produce one deliverable)

Input: "Classifier flags content as safe/unsafe, unsafe content goes to human review"
Pattern: "single_call" (only one AI agent — the classifier. Human review is not an AI agent)

Input: "Step 1: extract entities, Step 2: enrich with API data, Step 3: generate summary"
Pattern: "prompt_chain" (fixed sequential steps)

Input: "Agent writes code, runs tests, reads errors, fixes code, repeats until tests pass"
Pattern: "reflexion" (autonomous self-critique loop)

Return ONLY the JSON. No markdown, no explanation, no backticks.`;


/**
 * Send the system description to Claude, get back structured data.
 * One API call to Haiku, then post-validate.
 */
export async function parseDescription(
  description: string
): Promise<ParsedSystem | null> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    temperature: 0,
    system: PARSER_PROMPT,
    messages: [
      { role: "user", content: `Parse this AI system description:\n\n${description}` },
    ],
  });

  // Extract text from response
  const raw =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Defensive JSON parsing
  let parsed: ParsedSystem | null = null;
  try {
    parsed = JSON.parse(raw.trim()) as ParsedSystem;
  } catch {
    // Fallback: find first { and last } and try to parse between them
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}") + 1;
    if (start !== -1 && end > start) {
      try {
        parsed = JSON.parse(raw.slice(start, end)) as ParsedSystem;
      } catch {
        console.error("Failed to parse system description:", raw.slice(0, 100));
        return null;
      }
    } else {
      console.error("No JSON found in parser response:", raw.slice(0, 100));
      return null;
    }
  }

  // Post-validate and normalize
  return validateAndNormalize(parsed);
}


/**
 * Post-validation: catch and correct inconsistencies that LLM extraction misses.
 * This is deterministic — same input always produces same output.
 */
function validateAndNormalize(parsed: ParsedSystem): ParsedSystem {
  const agentCount = parsed.agents.length;

  // ── Fix tool consistency ──
  for (const agent of parsed.agents) {
    if (agent.tool_count > 0 && !agent.has_tools) {
      agent.has_tools = true;
    }
    if (agent.has_tools && agent.tool_count === 0) {
      // has_tools is true but tool_count is 0 — assume at least one tool exists
      agent.tool_count = 1;
    }
  }

  // ── Normalize model names ──
  const MODEL_ALIASES: Record<string, string> = {
    "haiku": "claude-haiku-4-5",
    "claude-haiku": "claude-haiku-4-5",
    "claude-3-haiku": "claude-haiku-4-5",
    "claude-3.5-haiku": "claude-haiku-4-5",
    "sonnet": "claude-sonnet-4-5",
    "claude-sonnet": "claude-sonnet-4-5",
    "claude-3-sonnet": "claude-sonnet-4-5",
    "claude-3.5-sonnet": "claude-sonnet-4-5",
    "opus": "claude-opus-4-5",
    "claude-opus": "claude-opus-4-5",
    "claude-3-opus": "claude-opus-4-5",
    "gpt-4": "gpt-4o",
    "gpt4o": "gpt-4o",
    "gpt-4-turbo": "gpt-4o",
    "gpt-3.5-turbo": "gpt-4o-mini",
    "deepseek": "deepseek-v3",
  };

  const VALID_MODELS = new Set([
    "claude-haiku-4-5", "claude-sonnet-4-5", "claude-opus-4-5",
    "gpt-4o", "gpt-4o-mini", "deepseek-v3",
  ]);

  for (const agent of parsed.agents) {
    const lower = agent.model.toLowerCase().trim();
    if (!VALID_MODELS.has(lower)) {
      agent.model = MODEL_ALIASES[lower] || "claude-sonnet-4-5";
    }
  }

  // ── Validate pattern vs agent count ──
  const hasTools = parsed.agents.some((a: ParsedAgent) => a.has_tools);

  if (agentCount === 1) {
    // Single agent — can only be single_call, react_agent, or reflexion
    if (parsed.pattern === "routing" || parsed.pattern === "multi_agent" || parsed.pattern === "parallel") {
      parsed.pattern = hasTools ? "react_agent" : "single_call";
    }
  } else if (agentCount >= 2) {
    // Multiple agents — can't be single_call or react_agent
    if (parsed.pattern === "single_call") {
      parsed.pattern = hasTools ? "routing" : "prompt_chain";
    }
    if (parsed.pattern === "react_agent") {
      parsed.pattern = "routing";
    }
  }

  // ── Validate pattern is a known value ──
  const VALID_PATTERNS = new Set([
    "single_call", "prompt_chain", "routing", "parallel",
    "react_agent", "multi_agent", "eval_optimizer", "reflexion",
  ]);
  if (!VALID_PATTERNS.has(parsed.pattern)) {
    parsed.pattern = agentCount === 1
      ? (hasTools ? "react_agent" : "single_call")
      : "routing";
  }

  // ── Validate memory strategy ──
  const VALID_MEMORY = new Set(["buffer", "summary", "entity", "none"]);
  if (!VALID_MEMORY.has(parsed.memory_strategy)) {
    const turns = parsed.avg_turns_per_conversation || 5;
    if (turns <= 1) parsed.memory_strategy = "none";
    else if (turns <= 15) parsed.memory_strategy = "buffer";
    else if (turns <= 40) parsed.memory_strategy = "entity";
    else parsed.memory_strategy = "summary";
  }

  // ── Ensure reasonable defaults ──
  if (!parsed.daily_conversations || parsed.daily_conversations <= 0) {
    parsed.daily_conversations = 100;
  }
  if (!parsed.avg_turns_per_conversation || parsed.avg_turns_per_conversation <= 0) {
    parsed.avg_turns_per_conversation = 5;
  }

  return parsed;
}
