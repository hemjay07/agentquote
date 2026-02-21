/**
 * Calculator — Deterministic cost estimation.
 * BUSINESS LAYER: Pure math, zero API calls.
 *
 * Input: parsed system structure + optional optimization flags
 * Output: low/mid/high cost scenarios with detailed breakdowns
 *
 * Every formula traces back to a specific Day 1-5 experiment.
 */

import {
  MODEL_PRICING,
  AVG_USER_TOKENS,
  AVG_ASSISTANT_TOKENS,
  TOOL_DEF_OVERHEAD_TOKENS,
  API_CALLS_PER_TOOL_USE,
  AVG_TOOL_RESULT_TOKENS,
  CONTEXT_DUPLICATION_PER_AGENT,
  MEMORY_MULTIPLIERS,
  PATTERN_PROFILES,
  CACHE_MIN_TOKENS,
  CACHE_READ_DISCOUNT,
  FAILURE_RATES,
  CONTEXT_GROWTH_PER_FAILURE,
  type ParsedSystem,
  type ParsedAgent,
  type CostEstimate,
  type ScenarioResult,
  type OptimizationFlags,
  type NonLLMService,
} from "./knowledge-base";


/**
 * Run cost estimation using deterministic formulas.
 *
 * @param parsed - structured system data from the parser
 * @param optimizations - which optimizations the user already has in place
 * @param customModels - any custom model pricing the user provided
 * @param nonLLMServices - additional services (images, TTS, etc.)
 * @returns low/mid/high cost scenarios
 */
export function calculateCosts(
  parsed: ParsedSystem,
  optimizations?: OptimizationFlags,
  customModels?: Record<string, { input: number; output: number }>,
  nonLLMServices?: NonLLMService[],
): CostEstimate {
  const { agents, pattern, memory_strategy, avg_turns_per_conversation: turns, daily_conversations: dailyVolume } = parsed;

  const profile = PATTERN_PROFILES[pattern];
  const mem = MEMORY_MULTIPLIERS[memory_strategy];

  // Merge custom models with built-in pricing
  const allPricing = { ...MODEL_PRICING };
  if (customModels) {
    for (const [key, val] of Object.entries(customModels)) {
      allPricing[key] = { input: val.input, output: val.output, label: key };
    }
  }

  const results: Record<string, ScenarioResult> = {};

  for (const scenario of ["low", "mid", "high"] as const) {

    // Step 1: Base API calls from pattern profile
    const baseCalls = profile[`base_calls_${scenario}`];

    // Step 2: Tool overhead (Day 2: 1 tool use = 2 API calls)
    let toolCallsPerConvo = 0;
    let toolDefTokensPerConvo = 0;

    for (const agent of agents) {
      if (!agent.has_tools) continue;

      const usesMap = {
        low: agent.tool_count * 1,
        mid: agent.tool_count * 2,
        high: agent.tool_count * 4,
      };
      const uses = usesMap[scenario];
      const agentCalls = uses * API_CALLS_PER_TOOL_USE;
      toolCallsPerConvo += agentCalls;

      // Each API call to this agent includes its tool definitions
      // Optimization: tool-specific routing sends only 1 tool def per call
      const defsPerCall = optimizations?.tool_specific_routing
        ? TOOL_DEF_OVERHEAD_TOKENS
        : agent.tool_count * TOOL_DEF_OVERHEAD_TOKENS;
      toolDefTokensPerConvo += defsPerCall * agentCalls;
    }

    let totalCalls = baseCalls + toolCallsPerConvo;

    // Step 3: Memory overhead calls (Day 5)
    const memoryOverheadCalls = turns * mem.overhead_calls_per_turn;
    totalCalls += memoryOverheadCalls;

    // Step 4: Token estimation per conversation
    // Day 1: multi-turn resends history → triangular growth
    const avgTurnInput = AVG_USER_TOKENS + AVG_ASSISTANT_TOKENS;

    let totalInputTokens: number;
    if (memory_strategy === "none") {
      totalInputTokens = turns * AVG_USER_TOKENS;
    } else {
      // Triangle number: T*(T+1)/2 × avg turn size × memory multiplier
      const triangle = (turns * (turns + 1)) / 2;
      totalInputTokens = Math.round(triangle * avgTurnInput * mem.token_multiplier);
    }

    let totalOutputTokens = turns * AVG_ASSISTANT_TOKENS;

    // Tool definitions already calculated per-agent × per-call above
    totalInputTokens += toolDefTokensPerConvo;

    // Tool results injected into context after each use
    totalInputTokens += toolCallsPerConvo * AVG_TOOL_RESULT_TOKENS;

    // Step 5: Context duplication for multi-agent systems
    // Day 4: each additional agent multiplies input by ~1.2x
    if (agents.length > 1) {
      const duplication = Math.pow(CONTEXT_DUPLICATION_PER_AGENT, agents.length - 1);
      totalInputTokens = Math.round(totalInputTokens * duplication);
    }

    // Step 6: Failure overhead (Day 3: ~18% context growth per failure)
    // Optimization: loop detection reduces failure rate by 60%
    let failureRate = FAILURE_RATES[scenario];
    if (optimizations?.loop_detection) {
      failureRate *= 0.4; // 60% reduction (Day 3: fuzzy detection saved 49%)
    }

    const expectedFailures = toolCallsPerConvo * failureRate;
    // Cap failure overhead based on guardrails:
    // With loop detection: cap at 100% (guardrails stop runaway loops)
    // Without loop detection: cap at 300% (reflects real risk of unguarded tool spirals)
    const rawFailureMultiplier = expectedFailures * CONTEXT_GROWTH_PER_FAILURE;
    const failureCap = optimizations?.loop_detection ? 1.0 : 3.0;
    const cappedFailureMultiplier = Math.min(rawFailureMultiplier, failureCap);
    const failureTokenOverhead = Math.round(
      totalInputTokens * cappedFailureMultiplier
    );
    totalInputTokens += failureTokenOverhead;

    // Step 7: Dollar cost using the most expensive model (conservative)
    const primaryModel = getPrimaryModel(agents, allPricing);
    const pricing = allPricing[primaryModel] || allPricing["claude-sonnet-4-5"];

    let inputCost = (totalInputTokens / 1_000_000) * pricing.input;
    let outputCost = (totalOutputTokens / 1_000_000) * pricing.output;

    // Optimization: prompt caching (Day 1: 90% off cached reads)
    const systemPromptTokens = 500;
    // Cacheable = system prompt + tool definitions (sent once, cached for subsequent calls)
    const totalToolDefTokens = agents.reduce((sum, a) =>
      sum + (a.has_tools ? a.tool_count * TOOL_DEF_OVERHEAD_TOKENS : 0), 0);
    const cacheableTokens = systemPromptTokens + totalToolDefTokens;
    const cachingApplicable = cacheableTokens >= CACHE_MIN_TOKENS;

    let cachingSavingsPerConvo = 0;
    if (cachingApplicable && optimizations?.caching_enabled) {
      // Already caching: subtract savings from input cost
      cachingSavingsPerConvo =
        (cacheableTokens / 1_000_000) *
        pricing.input *
        (1 - CACHE_READ_DISCOUNT) *
        (totalCalls - 1);
      inputCost -= cachingSavingsPerConvo;
    } else if (cachingApplicable) {
      // Not caching yet: show potential savings
      cachingSavingsPerConvo =
        (cacheableTokens / 1_000_000) *
        pricing.input *
        (1 - CACHE_READ_DISCOUNT) *
        (totalCalls - 1);
    }

    let costPerConvo = inputCost + outputCost;

    // Memory overhead uses cheap Haiku (~$0.002 per call)
    costPerConvo += memoryOverheadCalls * 0.002;

    // Optimization: batch processing (Day 1: 50% off)
    if (optimizations?.batch_processing) {
      costPerConvo *= 0.5;
    }

    // Step 8: Scale to daily and monthly
    const dailyCost = costPerConvo * dailyVolume;
    const monthlyCost = dailyCost * 30;

    // Step 9: Add non-LLM service costs (Insight #12: simple multiplication)
    let nonLLMMonthlyCost = 0;
    if (nonLLMServices) {
      for (const service of nonLLMServices) {
        nonLLMMonthlyCost += service.unit_price * service.daily_volume * 30;
      }
    }

    results[scenario] = {
      total_calls_per_convo: Math.round(totalCalls),
      input_tokens_per_convo: totalInputTokens,
      output_tokens_per_convo: totalOutputTokens,
      cost_per_conversation: Number((costPerConvo).toFixed(6)),
      daily_cost: Number((dailyCost + (nonLLMMonthlyCost / 30)).toFixed(2)),
      monthly_cost: Number((monthlyCost + nonLLMMonthlyCost).toFixed(2)),
      memory_overhead_calls: Math.round(memoryOverheadCalls),
      tool_calls_per_convo: toolCallsPerConvo,
      failure_token_overhead: failureTokenOverhead,
      caching_applicable: cachingApplicable,
      caching_savings_monthly: Number(
        (cachingSavingsPerConvo * dailyVolume * 30).toFixed(2)
      ),
      primary_model: primaryModel,
    };
  }

  return results as unknown as CostEstimate;
}


/**
 * Find the most expensive model in the system.
 * Used for conservative (worst-case) cost estimation.
 */
function getPrimaryModel(
  agents: ParsedAgent[],
  pricing: Record<string, { input: number; output: number; label?: string }>
): string {
  let maxCost = 0;
  let maxModel = "claude-sonnet-4-5";

  for (const agent of agents) {
    const p = pricing[agent.model];
    if (p && p.output > maxCost) {
      maxCost = p.output;
      maxModel = agent.model;
    }
  }

  return maxModel;
}
