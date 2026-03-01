import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calculate Your AI Agent Costs in 60 Seconds",
  description:
    "Describe your AI agent system and get instant cost breakdowns with low/mid/high scenarios. See optimization suggestions that can save up to 49%. Free, no signup required.",
  openGraph: {
    title: "Calculate Your AI Agent Costs in 60 Seconds",
    description:
      "Describe your AI agent system and get instant cost breakdowns with optimization suggestions. Powered by real experimental data.",
  },
  twitter: {
    title: "Calculate Your AI Agent Costs in 60 Seconds",
    description:
      "Describe your AI agent system and get instant cost breakdowns with optimization suggestions. Free, no signup.",
  },
  alternates: {
    canonical: "/estimate",
  },
};

export default function EstimateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
