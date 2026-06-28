"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./map-view"), { ssr: false });

export function KoinView() {
  return <MapView />;
}
