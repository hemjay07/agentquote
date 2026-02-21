/**
 * Recommender — Generates optimization suggestions.
 * BUSINESS LAYER: One API call to Claude.
 *
 * Input: parsed structure + calculated costs
 * Output: cost summary + ranked optimizations + warnings
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ParsedSystem, CostEstimate } from "./knowledge-base";

/**
 * Claude analyzes the system + costs and generates recommendations.
 * One API call to Haiku.
 */
export async function generateRecommendations(
  parsed: ParsedSystem,
  costs: CostEstimate
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are an AI systems cost optimization expert. Analyze this system and provide recommendations.

SYSTEM ARCHITECTURE (parsed):
${JSON.stringify(parsed, null, 2)}

COST ESTIMATES (calculated):
${JSON.stringify(costs, null, 2)}

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

=== OPTIMIZATION RECOMMENDATIONS ===
1. [Short title of optimization]
What to change: [specific description]
Estimated savings: [dollar amount]/mo or [percentage]%
Quality impact: [none|minor|moderate|significant]
Implementation difficulty: [easy|moderate|hard]

2. [Short title of next optimization]
What to change: [specific description]
Estimated savings: [dollar amount]/mo or [percentage]%
Quality impact: [none|minor|moderate|significant]
Implementation difficulty: [easy|moderate|hard]

(List 3-5 recommendations ranked by savings. Use the exact field labels above.)

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
      "You are a senior AI systems architect specializing in cost optimization. Be specific, cite numbers, and rank recommendations by impact. Follow the output format EXACTLY as specified - use pipe tables, numbered lists, and the exact field labels shown. Do NOT use emojis anywhere in your response.",
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
