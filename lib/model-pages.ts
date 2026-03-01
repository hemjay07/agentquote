import { MODEL_PRICING, type ModelPricing } from "./knowledge-base";

export interface ModelPage {
  slug: string;
  pricing: ModelPricing;
  provider: string;
  lastUpdated: string;
  description: string;
  bestFor: string[];
  scenarios: {
    label: string;
    dailyConversations: number;
    turnsPerConversation: number;
    monthlyCost: string;
  }[];
  comparedTo: { slug: string; label: string; verdict: string }[];
}

export const MODEL_PAGES: ModelPage[] = [
  {
    slug: "claude-haiku-4-5",
    pricing: MODEL_PRICING["claude-haiku-4-5"],
    provider: "Anthropic",
    lastUpdated: "March 2026",
    description:
      "The fastest and cheapest Claude model. Ideal for high-volume agent systems where speed and cost matter more than peak reasoning quality.",
    bestFor: [
      "High-volume chatbots",
      "Classification and routing",
      "Simple tool-use agents",
      "Content moderation",
    ],
    scenarios: [
      { label: "Light (50 convos/day)", dailyConversations: 50, turnsPerConversation: 5, monthlyCost: "$45-90" },
      { label: "Medium (500 convos/day)", dailyConversations: 500, turnsPerConversation: 5, monthlyCost: "$450-900" },
      { label: "Heavy (5K convos/day)", dailyConversations: 5000, turnsPerConversation: 5, monthlyCost: "$4,500-9,000" },
    ],
    comparedTo: [
      { slug: "claude-sonnet-4-5", label: "Sonnet 4.5", verdict: "3x cheaper than Sonnet. Use Haiku for simple tasks, Sonnet when you need stronger reasoning." },
      { slug: "gpt-4o-mini", label: "GPT-4o Mini", verdict: "6.7x more expensive than GPT-4o Mini on input, but significantly more capable. Worth it for tool-use agents." },
    ],
  },
  {
    slug: "claude-sonnet-4-5",
    pricing: MODEL_PRICING["claude-sonnet-4-5"],
    provider: "Anthropic",
    lastUpdated: "March 2026",
    description:
      "The best balance of cost and capability in the Claude family. The default choice for most production agent systems.",
    bestFor: [
      "Production agent systems",
      "Multi-step reasoning",
      "Code generation agents",
      "Complex tool orchestration",
    ],
    scenarios: [
      { label: "Light (50 convos/day)", dailyConversations: 50, turnsPerConversation: 5, monthlyCost: "$135-270" },
      { label: "Medium (500 convos/day)", dailyConversations: 500, turnsPerConversation: 5, monthlyCost: "$1,350-2,700" },
      { label: "Heavy (5K convos/day)", dailyConversations: 5000, turnsPerConversation: 5, monthlyCost: "$13,500-27,000" },
    ],
    comparedTo: [
      { slug: "claude-haiku-4-5", label: "Haiku 4.5", verdict: "3x more expensive than Haiku but much stronger reasoning. The sweet spot for most agent workloads." },
      { slug: "gpt-4o", label: "GPT-4o", verdict: "Similar capability. Sonnet is 20% more expensive on input but 50% more on output. Choose based on your framework preference." },
    ],
  },
  {
    slug: "gpt-4o",
    pricing: MODEL_PRICING["gpt-4o"],
    provider: "OpenAI",
    lastUpdated: "March 2026",
    description:
      "OpenAI's flagship model. Strong all-around capabilities with competitive pricing for both input and output tokens.",
    bestFor: [
      "General-purpose agents",
      "Function calling",
      "Vision-enabled agents",
      "OpenAI ecosystem integration",
    ],
    scenarios: [
      { label: "Light (50 convos/day)", dailyConversations: 50, turnsPerConversation: 5, monthlyCost: "$110-220" },
      { label: "Medium (500 convos/day)", dailyConversations: 500, turnsPerConversation: 5, monthlyCost: "$1,100-2,200" },
      { label: "Heavy (5K convos/day)", dailyConversations: 5000, turnsPerConversation: 5, monthlyCost: "$11,000-22,000" },
    ],
    comparedTo: [
      { slug: "claude-sonnet-4-5", label: "Sonnet 4.5", verdict: "Slightly cheaper than Sonnet overall. Similar capabilities — choose based on ecosystem." },
      { slug: "gpt-4o-mini", label: "GPT-4o Mini", verdict: "17x more expensive than Mini on input. Use Mini for simple routing, 4o for complex reasoning." },
    ],
  },
  {
    slug: "gpt-4o-mini",
    pricing: MODEL_PRICING["gpt-4o-mini"],
    provider: "OpenAI",
    lastUpdated: "March 2026",
    description:
      "OpenAI's budget model. Extremely cheap for high-volume, low-complexity tasks. The cheapest mainstream option.",
    bestFor: [
      "High-volume classification",
      "Simple chatbots",
      "Routing layers",
      "Data extraction",
    ],
    scenarios: [
      { label: "Light (50 convos/day)", dailyConversations: 50, turnsPerConversation: 5, monthlyCost: "$5-10" },
      { label: "Medium (500 convos/day)", dailyConversations: 500, turnsPerConversation: 5, monthlyCost: "$50-100" },
      { label: "Heavy (5K convos/day)", dailyConversations: 5000, turnsPerConversation: 5, monthlyCost: "$500-1,000" },
    ],
    comparedTo: [
      { slug: "claude-haiku-4-5", label: "Haiku 4.5", verdict: "6.7x cheaper on input. But Haiku is more capable for complex tasks. Use Mini for the cheapest possible routing." },
      { slug: "deepseek-v3", label: "DeepSeek V3", verdict: "Slightly cheaper than DeepSeek on input, but DeepSeek has better output pricing. Comparable for budget workloads." },
    ],
  },
  {
    slug: "deepseek-v3",
    pricing: MODEL_PRICING["deepseek-v3"],
    provider: "DeepSeek",
    lastUpdated: "March 2026",
    description:
      "Open-source model with aggressive pricing. Strong coding capabilities and the cheapest output tokens of any major model.",
    bestFor: [
      "Code generation agents",
      "Budget-conscious deployments",
      "Self-hosted agent systems",
      "Output-heavy workloads",
    ],
    scenarios: [
      { label: "Light (50 convos/day)", dailyConversations: 50, turnsPerConversation: 5, monthlyCost: "$5-12" },
      { label: "Medium (500 convos/day)", dailyConversations: 500, turnsPerConversation: 5, monthlyCost: "$50-120" },
      { label: "Heavy (5K convos/day)", dailyConversations: 5000, turnsPerConversation: 5, monthlyCost: "$500-1,200" },
    ],
    comparedTo: [
      { slug: "gpt-4o-mini", label: "GPT-4o Mini", verdict: "Similar price tier. DeepSeek is 30% cheaper on output but 87% more expensive on input. Best for output-heavy tasks." },
      { slug: "claude-haiku-4-5", label: "Haiku 4.5", verdict: "3.6x cheaper on input than Haiku. Strong choice for budget deployments where you don't need Anthropic's safety features." },
    ],
  },
];

export function getModelPage(slug: string): ModelPage | undefined {
  return MODEL_PAGES.find((m) => m.slug === slug);
}

export function getAllModelSlugs(): string[] {
  return MODEL_PAGES.map((m) => m.slug);
}
