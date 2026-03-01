import { ImageResponse } from "next/og";
import { MODEL_PAGES, getModelPage } from "@/lib/model-pages";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return MODEL_PAGES.map((m) => ({ model: m.slug }));
}

export default async function OgImage({ params }: { params: Promise<{ model: string }> }) {
  const { model: slug } = await params;
  const model = getModelPage(slug);
  const label = model?.pricing.label ?? slug;
  const input = model?.pricing.input ?? 0;
  const output = model?.pricing.output ?? 0;

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
          Model Pricing
        </div>
        <div style={{ fontSize: "52px", fontWeight: 700, color: "#f0f0f2", lineHeight: 1.2, letterSpacing: "-1px" }}>
          {label}
        </div>
        <div style={{ display: "flex", gap: "48px", marginTop: "32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "14px", color: "#5a5a65" }}>Input / 1M tokens</div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#22c55e" }}>${input.toFixed(2)}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ fontSize: "14px", color: "#5a5a65" }}>Output / 1M tokens</div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "#22c55e" }}>${output.toFixed(2)}</div>
          </div>
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
