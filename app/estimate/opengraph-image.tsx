import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#22c55e",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            textAlign: "center",
            padding: "0 60px",
          }}
        >
          <div style={{ fontSize: "48px", color: "#22c55e", fontWeight: 700 }}>
            ◆
          </div>

          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#f0f0f2",
              letterSpacing: "-1px",
              lineHeight: 1.15,
            }}
          >
            Calculate Your AI Agent Costs
          </div>

          <div
            style={{
              fontSize: "24px",
              color: "#8a8a95",
              marginTop: "8px",
              maxWidth: "800px",
            }}
          >
            Describe your system. Get low/mid/high cost scenarios with
            optimization suggestions in 60 seconds.
          </div>

          <div
            style={{
              marginTop: "24px",
              background: "#22c55e",
              color: "#0a0a0b",
              padding: "16px 40px",
              borderRadius: "12px",
              fontSize: "22px",
              fontWeight: 600,
            }}
          >
            Free — No signup required
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#22c55e",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "24px",
            right: "32px",
            fontSize: "16px",
            color: "#5a5a65",
          }}
        >
          agentquote.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
