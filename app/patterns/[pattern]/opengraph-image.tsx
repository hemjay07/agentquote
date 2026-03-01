import { ImageResponse } from "next/og";
import { PATTERN_PAGES, getPatternPage } from "@/lib/pattern-pages";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return PATTERN_PAGES.map((p) => ({ pattern: p.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ pattern: string }> }) {
  const { pattern: slug } = await params;
  const pattern = getPatternPage(slug);
  const label = pattern?.profile.label ?? slug;
  const low = pattern?.profile.base_calls_low ?? 0;
  const mid = pattern?.profile.base_calls_mid ?? 0;
  const high = pattern?.profile.base_calls_high ?? 0;
  const desc = pattern?.profile.description ?? "";

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
          Architecture Pattern
        </div>
        <div style={{ fontSize: "48px", fontWeight: 700, color: "#f0f0f2", lineHeight: 1.2, letterSpacing: "-1px" }}>
          {label}
        </div>
        <div style={{ fontSize: "20px", color: "#8a8a95", marginTop: "16px", maxWidth: "800px" }}>
          {desc}
        </div>
        <div style={{ display: "flex", gap: "48px", marginTop: "32px" }}>
          {[
            { n: String(low), l: "Low" },
            { n: String(mid), l: "Mid" },
            { n: String(high), l: "High" },
          ].map((s) => (
            <div key={s.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div style={{ fontSize: "32px", fontWeight: 700, color: "#22c55e" }}>{s.n}</div>
              <div style={{ fontSize: "14px", color: "#5a5a65" }}>{s.l} calls</div>
            </div>
          ))}
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
