import React from "react";

export default function KaibaWeb() {
  return (
    <div
      style={{
        width: "100%",
        height: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: 120,
          fontWeight: "bold",
          fontFamily: "var(--font-heading, sans-serif)",
          letterSpacing: 2,
          textAlign: "center",
          width: "100%",
          background:
            "linear-gradient(90deg, #b2d7fe, #aad3fe, #c2e0fe, #dbecff, #9acbfe, #d3e8ff, #92c7fe, #cbe4fe, #badcfe, #a2cffe, #00f0ff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
          textShadow: "0 2px 8px rgba(0,0,0,0.10)",
          userSelect: "none",
        }}
      >
        Kaiba
      </span>
    </div>
  );
}
