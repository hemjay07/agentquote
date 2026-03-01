# AgentQuote — Technical SEO Implementation Guide

## Overview

This document covers the complete technical SEO implementation for AgentQuote using Next.js 14 App Router. All configurations follow Next.js 14 best practices and are optimized for search engine visibility and Core Web Vitals.

---

## 1. Sitemap Implementation

### File: `app/sitemap.ts`

The sitemap is dynamically generated at build time and updated on each request. This tells search engines about your page structure.

**Key Points:**
- Auto-updated lastModified date
- Priority set based on page importance (homepage highest at 1.0)
- Change frequency hints help crawlers decide recrawl timing
- No need for a static XML file; Next.js generates it automatically at `/sitemap.xml`

**Environment Variable Required:**
```bash
NEXT_PUBLIC_SITE_URL=https://agentquote.com
```

**How It Works:**
- Google crawls `https://yourdomain.com/sitemap.xml`
- Submit to Google Search Console
- Submit to Bing Webmaster Tools

**Best Practices:**
- Include all customer-facing pages
- Exclude `/api/` routes (done via robots.txt)
- Update `lastModified` to help search engines understand freshness
- Set priority wisely (use 1.0 only for critical pages like homepage)

---

## 2. Robots.txt Implementation

### File: `app/robots.ts`

Controls which URLs search engines can crawl and respects crawl budget constraints.

**Key Features:**
- **Allows:** All public pages (homepage, /estimate)
- **Disallows:** API routes and Next.js internals
- **Crawl Delays:** Rate limits for slow bots (Ahrefs, Semrush)
- **Sitemap Link:** Points to your sitemap location

**Why Disallow `/api/`:**
- API routes aren't meant for human browsing
- Reduces wasted crawl budget
- Prevents duplicate content issues

**What About Private Routes?**
- If you add a private /dashboard or /admin in the future, add it to disallow
- Use authenticated routes + meta robots="noindex,nofollow" for double protection

**Best Practices:**
- Crawl delays for aggressive crawlers (Ahrefs = 10s delay)
- Review every 6 months for new private routes
- Log robot visits: `https://search.google.com/search-console`

---

## 3. JSON-LD Structured Data

### What It Is

JSON-LD (JSON for Linking Data) is a format that embeds machine-readable data into HTML. Search engines use this to understand your content type, features, ratings, etc.

### Schema Types Implemented

#### A. Organization Schema (Global)

Located in `app/layout.tsx`, this runs on every page. Tells Google:
- Your company name, logo, and URL
- Social profiles
- General description

**Why It Matters:**
- Helps Google build a knowledge panel (if significant)
- Improves brand recognition in SERP
- Links your social profiles to your site

#### B. WebApplication Schema (Global)

Also in `app/layout.tsx`. Tells Google this is a SaaS tool:
- **browserRequirements:** Requires JavaScript (honest declaration)
- **genre:** Utility
- **applicationCategory:** BusinessApplication
- **Free offer:** No payment required

**Why It Matters:**
- Differentiates you from articles/news
- Improves relevance for "AI agent cost calculator" searches
- WebApplication is the correct schema (not SoftwareApplication)
- The free offer is important for SaaS products

**Why WebApplication vs SoftwareApplication?**
- SoftwareApplication = Desktop/mobile app (Final Cut Pro, Chrome)
- WebApplication = Cloud-based, browser-accessed tool (Canva, MailChimp, your tool)
- The defining property is `browserRequirements` — your tool only works in a browser

### Validation

Test your structured data:
1. Google Rich Results Test: https://search.google.com/test/rich-results
2. Schema.org Validator: https://validator.schema.org/
3. Search Console's Rich Results Report (after indexing)

### FAQ Schema (For Future Use)

If you add an FAQ section to your landing page, add this:

```typescript
// In app/page.tsx or components, add to page's JSON-LD:
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does AgentQuote estimate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "AgentQuote estimates the monthly cost of running your AI agent system based on model pricing, token usage, and architecture patterns."
      }
    },
    // Add more Q&As...
  ]
};
```

---

## 4. Canonical URLs

### What They Are

A canonical URL tells search engines: "If you find this page at multiple URLs, this is the official version."

### Implementation

In `app/page.tsx` and `app/estimate/page.tsx`, add to metadata:

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://agentquote.com",
  },
};
```

In `app/layout.tsx`, a global canonical is also set:
```html
<link rel="canonical" href={baseUrl} />
```

### Why They Matter

1. **Prevents Duplicate Content:** If your page is accessible at `/page` and `/page/`, specify the canonical to avoid SEO splits
2. **Parameter Handling:** If you add query params later, canonicals clarify which version to rank
3. **HTTPS vs HTTP:** Ensures the secure version is ranked (if you have both)
4. **WWW vs non-WWW:** If accessible at both www.agentquote.com and agentquote.com, specify one

### Future Scenarios

If you add:
- `https://agentquote.com/estimate?session=123` — canonical to `/estimate`
- `https://agentquote.com/preview` (same content as homepage) — canonical to `/`

---

## 5. Performance SEO & Core Web Vitals

### The Three Core Web Vitals

Google's ranking factors that impact SEO:

1. **LCP (Largest Contentful Paint)** — How fast does the main content appear?
   - Target: < 2.5 seconds
   - Optimization: Preload critical assets, optimize images, minimize JS

2. **FID (First Input Delay)** — How responsive is the page to user input?
   - Target: < 100 ms
   - Replaced by INP in future; AgentQuote's forms are fine here

3. **CLS (Cumulative Layout Shift)** — Does content jump around while loading?
   - Target: < 0.1
   - Optimization: Reserve space for images, fonts, dynamic content

### Server-Side Rendering (Homepage)

**Current State:** `app/page.tsx` is now a **Server Component** (no "use client").

**Why This Helps:**
- Content is pre-rendered on the server
- HTML is sent to the browser immediately
- Crawlers see full content (no JS execution needed)
- LCP is faster (no JS parsing before render)
- SEO boost: 89% of Next.js teams meet CWV on first deployment

**Trade-off:** Email subscription is in a nested client component (`<EmailCaptureHome />`), so:
- Server renders static content (homepage text, links, structure)
- Client hydrates only the interactive form
- Best of both worlds: SEO + interactivity

### Client-Side Rendering (Estimate Page)

`app/estimate/page.tsx` remains `"use client"` because:
- The entire page is interactive (forms, tabs, dynamic calculations)
- No SEO benefit to SSR (no meaningful content without user input)
- Users navigate there intentionally, so initial load SEO matters less

**This is fine because:**
- Users don't search for "/estimate" directly; they start at homepage
- The homepage is what ranks in Google
- Estimate page is a conversion tool, not a landing page

### Font Optimization (next/font)

**What Changed:**

Before:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
```

After:
```typescript
import { Inter, IBM_Plex_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
```

**Benefits:**
- Fonts are self-hosted (no external request to Google)
- Fonts are downloaded with your app bundle
- `display: "swap"` prevents FOUT (Flash of Unstyled Text)
- Automatic subset optimization (Latin only, not all Unicode)
- Faster LCP (one less DNS lookup + request)
- Better privacy (Google doesn't know your users' IP)

**CSS Changes:**
```css
/* Old */
font-family: "Inter", system-ui;

/* New */
font-family: var(--font-inter), system-ui;
```

The CSS variable is automatically injected by next/font.

### Image Optimization

If you add images in the future:

```typescript
// BAD
<img src="/my-image.png" alt="..." />

// GOOD
import Image from "next/image";
<Image
  src="/my-image.png"
  alt="Descriptive alt text"
  width={1200}
  height={630}
  priority // For above-the-fold images
/>
```

**Why:**
- Automatic format conversion (WebP, AVIF)
- Responsive image sizing
- Lazy loading for below-the-fold images
- Better CLS (reserved space prevents layout shift)

---

## 6. Semantic HTML Best Practices

### Current Good Practices

Your site already uses semantic HTML well:

```html
<main>                    <!-- Primary content -->
  <nav>                   <!-- Navigation -->
  <section>               <!-- Thematic grouping -->
  <h1>, <h2>              <!-- Hierarchy -->
  <footer>                <!-- Footer -->
</main>
```

### Improvements Made

1. **Proper heading hierarchy:**
   - `<h1>` on homepage (only one per page): "Know what your AI agents will actually cost"
   - `<h2>` for section titles: "Built from real experiments, not guesses"

2. **Landmark elements:**
   - `<main>` wraps primary content (not nav/footer)
   - `<nav>` for navigation
   - `<footer>` for footer

3. **Article vs Section:**
   - If you add blog posts in the future, wrap them in `<article>`
   - Use `<section>` for thematic grouping (already done correctly)

### Future Semantic Improvements

If you add a blog:
```html
<article>
  <header>
    <h1>Article Title</h1>
    <time datetime="2026-03-01">March 1, 2026</time>
  </header>
  <p>Content...</p>
</article>
```

If you add breadcrumbs:
```html
<nav aria-label="Breadcrumb">
  <ol typeof="BreadcrumbList">
    <li typeof="ListItem"><a href="/">Home</a></li>
    <li typeof="ListItem"><a href="/estimate">Estimate</a></li>
  </ol>
</nav>
```

---

## 7. Meta Tags Checklist

### What's Implemented

In `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  // Basic
  title: "AgentQuote — AI Agent Cost Estimator",
  description: "Estimate how much your AI agent system will cost...",
  applicationName: "AgentQuote",

  // Keywords (note: has low weight today but good for clarity)
  keywords: [...],

  // Author metadata
  authors: [{ name: "Mujeeb", url: "https://x.com/__mujeeb__" }],
  creator: "Mujeeb",

  // Open Graph (for social sharing)
  openGraph: {
    type: "website",
    url: "https://agentquote.com",
    siteName: "AgentQuote",
    title: "...",
    description: "...",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "...",
    description: "...",
    creator: "@__mujeeb__",
  },
};
```

### What's NOT Implemented (Because of Next.js Defaults)

You don't need to manually set these; Next.js handles them:

```typescript
// Already set by Next.js
charset: "utf-8"
viewport: "width=device-width, initial-scale=1"
robots: "index, follow" // Can be overridden if needed
```

### Testing & Validation

1. **Title & Description:**
   - Google Preview Tool: See how your title/description appear in search results
   - Length: Title max 60 chars, Description max 160 chars (they truncate)

2. **Open Graph Tags:**
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

3. **Social Sharing:**
   - Copy/paste your URL on Twitter, LinkedIn, Slack
   - Should show title, description, and image

---

## 8. Implementation Checklist

### Files Created/Modified

- ✓ `app/sitemap.ts` — Dynamic sitemap generation
- ✓ `app/robots.ts` — Crawler rules and rate limiting
- ✓ `app/layout.tsx` — next/font setup + JSON-LD structured data
- ✓ `app/page.tsx` — Server component (better SEO)
- ✓ `app/globals.css` — Updated for next/font variables
- ✓ `components/shared/email-capture-home.tsx` — Client component for interactivity

### Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://agentquote.com
```

### Post-Deployment Checklist

1. **Google Search Console:**
   - [ ] Add property for agentquote.com
   - [ ] Submit sitemap (Google auto-discovers, but good to submit manually)
   - [ ] Verify ownership (DNS, HTML file, or Google tag)
   - [ ] Check Coverage report for crawl errors
   - [ ] Check Core Web Vitals report (after 2-4 weeks of data)

2. **Bing Webmaster Tools:**
   - [ ] Add site
   - [ ] Submit sitemap

3. **Monitoring:**
   - [ ] Use `next/web-vitals` in analytics route to track CWV
   - [ ] Set up Google Analytics 4 (GA4)
   - [ ] Monitor Search Console for ranking drops

4. **Links & Backlinks:**
   - [ ] Backlink to your site from personal website
   - [ ] Tweet launches with link
   - [ ] Submit to directories (Product Hunt, etc.)

### Optional Enhancements

1. **Breadcrumb Schema:**
   ```typescript
   // Add to layout or page
   const breadcrumbSchema = {
     "@context": "https://schema.org",
     "@type": "BreadcrumbList",
     "itemListElement": [...]
   };
   ```

2. **FAQ Schema:**
   - Add if you have FAQ section (see section 3)

3. **Review/Rating Schema:**
   - If you add user testimonials or ratings in future

4. **Article Schema:**
   - If you start a blog or add blog posts

---

## 9. Monitoring & Maintenance

### Monthly Tasks

- [ ] Check Google Search Console for new crawl errors
- [ ] Review Core Web Vitals in Search Console
- [ ] Monitor rankings for key terms (AgentQuote, AI cost estimator, etc.)

### Quarterly Tasks

- [ ] Review robots.txt for new private routes
- [ ] Check JSON-LD validation (no deprecated fields)
- [ ] Analyze competitors' schema implementations
- [ ] Audit page load speed (WebPageTest, GTmetrix)

### Annually

- [ ] Full technical SEO audit
- [ ] Review and update schema.org specs (new versions released)
- [ ] Rebuild sitemaps if structure changes significantly

---

## 10. Troubleshooting

### Issue: Sitemap not appearing at /sitemap.xml

**Solution:**
- Check that `NEXT_PUBLIC_SITE_URL` is set in `.env.local`
- Rebuild and redeploy: `npm run build && npm start`
- Visit `https://yourdomain.com/sitemap.xml` directly

### Issue: JSON-LD validation errors

**Solution:**
- Use https://validator.schema.org/ to check
- Ensure all URLs are absolute (not relative)
- Make sure no syntax errors in JSON (use IDE linter)

### Issue: Canonical URL not showing

**Solution:**
- Check browser dev tools: Inspect `<head>` for `<link rel="canonical">`
- Both layout.tsx and page.tsx metadata should set it

### Issue: Core Web Vitals are poor

**Solution:**
- Check what's slow:
  - **LCP:** Optimize images, preload fonts, remove render-blocking JS
  - **FID:** Reduce main thread work, defer non-critical JS
  - **CLS:** Reserve space for images/forms, use transform not layout changes
- Use PageSpeed Insights: https://pagespeed.web.dev/

---

## References & Resources

### Official Next.js Documentation
- [Metadata — Next.js](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Font Optimization — Next.js](https://nextjs.org/docs/app/getting-started/fonts)
- [Sitemap — Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Robots.txt — Next.js](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [JSON-LD — Next.js](https://nextjs.org/docs/app/guides/json-ld)

### Schema.org
- [WebApplication Schema](https://schema.org/WebApplication)
- [Organization Schema](https://schema.org/Organization)
- [FAQPage Schema](https://schema.org/FAQPage)

### Google Resources
- [Search Central Documentation](https://developers.google.com/search)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Rich Results Test](https://search.google.com/test/rich-results)

### Tools
- Google PageSpeed Insights: https://pagespeed.web.dev/
- Google Search Console: https://search.google.com/search-console
- Schema Validator: https://validator.schema.org/
- SEMrush Site Audit: https://www.semrush.com/

---

## Author Notes

This SEO implementation prioritizes:
1. **Crawlability** — Search engines can find and index your pages
2. **Rankability** — Semantic HTML + structured data tell Google what you're about
3. **Performance** — Fast pages rank higher; next/font and SSR help here
4. **User Experience** — Clean structure helps both humans and bots

All code follows Next.js 14 App Router conventions and is production-ready.
