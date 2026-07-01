"use client";

import dynamic from "next/dynamic";

// React Leaflet requires browser — disable SSR
const MapSection = dynamic(() => import("./map-section"), { ssr: false });

export default function DebugMapPage() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapSection />
    </div>
  );
}
