import { ImageResponse } from "next/og";
import { getBlogPost, BLOG_POSTS } from "@/lib/blog-posts";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  const title = post?.title ?? "AgentQuote Blog";
  const category = post?.category ?? "Article";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#0a0a0b",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: "#22c55e" }} />
        <div style={{ fontSize: "16px", color: "#22c55e", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "24px" }}>
          {category}
        </div>
        <div style={{ fontSize: "48px", fontWeight: 700, color: "#f0f0f2", lineHeight: 1.2, letterSpacing: "-1px", maxWidth: "900px" }}>
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "32px" }}>
          <div style={{ fontSize: "20px", color: "#22c55e", fontWeight: 700 }}>◆</div>
          <div style={{ fontSize: "18px", color: "#8a8a95" }}>AgentQuote</div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", background: "#22c55e" }} />
        <div style={{ position: "absolute", bottom: "24px", right: "32px", fontSize: "16px", color: "#5a5a65" }}>
          agentquote.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
