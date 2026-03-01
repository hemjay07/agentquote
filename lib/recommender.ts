/**
 * Recommender — Generates optimization suggestions.
 * BUSINESS LAYER: One API call to Claude.
 *
 * Input: parsed structure + calculated costs
 * Output: cost summary + ranked optimizations + warnings
 *
 * Adapts output based on system_stage:
 * - "existing": optimize what you have (current behavior)
 * - "planning": how to build it right from the start
 */

import Anthropic from "@anthropic-ai/sdk";
import { MODEL_PRICING, type ParsedSystem, type CostEstimate, type OptimizationFlags } from "./knowledge-base";

/**
 * Claude analyzes the system + costs and generates recommendations.
 * One API call to Haiku.
 */
export async function generateRecommendations(
  parsed: ParsedSystem,
  costs: CostEstimate,
  optimizations?: OptimizationFlags
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const isPlanning = parsed.system_stage === "planning";
  const prompt = isPlanning
    ? buildPlanningPrompt(parsed, costs)
    : buildExistingPrompt(parsed, costs, optimizations);

  const systemMsg = isPlanning
    ? "You are a senior AI systems architect helping someone design a new system from scratch. Be specific to their described use case — reference their agent concepts, models, and numbers. Cite specific dollar amounts and percentages. Follow the output format EXACTLY as specified. Do NOT use emojis anywhere in your response."
    : "You are a senior AI systems architect specializing in cost optimization. Be specific to the user's actual system — reference their agent names, model choices, and numbers. Cite specific dollar amounts and percentages. Follow the output format EXACTLY as specified. Do NOT use emojis anywhere in your response.";

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: systemMsg,
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}


/**
 * Prompt for users with an existing system — optimize what you have.
 */
function buildExistingPrompt(
  parsed: ParsedSystem,
  costs: CostEstimate,
  optimizations?: OptimizationFlags
): string {
  // Build optimization state awareness block
  const enabledOpts: string[] = [];
  const disabledOpts: string[] = [];
  if (optimizations) {
    if (optimizations.caching_enabled) enabledOpts.push("Prompt caching");
    else disabledOpts.push("Prompt caching (90% savings on cached reads)");
    if (optimizations.batch_processing) enabledOpts.push("Batch processing (50% off)");
    else disabledOpts.push("Batch processing (50% off)");
    if (optimizations.loop_detection) enabledOpts.push("Loop/failure detection");
    else disabledOpts.push("Loop/failure detection (saved 49% in tests)");
    if (optimizations.tool_specific_routing) enabledOpts.push("Tool-specific routing");
    else disabledOpts.push("Tool-specific routing (saves ~500 tokens/call)");
  }

  const optStateBlock = optimizations
    ? `\nCURRENT OPTIMIZATION STATE:
${enabledOpts.length > 0 ? `Already enabled: ${enabledOpts.join(", ")}` : "No optimizations enabled yet."}
${disabledOpts.length > 0 ? `Not yet enabled: ${disabledOpts.join(", ")}` : "All optimizations enabled."}
Focus your ARCHITECTURE REVIEW on this system's specific design choices. In ADDITIONAL OPTIMIZATIONS, only recommend optimizations that are NOT already enabled.\n`
    : "";

  return `You are an AI systems cost optimization expert. Analyze this specific system and provide a personalized review.

MODEL PRICING (per 1M tokens — use ONLY these prices, do NOT use any other pricing):
${Object.entries(MODEL_PRICING).map(([k, v]) => `- ${v.label} (${k}): $${v.input}/M input, $${v.output}/M output`).join("\n")}

SYSTEM ARCHITECTURE (parsed):
${JSON.stringify(parsed, null, 2)}

COST ESTIMATES (calculated):
${JSON.stringify(costs, null, 2)}
${optStateBlock}
IMPORTANT: Calculate ALL estimated savings against the MID scenario only ($${costs.mid.monthly_cost}/mo). Never calculate savings based on the high scenario.

Rank your findings by cost impact, largest savings first. Pattern simplification (up to 4.8x) typically dwarfs model routing (3-15x per agent) which dwarfs memory optimization (up to 55% input savings). Lead with the biggest lever.

You MUST respond in EXACTLY this format. Do NOT deviate. Do NOT use emojis. Do NOT add extra sections.

=== COST SUMMARY ===
| Scenario | Monthly Cost | Daily Cost | Cost/Conversation |
|----------|-------------|-----------|-------------------|
| Low | $X | $X | $X |
| Mid | $X | $X | $X |
| High | $X | $X | $X |

BIGGEST COST DRIVER: [agent name] ([percentage]% of total cost)
- [reason 1]
- [reason 2]

=== ARCHITECTURE REVIEW ===
Analyze this SPECIFIC system's architecture choices. What is costing the most and why?

1. [Finding about their specific architecture]
What we found: [analysis specific to THIS system's pattern/models/agents]
Impact: [dollar amount or percentage of total cost]
Recommendation: [specific action to take]

2. [Next finding]
What we found: [specific analysis]
Impact: [dollar amount or percentage]
Recommendation: [specific action]

(List 2-4 findings. Focus on: pattern efficiency, model choices, agent count, memory strategy, tool overhead. Be specific to THIS system — reference their actual agent names, models, and numbers.)

=== ADDITIONAL OPTIMIZATIONS ===
1. [Short title of optimization]
What to change: [specific description]
Estimated savings: [dollar amount]/mo or [percentage]%
Quality impact: [none|minor|moderate|significant]
Implementation difficulty: [easy|moderate|hard]

2. [Next optimization]
What to change: [specific description]
Estimated savings: [dollar amount]/mo or [percentage]%
Quality impact: [none|minor|moderate|significant]
Implementation difficulty: [easy|moderate|hard]

(List 2-4 optimizations ranked by savings. Only recommend optimizations the user has NOT already enabled. Use the exact field labels above.)

Base recommendations on these PROVEN findings:
- Pattern simplification: could a simpler pattern work? (multi-agent to single agent saved 4.8x in our tests)
- Model routing: which agents can use cheaper models? (Haiku for classification/simple judgment saves 3-15x)
- Memory strategy: is the current strategy optimal for the conversation length? (entity memory saved 55% of input tokens vs buffer in our tests)
- Caching: is the system prompt + tool definitions large enough to cache? (minimum 1,024 tokens required, 90% savings on reads)
- Fuzzy loop detection: recommend max failure thresholds per tool (saved 49% in our tests)
- Context truncation: does every agent need full context?
- Budget caps WITH fallback: budget cap alone cut costs 42% but gave garbage output — needs fallback
- Separate call functions: agents without tools should NOT receive tool definitions (saves ~500 tokens per call)

=== WARNINGS ===
1. [Warning title]
- [detail line]
- [detail line]
- ACTION: [specific action to take]

2. [Warning title]
- [detail line]
- ACTION: [specific action to take]

(Use numbered list. Flag these red flags if applicable:)
- 200K context trap risk (if input might exceed 200K tokens, ALL pricing doubles)
- Missing guardrails (no max iterations, no cost budgets)
- Tool agents without failure handling
- Multi-agent for tasks a single agent could handle (4.8x overhead)`;
}


/**
 * Prompt for users who are PLANNING a system — help them build it right.
 */
function buildPlanningPrompt(
  parsed: ParsedSystem,
  costs: CostEstimate
): string {
  return `You are an AI systems architect helping someone DESIGN a new system. They haven't built this yet — they're planning. Your job is to help them build it cost-efficiently from the start, not optimize an existing system.

MODEL PRICING (per 1M tokens — use ONLY these prices, do NOT use any other pricing):
${Object.entries(MODEL_PRICING).map(([k, v]) => `- ${v.label} (${k}): $${v.input}/M input, $${v.output}/M output`).join("\n")}

WHAT THEY WANT TO BUILD (parsed from their description):
${JSON.stringify(parsed, null, 2)}

PROJECTED COSTS (if built as described):
${JSON.stringify(costs, null, 2)}

IMPORTANT: Calculate ALL estimated savings against the MID scenario only ($${costs.mid.monthly_cost}/mo). Never calculate savings based on the high scenario.

Rank your findings by cost impact, largest savings first. The user hasn't built anything yet, so every recommendation is about how to START RIGHT rather than how to fix something.

You MUST respond in EXACTLY this format. Do NOT deviate. Do NOT use emojis. Do NOT add extra sections.

=== COST SUMMARY ===
| Scenario | Monthly Cost | Daily Cost | Cost/Conversation |
|----------|-------------|-----------|-------------------|
| Low | $X | $X | $X |
| Mid | $X | $X | $X |
| High | $X | $X | $X |

BIGGEST COST DRIVER: [agent/component name] ([percentage]% of projected cost)
- [reason 1]
- [reason 2]

=== RECOMMENDED ARCHITECTURE ===
Based on what you want to build, here is how we would architect it for cost efficiency from day one.

1. [Architecture recommendation]
What we recommend: [specific architecture advice — e.g. "Start with 2 agents instead of 4", "Use Haiku for the classifier agent"]
Why: [explanation grounded in real data]
Projected savings: [dollar amount or percentage vs the naive approach above]

2. [Next recommendation]
What we recommend: [specific advice]
Why: [explanation]
Projected savings: [dollar amount or percentage]

(List 2-4 recommendations. Focus on: optimal agent count, right model per agent, best pattern choice, memory strategy selection. Be specific to THEIR use case — reference their described functionality, not generic advice.)

=== BUILD-RIGHT-FIRST TIPS ===
1. [Short title]
What to do: [specific implementation guidance for building this from scratch]
Estimated savings: [dollar amount]/mo or [percentage]%
Quality impact: [none|minor|moderate|significant]
Implementation difficulty: [easy|moderate|hard]

2. [Next tip]
What to do: [specific guidance]
Estimated savings: [dollar amount]/mo or [percentage]%
Quality impact: [none|minor|moderate|significant]
Implementation difficulty: [easy|moderate|hard]

(List 2-4 tips ranked by savings. Use the exact field labels above.)

Base recommendations on these PROVEN findings:
- Pattern simplification: does this need multiple agents? (multi-agent to single agent saved 4.8x in our tests)
- Model routing: which agents can use cheaper models? (Haiku for classification/simple judgment saves 3-15x)
- Memory strategy: what's optimal for the expected conversation length? (entity memory saved 55% of input tokens vs buffer in our tests)
- Caching: enable prompt caching from day one if system prompt + tool definitions exceed 1,024 tokens (90% savings on reads)
- Fuzzy loop detection: build in max failure thresholds per tool from the start (saved 49% in our tests)
- Context truncation: design agent handoffs to pass only essential fields, not full context
- Separate call functions: agents without tools should NOT receive tool definitions (saves ~500 tokens per call)

=== PLANNING PITFALLS ===
1. [Pitfall title]
- [detail line explaining the risk]
- [detail line with data]
- AVOID BY: [specific preventive action to take when building]

2. [Pitfall title]
- [detail line]
- AVOID BY: [specific preventive action]

(Use numbered list. Flag these common mistakes:)
- Over-engineering with too many agents when fewer would work (4.8x overhead measured)
- Using expensive models for simple tasks (Sonnet for classification when Haiku suffices)
- Missing guardrails from the start (no max iterations, no cost budgets — add these on day one)
- Not enabling prompt caching at launch (leaving 90% savings on the table)
- 200K context trap risk (if input might exceed 200K tokens, ALL pricing doubles)`;
}
