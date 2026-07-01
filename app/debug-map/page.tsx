"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const MapSection = dynamic(() => import("./map-section"), { ssr: false });

// ── Feature toggles ──────────────────────────────────────────────
interface Features {
  layout: boolean;
  card: boolean;
  responsiveGrid: boolean;
  overflowHidden: boolean;
  transform: boolean;
  contain: boolean;
  flexCentered: boolean;
  fixedHeight: boolean;
}

export default function DebugMapPage() {
  const [f, setF] = useState<Features>({
    layout: false,
    card: false,
    responsiveGrid: false,
    overflowHidden: false,
    transform: false,
    contain: false,
    flexCentered: false,
    fixedHeight: false,
  });

  const toggle = (k: keyof Features) => setF((p) => ({ ...p, [k]: !p[k] }));

  useEffect(() => {
    // Log active features
    const active = Object.entries(f).filter(([, v]) => v).map(([k]) => k);
    console.log("[Debug] active features:", active.join(", ") || "none (baseline)");
  }, [f]);

  // ── Build wrapper styles based on active toggles ──────────────
  let wrapperStyle: React.CSSProperties = {
    height: "100vh",
    width: "100%",
    position: "relative",
  };

  let innerStyle: React.CSSProperties = {
    height: "100%",
    width: "100%",
  };

  if (f.layout) {
    wrapperStyle = { ...wrapperStyle, display: "flex", flexDirection: "column" as const };
    innerStyle = { ...innerStyle, flex: 1 };
  }
  if (f.card) {
    innerStyle = {
      ...innerStyle,
      margin: "16px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
    };
  }
  if (f.responsiveGrid) {
    wrapperStyle = { ...wrapperStyle, display: "grid", gridTemplateRows: "auto 1fr auto" };
  }
  if (f.overflowHidden) {
    wrapperStyle = { ...wrapperStyle, overflow: "hidden" };
  }
  if (f.transform) {
    wrapperStyle = { ...wrapperStyle, transform: "translateZ(0)" };
  }
  if (f.contain) {
    wrapperStyle = { ...wrapperStyle, contain: "strict" as any };
  }
  if (f.flexCentered) {
    wrapperStyle = { ...wrapperStyle, display: "flex", alignItems: "center", justifyContent: "center" };
    innerStyle = { ...innerStyle, maxWidth: "600px", maxHeight: "400px" };
  }
  if (f.fixedHeight) {
    innerStyle = { ...innerStyle, height: "288px" }; // h-72
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Toolbar */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999,
        background: "#1e293b", color: "#f1f5f9", padding: "8px 12px",
        display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "12px",
      }}>
        {([
          ["layout", "Layout (flex col)"],
          ["card", "Card (margin + border)"],
          ["responsiveGrid", "Grid (auto/1fr/auto)"],
          ["overflowHidden", "Overflow hidden"],
          ["transform", "TranslateZ(0)"],
          ["contain", "Contain strict"],
          ["flexCentered", "Flex centered"],
          ["fixedHeight", "Fixed h-72 (288px)"],
        ] as const).map(([key, label]) => (
          <label key={key} style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
            <input type="checkbox" checked={f[key]} onChange={() => toggle(key)} />
            {label}
          </label>
        ))}
      </div>

      {/* Map area */}
      <div style={wrapperStyle}>
        {f.responsiveGrid && <div style={{ height: "40px", background: "#f1f5f9" }}>Header</div>}
        <div style={innerStyle}>
          <MapSection />
        </div>
        {f.responsiveGrid && <div style={{ height: "40px", background: "#f1f5f9" }}>Footer</div>}
      </div>
    </div>
  );
}
