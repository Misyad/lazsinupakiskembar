"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickLogger() {
  useMapEvents({
    click: (e) => console.log("[DebugMap] clicked:", e.latlng),
    tileload: (e) => console.log("[DebugMap] tile loaded:", e.tile?.src?.slice(0, 60)),
    tileerror: (e) => console.error("[DebugMap] tile error:", e.tile?.src?.slice(0, 60)),
  });
  return null;
}

export default function DebugMapPage() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={[-7.955867, 112.707989]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <ClickLogger />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
          maxZoom={19}
        />
        <Marker position={[-7.955867, 112.707989]}>
          <Popup>Pakiskembar — Debug Point</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
