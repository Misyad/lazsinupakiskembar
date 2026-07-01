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

function TileLogger() {
  const map = useMapEvents({
    tileload: (e) => console.log("[Debug] tile loaded:", e.tile?.src?.slice(0, 60), "size:", e.tile?.naturalWidth),
    tileerror: (e) => console.error("[Debug] tile ERROR:", e.tile?.src?.slice(0, 60), e.error),
    load: () => {
      const c = map.getContainer();
      const r = c.getBoundingClientRect();
      console.log("[Debug] map fully loaded");
      console.log("[Debug] container:", { clientW: c.clientWidth, clientH: c.clientHeight, offsetW: c.offsetWidth, offsetH: c.offsetHeight });
      console.log("[Debug] boundingRect:", r);
      console.log("[Debug] map size:", map.getSize());
      console.log("[Debug] zoom:", map.getZoom());
      console.log("[Debug] center:", map.getCenter());
      console.log("[Debug] bounds:", map.getBounds());
      console.log("[Debug] pixelBounds:", map.getPixelBounds());
    },
  });
  return null;
}

export default function MapSection() {
  return (
    <MapContainer
      center={[-7.955867, 112.707989]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
    >
      <TileLogger />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
        maxZoom={19}
      />
      <Marker position={[-7.955867, 112.707989]}>
        <Popup>Pakiskembar — Debug Point</Popup>
      </Marker>
    </MapContainer>
  );
}
