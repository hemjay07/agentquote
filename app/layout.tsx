import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

const siteUrl = "https://agentquote.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AgentQuote — AI Agent Cost Calculator | Estimate LLM API Costs",
    template: "%s | AgentQuote",
  },
  description:
    "Calculate how much your AI agent system will cost to run. Get instant cost breakdowns, optimization suggestions, and architecture analysis — powered by real experimental data.",
  applicationName: "AgentQuote",
  keywords: [
    "AI agent cost calculator",
    "LLM cost estimator",
    "AI agent pricing",
    "how much does an AI agent cost",
    "Claude API cost calculator",
    "OpenAI API cost estimator",
    "multi-agent system cost",
    "AI agent development cost",
    "LLM token cost calculator",
    "AI agent cost optimization",
    "reduce AI agent costs",
    "agent architecture costs",
  ],
  authors: [{ name: "Mujeeb", url: "https://x.com/__mujeeb__" }],
  creator: "Mujeeb",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "AgentQuote",
    title: "AgentQuote — Know What Your AI Agents Will Actually Cost",
    description:
      "Calculate AI agent costs in seconds. Real data from 14 validated experiments: 4.8x multi-agent overhead, 49% max savings, 8 architecture patterns analyzed.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "AgentQuote — AI Agent Cost Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentQuote — Know What Your AI Agents Will Actually Cost",
    description:
      "Calculate AI agent costs in seconds. Real data from 14 validated experiments: 4.8x multi-agent overhead, 49% max savings.",
    creator: "@__mujeeb__",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AgentQuote",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    sameAs: ["https://x.com/__mujeeb__"],
    description:
      "AI Agent Cost Calculator - Calculate how much your AI agent system will cost to run",
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AgentQuote",
    url: siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free AI Agent Cost Calculator",
    },
    description:
      "Calculate how much your AI agent system will cost to run. Get cost breakdowns, optimization suggestions, and architecture analysis — powered by real experimental data.",
    creator: {
      "@type": "Person",
      name: "Mujeeb",
      url: "https://x.com/__mujeeb__",
    },
  };

  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webApplicationSchema),
          }}
        />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
