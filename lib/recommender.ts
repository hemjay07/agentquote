/**
 * Recommender — Generates optimization suggestions.
 * BUSINESS LAYER: One API call to Claude.
 *
 * Input: parsed structure + calculated costs
 * Output: cost summary + ranked optimizations + warnings
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ParsedSystem, CostEstimate, OptimizationFlags } from "./knowledge-base";

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

  const prompt = `You are an AI systems cost optimization expert. Analyze this specific system and provide a personalized review.

SYSTEM ARCHITECTURE (parsed):
${JSON.stringify(parsed, null, 2)}

COST ESTIMATES (calculated):
${JSON.stringify(costs, null, 2)}
${optStateBlock}
IMPORTANT: Calculate ALL estimated savings against the MID scenario only. The mid cost is the primary estimate shown to users. Never calculate savings based on the high scenario.

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

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system:
      "You are a senior AI systems architect specializing in cost optimization. Be specific to the user's actual system — reference their agent names, model choices, and numbers. Cite specific dollar amounts and percentages. Follow the output format EXACTLY as specified. Do NOT use emojis anywhere in your response.",
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
