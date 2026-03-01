# AgentQuote — SEO Implementation Code Reference

## Complete Copy-Paste Code for All SEO Features

This document contains every line of code needed for technical SEO. Copy directly from here into your files.

---

## 1. Sitemap (app/sitemap.ts)

**File Location:** `/app/sitemap.ts`

```typescript
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agentquote.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/estimate`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
```

**How to Use:**
1. Create the file at exact path: `app/sitemap.ts`
2. Copy the code above
3. Set environment variable: `NEXT_PUBLIC_SITE_URL=https://agentquote.com`
4. After deployment, verify at: `https://agentquote.com/sitemap.xml`

**To Add More Pages:**

```typescript
// Add to the array:
{
  url: `${baseUrl}/your-new-page`,
  lastModified: new Date(),
  changeFrequency: "weekly",
  priority: 0.8,
}
```

---

## 2. Robots.txt (app/robots.ts)

**File Location:** `/app/robots.ts`

```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agentquote.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/.next/"],
      },
      // Slow crawlers - add crawl delay
      {
        userAgent: "AhrefsBot",
        crawlDelay: 10,
      },
      {
        userAgent: "SemrushBot",
        crawlDelay: 10,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
```

**How to Use:**
1. Create the file at exact path: `app/robots.ts`
2. Copy the code above
3. After deployment, verify at: `https://agentquote.com/robots.txt`

**To Block More Crawlers (e.g., Moz):**

```typescript
{
  userAgent: "MJ12bot",
  crawlDelay: 10,
},
```

**To Disallow More Routes:**

```typescript
disallow: ["/api/", "/.next/", "/admin/", "/dashboard/"],
```

---

## 3. Font Setup (app/layout.tsx)

**Key Section: Import and Configure Fonts**

```typescript
import { Inter, IBM_Plex_Mono } from "next/font/google";

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
```

**Key Section: Use Fonts in HTML**

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      {/* ... rest of layout */}
    </html>
  );
}
```

**Key Section: Update globals.css**

Replace:
```css
body {
  font-family: "Inter", system-ui, -apple-system, sans-serif;
}

code, pre, kbd, .font-mono {
  font-family: "IBM Plex Mono", "JetBrains Mono", monospace;
}
```

With:
```css
body {
  font-family: var(--font-inter), system-ui, -apple-system, sans-serif;
}

code, pre, kbd, .font-mono {
  font-family: var(--font-ibm-plex-mono), "JetBrains Mono", monospace;
}
```

**What This Does:**
- Self-hosts fonts (no Google request)
- Automatic subset optimization
- Prevents FOUT (Flash of Unstyled Text)
- Improves LCP (Largest Contentful Paint)

---

## 4. JSON-LD Structured Data (app/layout.tsx)

**Complete layout.tsx File:**

```typescript
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

export const metadata: Metadata = {
  title: "AgentQuote — AI Agent Cost Estimator",
  description:
    "Estimate how much your AI agent system will cost to run. Get cost breakdowns, optimization suggestions, and architecture diagrams.",
  applicationName: "AgentQuote",
  keywords: [
    "AI agent cost estimator",
    "LLM cost calculator",
    "AI system pricing",
    "agent architecture costs",
    "multi-agent system calculator",
  ],
  authors: [
    {
      name: "Mujeeb",
      url: "https://x.com/__mujeeb__",
    },
  ],
  creator: "Mujeeb",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://agentquote.com",
    siteName: "AgentQuote",
    title: "AgentQuote — AI Agent Cost Estimator",
    description:
      "Estimate how much your AI agent system will cost to run. Get cost breakdowns, optimization suggestions, and architecture diagrams.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://agentquote.com"}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "AgentQuote - AI Agent Cost Estimator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentQuote — AI Agent Cost Estimator",
    description:
      "Estimate how much your AI agent system will cost to run. Get cost breakdowns, optimization suggestions, and architecture diagrams.",
    creator: "@__mujeeb__",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://agentquote.com";

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AgentQuote",
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    sameAs: ["https://x.com/__mujeeb__"],
    description:
      "AI Agent Cost Estimator - Estimate how much your AI agent system will cost to run",
  };

  // WebApplication Schema
  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "AgentQuote",
    url: baseUrl,
    applicationCategory: "BusinessApplication",
    genre: "Utility",
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free AI Agent Cost Estimation Tool",
    },
    screenshot: `${baseUrl}/screenshot.png`,
    description:
      "Estimate how much your AI agent system will cost to run. Get cost breakdowns, optimization suggestions, and architecture diagrams.",
    creator: {
      "@type": "Person",
      name: "Mujeeb",
      url: "https://x.com/__mujeeb__",
    },
  };

  return (
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <head>
        {/* Canonical URL - set per page via layout metadata */}
        <link rel="canonical" href={baseUrl} />

        {/* Preconnect to external resources (if using any CDN in future) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://api.anthropic.com" />

        {/* JSON-LD Structured Data */}
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
```

---

## 5. Homepage Metadata (app/page.tsx)

**Add to Top of Component:**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentQuote — AI Agent Cost Estimator",
  description:
    "Estimate how much your AI agent system will cost to run. Get cost breakdowns, optimization suggestions, and architecture diagrams.",
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL || "https://agentquote.com",
  },
};
```

---

## 6. Estimate Page Metadata (app/estimate/page.tsx)

**Add to Top of Component:**

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Estimate Your AI Agent System Costs — AgentQuote",
  description:
    "Describe your AI agent architecture and get instant cost estimates with optimization suggestions.",
  alternates: {
    canonical:
      process.env.NEXT_PUBLIC_SITE_URL || "https://agentquote.com/estimate",
  },
};
```

---

## 7. Environment Variables (.env.local)

**Required:**

```bash
NEXT_PUBLIC_SITE_URL=https://agentquote.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # For local development, update when deploying
```

**Note:** `NEXT_PUBLIC_` prefix makes it available in browser. Non-public env vars can be used only server-side.

---

## 8. FAQ Schema (For Future Use)

**If adding FAQ to homepage:**

```typescript
// Add to app/page.tsx or a new component in app/layout.tsx head:

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is AgentQuote?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AgentQuote is a free AI agent cost estimator. Describe your system, and get instant cost breakdowns with optimization suggestions."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate are the estimates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our estimates are based on real experimental data from building AI agent systems. They account for model pricing, token usage, and architecture patterns observed in practice."
      }
    },
    {
      "@type": "Question",
      "name": "Is AgentQuote free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, AgentQuote is completely free. No credit card required. Each analysis uses a small amount of free API credits."
      }
    },
  ]
};

// Then in your <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(faqSchema),
  }}
/>
```

---

## 9. Breadcrumb Schema (For Future Use)

**If adding breadcrumbs to estimate page:**

```typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": baseUrl
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Estimate",
      "item": `${baseUrl}/estimate`
    }
  ]
};

// In <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(breadcrumbSchema),
  }}
/>
```

---

## 10. Open Graph Images

**For Social Sharing (create these files):**

1. **Homepage OG Image:** `public/og-image.png`
   - Size: 1200x630 pixels
   - Format: PNG
   - Content: AgentQuote logo/hero with "AI Agent Cost Estimator" text

2. **Favicon:** `public/favicon.ico`
   - Size: 32x32 pixels
   - Already set up in your icons config

**Generate OG Images:**

Option 1: Use design tool
- Figma, Canva, or Illustrator
- Dimensions: 1200x630

Option 2: Use Next.js dynamic OG image generation (advanced):
```typescript
// app/og.tsx (if implementing dynamic OG)
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: "linear-gradient(to bottom, #0a0a0b, #141416)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <h1>AgentQuote — AI Agent Cost Estimator</h1>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## 11. Testing & Validation Commands

**Test Sitemap:**
```bash
curl https://agentquote.com/sitemap.xml
```

**Test Robots.txt:**
```bash
curl https://agentquote.com/robots.txt
```

**Test JSON-LD (in browser):**
1. Open DevTools (F12)
2. Inspect page > go to <head>
3. Look for `<script type="application/ld+json">`
4. Paste content to https://validator.schema.org/

**Test Core Web Vitals:**
```bash
npm install web-vitals

# Then create app/web-vitals.ts:
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function sendMetrics(metric: any) {
  console.log(metric);
  // Or send to your analytics
}

getCLS(sendMetrics);
getFID(sendMetrics);
getFCP(sendMetrics);
getLCP(sendMetrics);
getTTFB(sendMetrics);
```

---

## 12. Deployment Checklist

### Before Deployment:

- [ ] All `.ts` files created in `/app` directory
- [ ] `.env.local` has `NEXT_PUBLIC_SITE_URL`
- [ ] `npm run build` completes without errors
- [ ] Visit `http://localhost:3000/sitemap.xml` — shows valid XML
- [ ] Visit `http://localhost:3000/robots.txt` — shows valid robots.txt
- [ ] Check `<head>` for JSON-LD scripts (DevTools > Inspect)

### After Deployment:

- [ ] Visit `https://agentquote.com/sitemap.xml` in browser
- [ ] Visit `https://agentquote.com/robots.txt` in browser
- [ ] Create Google Search Console property
- [ ] Submit sitemap to GSC
- [ ] Wait 24-48 hours for indexing
- [ ] Check Core Web Vitals in GSC (after 2-4 weeks)

---

## 13. Common Issues & Fixes

### Issue: `NEXT_PUBLIC_SITE_URL is undefined`

**Fix:**
1. Check `.env.local` exists
2. Verify exact variable name: `NEXT_PUBLIC_SITE_URL`
3. Rebuild: `npm run build`
4. Restart dev server: `npm run dev`

### Issue: Fonts not loading (FOUT visible)

**Fix:**
1. Verify `Inter` and `IBM_Plex_Mono` imports in layout.tsx
2. Verify `className={`${inter.variable} ${ibmPlexMono.variable}`}` on `<html>`
3. Verify globals.css uses `var(--font-inter)` and `var(--font-ibm-plex-mono)`
4. Clear `.next` folder: `rm -rf .next && npm run build`

### Issue: JSON-LD not validating

**Fix:**
1. Go to https://validator.schema.org/
2. Paste the JSON-LD from `<script type="application/ld+json">`
3. Look for exact error message
4. Common issue: relative URLs instead of absolute (must include `https://`)

### Issue: Sitemap shows only one entry

**Fix:**
1. Add more routes to the array in `app/sitemap.ts`
2. Example:
   ```typescript
   return [
     { url: `${baseUrl}`, ... },
     { url: `${baseUrl}/estimate`, ... },
     { url: `${baseUrl}/blog`, ... },  // Add more
   ];
   ```

---

## 14. Performance Optimization Checklist

### Images
- [ ] Use Next.js `Image` component (not `<img>`)
- [ ] Set `width` and `height` to prevent CLS
- [ ] Use `priority` for above-the-fold images
- [ ] Lazy load below-the-fold images

### JavaScript
- [ ] Keep server components server-side (don't use "use client" unless interactive)
- [ ] Use dynamic imports for heavy components:
   ```typescript
   import dynamic from "next/dynamic";
   const HeavyComponent = dynamic(() => import("@/components/Heavy"));
   ```
- [ ] Defer non-critical scripts with `strategy="lazyOnload"`

### CSS
- [ ] Use CSS variables for theming (you already do)
- [ ] Minimize critical CSS in `<head>`
- [ ] Defer non-critical CSS with `media="print"`

### Fonts
- [ ] ✓ Already using next/font (self-hosted)
- [ ] ✓ display: "swap" prevents FOUT

---

## 15. Quick Reference

| File | Purpose | Audience |
|------|---------|----------|
| `app/sitemap.ts` | Tell search engines what pages exist | Google, Bing |
| `app/robots.ts` | Control crawl budget and rate limiting | All crawlers |
| `app/layout.tsx` | Global metadata, fonts, JSON-LD | Google, social platforms |
| `app/page.tsx` | Homepage-specific metadata | Google, preview tools |
| `.env.local` | Environment config (site URL) | Node.js runtime |
| `TECHNICAL_SEO_GUIDE.md` | Detailed explanation of everything | You, your team |

---

## FAQ

**Q: Do I need to submit sitemaps to Google manually?**
A: No, Google auto-discovers them. But manually submitting in Search Console is faster.

**Q: Why JSON-LD instead of other structured data formats?**
A: JSON-LD is Google's recommended format. It's easier to manage and doesn't require changing HTML.

**Q: Will these changes improve my ranking?**
A: They help Google understand your site better. Ranking depends on content quality, backlinks, and user experience. These changes remove technical barriers.

**Q: Can I use the same JSON-LD on multiple pages?**
A: Yes, global Organization/WebApplication schemas in layout.tsx apply to all pages. Page-specific schema goes in each page.

**Q: What's the difference between Canonical and Open Graph URLs?**
A: Canonical tells search engines which version to index. Open Graph tells social platforms what image/title to show when shared.

---

## Next Steps

1. Copy code from sections 1-5 into your files
2. Set environment variable `NEXT_PUBLIC_SITE_URL`
3. Run `npm run build` to verify no errors
4. Deploy to production
5. Submit sitemap to Google Search Console
6. Monitor Core Web Vitals after 2-4 weeks

**Estimated Time to Implementation:** 30-45 minutes

**Maintenance Time:** 5 minutes monthly (check GSC for errors)
