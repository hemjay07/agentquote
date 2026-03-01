import type { MetadataRoute } from "next";
import { getAllBlogSlugs } from "@/lib/blog-posts";
import { getAllModelSlugs } from "@/lib/model-pages";
import { getAllPatternSlugs } from "@/lib/pattern-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://agentquote.vercel.app";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/estimate`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/costs`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/patterns`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const blogPages: MetadataRoute.Sitemap = getAllBlogSlugs().map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const modelPages: MetadataRoute.Sitemap = getAllModelSlugs().map((slug) => ({
    url: `${baseUrl}/costs/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const patternPages: MetadataRoute.Sitemap = getAllPatternSlugs().map((slug) => ({
    url: `${baseUrl}/patterns/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...modelPages, ...patternPages];
}
