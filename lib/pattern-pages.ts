import { PATTERN_PROFILES, type PatternProfile } from "./knowledge-base";

export interface PatternPage {
  slug: string;
  profile: PatternProfile;
  useCases: string[];
  costDrivers: string[];
  optimizationTips: string[];
  exampleMonthly: { volume: string; model: string; cost: string }[];
}

export const PATTERN_PAGES: PatternPage[] = [
  {
    slug: "single_call",
    profile: PATTERN_PROFILES["single_call"],
    useCases: [
      "Simple Q&A chatbots",
      "Text classification",
      "Content generation (one-shot)",
      "Summarization",
    ],
    costDrivers: [
      "Token count is the only variable — no tool overhead, no loops",
      "Cost scales linearly with conversation volume",
      "Model choice is the biggest lever (15x range between Haiku and Opus)",
    ],
    optimizationTips: [
      "Use prompt caching if your system prompt exceeds 1,024 tokens",
      "Route simple queries to cheaper models (Haiku or GPT-4o Mini)",
      "Use batch API for non-real-time workloads (50% discount)",
    ],
    exampleMonthly: [
      { volume: "100/day", model: "Haiku 4.5", cost: "$30-60" },
      { volume: "100/day", model: "Sonnet 4.5", cost: "$90-180" },
      { volume: "1,000/day", model: "Haiku 4.5", cost: "$300-600" },
    ],
  },
  {
    slug: "prompt_chain",
    profile: PATTERN_PROFILES["prompt_chain"],
    useCases: [
      "Document processing pipelines",
      "Multi-step content creation",
      "Data extraction + validation",
      "Sequential reasoning tasks",
    ],
    costDrivers: [
      "Number of chain steps (2-5 typically)",
      "Context passed between steps — each step's output becomes the next step's input",
      "Failure in any step may require restarting the chain",
    ],
    optimizationTips: [
      "Minimize context passed between steps — only forward what the next step needs",
      "Use cheaper models for intermediate steps (e.g., Haiku for extraction, Sonnet for final synthesis)",
      "Add validation between steps to fail fast and avoid wasting tokens on bad intermediate results",
    ],
    exampleMonthly: [
      { volume: "100/day", model: "Haiku 4.5", cost: "$90-180" },
      { volume: "100/day", model: "Sonnet 4.5", cost: "$270-540" },
      { volume: "1,000/day", model: "Sonnet 4.5", cost: "$2,700-5,400" },
    ],
  },
  {
    slug: "routing",
    profile: PATTERN_PROFILES["routing"],
    useCases: [
      "Customer support triage",
      "Multi-domain assistants",
      "Cost-optimized model selection",
      "Intent classification + specialized handlers",
    ],
    costDrivers: [
      "Classifier call is cheap (use Haiku or Mini)",
      "Handler call varies by complexity — simple handlers are cheap, complex ones are expensive",
      "Misrouting wastes tokens on wrong handlers",
    ],
    optimizationTips: [
      "Use the cheapest possible model for the routing classifier",
      "Route 60-70% of simple queries to cheap models (measured in our experiments)",
      "Monitor misroute rate — each misroute costs you 2x (wrong handler + correct handler)",
    ],
    exampleMonthly: [
      { volume: "100/day", model: "Haiku router + Sonnet handler", cost: "$120-240" },
      { volume: "1,000/day", model: "Haiku router + Sonnet handler", cost: "$1,200-2,400" },
      { volume: "5,000/day", model: "Mini router + mixed handlers", cost: "$3,000-6,000" },
    ],
  },
  {
    slug: "parallel",
    profile: PATTERN_PROFILES["parallel"],
    useCases: [
      "Multi-source research",
      "A/B content generation",
      "Parallel data processing",
      "Ensemble voting systems",
    ],
    costDrivers: [
      "Number of parallel branches (2-6 typical)",
      "Each branch runs independently — costs are additive, not shared",
      "Synthesis step to merge results adds overhead",
    ],
    optimizationTips: [
      "Only parallelize when tasks are genuinely independent",
      "Use cheaper models for branches where quality variation is acceptable",
      "Consider whether you need all branches or can early-exit when one succeeds",
    ],
    exampleMonthly: [
      { volume: "100/day", model: "Sonnet 4.5 (3 branches)", cost: "$270-540" },
      { volume: "500/day", model: "Sonnet 4.5 (4 branches)", cost: "$1,800-3,600" },
      { volume: "1,000/day", model: "Haiku 4.5 (4 branches)", cost: "$1,200-2,400" },
    ],
  },
  {
    slug: "react_agent",
    profile: PATTERN_PROFILES["react_agent"],
    useCases: [
      "Tool-using assistants",
      "Web browsing agents",
      "Code execution agents",
      "Dynamic research tasks",
    ],
    costDrivers: [
      "Unpredictable loop count (2-10+ iterations)",
      "Each tool use = 2 API calls (tool request + tool result)",
      "Tool definitions add ~500 tokens per tool per request",
      "Failure retries compound context (18% growth per failure)",
    ],
    optimizationTips: [
      "Add loop detection — cap iterations at a reasonable maximum",
      "Only include tool definitions that are relevant to the current task",
      "Use structured error messages to help the agent recover without extra iterations",
      "Monitor and log iteration counts to identify runaway conversations",
    ],
    exampleMonthly: [
      { volume: "100/day", model: "Sonnet 4.5 (3 tools)", cost: "$360-1,200" },
      { volume: "500/day", model: "Sonnet 4.5 (5 tools)", cost: "$2,700-9,000" },
      { volume: "1,000/day", model: "Haiku 4.5 (3 tools)", cost: "$1,800-6,000" },
    ],
  },
  {
    slug: "multi_agent",
    profile: PATTERN_PROFILES["multi_agent"],
    useCases: [
      "Complex workflow orchestration",
      "Specialized agent teams",
      "Manager-worker task decomposition",
      "Cross-domain problem solving",
    ],
    costDrivers: [
      "Context duplication at every handoff (1.2x per additional agent)",
      "Orchestrator overhead (routing, evaluation, synthesis)",
      "Measured 4.8x total cost multiplier with 4 agents in our Day 4 experiment",
      "More agents = diminishing quality returns but linear cost increase",
    ],
    optimizationTips: [
      "Minimize handoff context — only pass what each worker needs",
      "Use cheap models (Haiku) for worker agents, Sonnet for the orchestrator",
      "Limit to 2-3 agents unless you have a clear quality justification for more",
      "Cache shared context with prompt caching to reduce duplication cost",
    ],
    exampleMonthly: [
      { volume: "100/day", model: "Sonnet orchestrator + Haiku workers", cost: "$900-2,700" },
      { volume: "500/day", model: "Sonnet orchestrator + Haiku workers", cost: "$4,500-13,500" },
      { volume: "1,000/day", model: "Sonnet + Sonnet", cost: "$13,500-40,000" },
    ],
  },
];

export function getPatternPage(slug: string): PatternPage | undefined {
  return PATTERN_PAGES.find((p) => p.slug === slug);
}

export function getAllPatternSlugs(): string[] {
  return PATTERN_PAGES.map((p) => p.slug);
}
