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
        {/* Top accent bar */}
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

        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
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
          {/* Logo mark */}
          <div
            style={{
              fontSize: "48px",
              color: "#22c55e",
              fontWeight: 700,
            }}
          >
            ◆
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#f0f0f2",
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            Know what your AI agents
          </div>

          <div
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#22c55e",
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            will actually cost
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "24px",
              color: "#8a8a95",
              marginTop: "8px",
            }}
          >
            AI Agent Cost Calculator — Real data, not guesses
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "48px",
              marginTop: "24px",
            }}
          >
            {[
              { num: "8", label: "patterns" },
              { num: "14", label: "formulas" },
              { num: "49%", label: "max savings" },
              { num: "4.8x", label: "overhead found" },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#22c55e",
                  }}
                >
                  {stat.num}
                </div>
                <div style={{ fontSize: "14px", color: "#5a5a65" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent bar */}
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

        {/* URL badge */}
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
