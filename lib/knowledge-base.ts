/**
 * Knowledge Base — Real data from Days 1-5 experiments.
 * DATA LAYER: No logic, no API calls. Just constants and types.
 *
 * Every number traces back to a specific experiment:
 * - MODEL_PRICING: Day 1 notes
 * - Tool overhead: Day 2 experiments
 * - Pattern profiles: Day 3 deep dive Part 7
 * - Context duplication: Day 4 multi-agent experiment
 * - Memory multipliers: Day 5 strategy comparison
 * - Failure rates: Day 3 chaos testing
 */

// ── Types ──────────────────────────────────────────────────

export interface ModelPricing {
  input: number;   // $ per million input tokens
  output: number;  // $ per million output tokens
  label: string;   // human-readable name
}

export interface MemoryProfile {
  token_multiplier: number;         // ratio vs buffer baseline
  overhead_calls_per_turn: number;  // extra API calls per user turn
  description: string;
}

export interface PatternProfile {
  label: string;
  base_calls_low: number;
  base_calls_mid: number;
  base_calls_high: number;
  description: string;
}

export interface ParsedAgent {
  name: string;
  role: string;
  model: string;
  has_tools: boolean;
  tool_count: number;
  tools_described: string[];
}

export interface ParsedSystem {
  system_name: string;
  agents: ParsedAgent[];
  pattern: string;
  memory_strategy: string;
  avg_turns_per_conversation: number;
  daily_conversations: number;
  has_rag: boolean;
  rag_details: string | null;
  guardrails_mentioned: string[];
  additional_services: {
    name: string;
    unit: string;
    estimated_daily_volume: number;
  }[];
}

export interface ScenarioResult {
  total_calls_per_convo: number;
  input_tokens_per_convo: number;
  output_tokens_per_convo: number;
  cost_per_conversation: number;
  daily_cost: number;
  monthly_cost: number;
  memory_overhead_calls: number;
  tool_calls_per_convo: number;
  failure_token_overhead: number;
  caching_applicable: boolean;
  caching_savings_monthly: number;
  primary_model: string;
}

export interface CostEstimate {
  low: ScenarioResult;
  mid: ScenarioResult;
  high: ScenarioResult;
}

export interface OptimizationFlags {
  caching_enabled: boolean;
  batch_processing: boolean;
  loop_detection: boolean;
  tool_specific_routing: boolean;
}

export interface NonLLMService {
  name: string;
  unit_price: number;    // cost per unit
  unit_label: string;    // "per image", "per minute", etc.
  daily_volume: number;
}

// ── Model Pricing ──────────────────────────────────────────
// Source: Day 1 notes — input and output per million tokens

export const MODEL_PRICING: Record<string, ModelPricing> = {
  "claude-haiku-4-5":   { input: 1.00,  output: 5.00,   label: "Haiku 4.5" },
  "claude-sonnet-4-5":  { input: 3.00,  output: 15.00,  label: "Sonnet 4.5" },
  "claude-opus-4-5":    { input: 15.00, output: 75.00,  label: "Opus 4.5" },
  "gpt-4o":             { input: 2.50,  output: 10.00,  label: "GPT-4o" },
  "gpt-4o-mini":        { input: 0.15,  output: 0.60,   label: "GPT-4o Mini" },
  "deepseek-v3":        { input: 0.28,  output: 0.42,   label: "DeepSeek V3" },
};

// ── Token Averages ─────────────────────────────────────────
// Source: Day 5 experiment — measured across 10-turn conversations

export const AVG_USER_TOKENS = 30;
export const AVG_ASSISTANT_TOKENS = 300;

// ── Tool Overhead ──────────────────────────────────────────
// Source: Day 2 experiments

export const TOOL_DEF_OVERHEAD_TOKENS = 500;  // per tool definition per request
export const API_CALLS_PER_TOOL_USE = 2;      // request + result
export const AVG_TOOL_RESULT_TOKENS = 200;    // tokens per tool result

// ── Multi-Agent Context Duplication ────────────────────────
// Source: Day 4 — each additional agent multiplies input ~1.2x

export const CONTEXT_DUPLICATION_PER_AGENT = 1.2;

// ── Memory Strategy Multipliers ────────────────────────────
// Source: Day 5 — ratios relative to BufferMemory

export const MEMORY_MULTIPLIERS: Record<string, MemoryProfile> = {
  buffer: {
    token_multiplier: 1.0,
    overhead_calls_per_turn: 0,
    description: "Full history every turn. Linear token growth.",
  },
  summary: {
    token_multiplier: 0.71,      // 11,573/16,306 from Day 5
    overhead_calls_per_turn: 0.3, // ~3 summary calls per 10 turns
    description: "Periodic compression. Saves tokens but adds overhead calls.",
  },
  entity: {
    token_multiplier: 0.45,      // 7,273/16,306 from Day 5
    overhead_calls_per_turn: 1.0, // 1 extraction call per user turn
    description: "Fact extraction. Best compression, highest API overhead.",
  },
  none: {
    token_multiplier: 0.0,
    overhead_calls_per_turn: 0,
    description: "No memory. Each turn is independent.",
  },
};

// ── Pattern Profiles ───────────────────────────────────────
// Source: Day 3 deep dive Part 7

export const PATTERN_PROFILES: Record<string, PatternProfile> = {
  single_call: {
    label: "Single LLM Call",
    base_calls_low: 1, base_calls_mid: 1, base_calls_high: 1,
    description: "One prompt in, one response out. No tools, no loops.",
  },
  prompt_chain: {
    label: "Prompt Chaining",
    base_calls_low: 2, base_calls_mid: 3, base_calls_high: 5,
    description: "Fixed sequential steps. Predictable cost.",
  },
  routing: {
    label: "Routing (Classifier + Handler)",
    base_calls_low: 2, base_calls_mid: 2, base_calls_high: 3,
    description: "Cheap classifier then specialized handler.",
  },
  parallel: {
    label: "Parallelization",
    base_calls_low: 2, base_calls_mid: 4, base_calls_high: 6,
    description: "Independent subtasks run simultaneously.",
  },
  react_agent: {
    label: "ReAct Agent (Tool Loop)",
    base_calls_low: 2, base_calls_mid: 4, base_calls_high: 10,
    description: "Agent decides tools and actions. Loops and failures compound.",
  },
  multi_agent: {
    label: "Multi-Agent (Orchestrator-Workers)",
    base_calls_low: 4, base_calls_mid: 8, base_calls_high: 15,
    description: "Supervisor + workers. Context duplication at every handoff.",
  },
  eval_optimizer: {
    label: "Evaluator-Optimizer",
    base_calls_low: 2, base_calls_mid: 4, base_calls_high: 8,
    description: "Generate, evaluate, revise loop. Double calls per iteration.",
  },
  reflexion: {
    label: "Reflexion (ReAct + Self-Critique)",
    base_calls_low: 3, base_calls_mid: 6, base_calls_high: 12,
    description: "Most expensive per task. Self-critique adds tokens per iteration.",
  },
};

// ── Caching Thresholds ─────────────────────────────────────
// Source: Day 1 + Insight #13

export const CACHE_MIN_TOKENS = 1024;
export const CACHE_READ_DISCOUNT = 0.10;  // pay 10% of input price
export const CACHE_WRITE_PREMIUM = 1.25;

// ── Failure Rates ──────────────────────────────────────────
// Source: Day 3 chaos testing + Insight #7

export const FAILURE_RATES: Record<string, number> = {
  low: 0.05,   // 5% tool call failure
  mid: 0.15,   // 15%
  high: 0.35,  // 35% (DuckDuckGo-level)
};

export const CONTEXT_GROWTH_PER_FAILURE = 0.18;  // ~18% per failed retry

// ── Non-LLM Service Presets ────────────────────────────────
// Source: Insight #12 — predictable services, just quantity × price

export const SERVICE_PRESETS: Record<string, { unit_price: number; unit_label: string }> = {
  "dall-e-3":        { unit_price: 0.08,    unit_label: "per image" },
  "dall-e-2":        { unit_price: 0.02,    unit_label: "per image" },
  "whisper":         { unit_price: 0.006,   unit_label: "per minute" },
  "elevenlabs-tts":  { unit_price: 0.30,    unit_label: "per 1K chars" },
  "ada-002":         { unit_price: 0.0001,  unit_label: "per 1K tokens" },
  "runway-video":    { unit_price: 0.05,    unit_label: "per second" },
};
