/**
 * Recommender — Generates optimization suggestions.
 * BUSINESS LAYER: One API call to Claude.
 *
 * Input: parsed structure + calculated costs
 * Output: architecture diagram + ranked optimizations + warnings
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

Provide your response in this EXACT format (plain text, not JSON):

=== ARCHITECTURE DIAGRAM ===
Draw a text-based diagram showing the agent flow, data movement, and tool interactions.
Use arrows and boxes. Show where tokens accumulate and cost multiplies.

=== COST SUMMARY ===
Summarize the low/mid/high monthly costs in a clear table.
Highlight which component is the biggest cost driver.

=== OPTIMIZATION RECOMMENDATIONS ===
List 3-5 specific, actionable optimizations ranked by savings potential.
For each one:
- What to change
- Estimated savings (percentage or dollar amount)
- Quality impact (none, minor, moderate, significant)
- Implementation difficulty (easy, moderate, hard)

Base recommendations on these PROVEN findings:
1. Pattern simplification: could a simpler pattern work? (multi-agent to single agent saved 4.8x in our tests)
2. Model routing: which agents can use cheaper models? (Haiku for classification/simple judgment saves 3-15x)
3. Memory strategy: is the current strategy optimal for the conversation length? (entity memory saved 55% of input tokens vs buffer in our tests)
4. Caching: is the system prompt + tool definitions large enough to cache? (minimum 1,024 tokens required, 90% savings on reads)
5. Tool reliability: recommend paid reliable tools over free unreliable ones (saves on LLM retries)
6. Fuzzy loop detection: recommend max failure thresholds per tool (saved 49% in our tests)
7. Context truncation: does every agent need full context? (truncated research to critic saved thousands of tokens)
8. Budget caps WITH fallback: budget cap alone cut costs 42% but gave garbage output — needs fallback
9. Separate call functions: agents without tools should NOT receive tool definitions (saves ~500 tokens per call)

=== WARNINGS ===
Flag any red flags:
- 200K context trap risk (if input might exceed 200K tokens, ALL pricing doubles)
- Thinking models without budget caps
- Missing guardrails (no max iterations, no cost budgets)
- Tool agents without failure handling
- Multi-agent for tasks a single agent could handle (4.8x overhead in our tests)`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system:
      "You are a senior AI systems architect specializing in cost optimization. Be specific, cite numbers, and rank recommendations by impact.",
    messages: [{ role: "user", content: prompt }],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}
