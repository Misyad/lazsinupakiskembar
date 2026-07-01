"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SearchAddress } from "./search-address";
import { useCurrentLocation } from "./use-current-location";
import { LocateFixed, MapPin, WifiOff } from "lucide-react";

// ── One-time icon fix ────────────────────────────────────────────
const defaultIcon = L.icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ── Types ────────────────────────────────────────────────────────
interface Props {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
}

const DEF_LAT = -7.5;
const DEF_LNG = 112.5;

// ── Component: reacts to map events ──────────────────────────────
function MapController({
  onMove,
  gps,
  gpsActive,
}: {
  onMove: (lat: number, lng: number) => void;
  gps: { latitude: number; longitude: number } | null;
  gpsActive: boolean;
}) {
  const map = useMap();

  // Click to set marker
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  // GPS: fly to location
  useEffect(() => {
    if (gps && gpsActive) {
      map.flyTo([gps.latitude, gps.longitude], 17);
    }
  }, [gps, gpsActive, map]);

  return null;
}

// ── Component: syncs external coordinate changes ─────────────────
function CoordinateSyncer({
  lat,
  lng,
  onChange,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const map = useMap();
  const prevRef = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    const prev = prevRef.current;
    const moved = Math.abs(lat - prev.lat) > 0.0005 || Math.abs(lng - prev.lng) > 0.0005;
    if (moved) {
      map.setView([lat, lng], map.getZoom());
    }
    prevRef.current = { lat, lng };
  }, [lat, lng, map]);

  return null;
}

// ── Main component ───────────────────────────────────────────────
export function LocationPicker({ latitude, longitude, onChange, defaultLat, defaultLng }: Props) {
  const [lat, setLat] = useState(latitude ?? defaultLat ?? DEF_LAT);
  const [lng, setLng] = useState(longitude ?? defaultLng ?? DEF_LNG);
  const [gpsTrigger, setGpsTrigger] = useState(false);
  const { location: gps, loading: gpsLoading, error: gpsError, request: gpsRequest } = useCurrentLocation();

  const [caching, setCaching] = useState(false);
  const [cacheStatus, setCacheStatus] = useState("");

  // When GPS responds, trigger flyTo
  useEffect(() => {
    if (gps && gpsTrigger) {
      setLat(gps.latitude);
      setLng(gps.longitude);
      onChange(gps.latitude, gps.longitude);
      setGpsTrigger(false);
    }
  }, [gps, gpsTrigger, onChange]);

  const handleMove = useCallback(
    (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      onChange(newLat, newLng);
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      <SearchAddress
        onSelect={(sLat, sLng) => {
          handleMove(sLat, sLng);
        }}
      />

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin size={16} />
        <span>
          {lat.toFixed(6)}, {lng.toFixed(6)}
          {latitude && longitude ? " (tersimpan)" : ""}
        </span>
      </div>

      {/* Map — identical pattern to /debug-map */}
      <div className="h-72 w-full rounded-[8px] border border-slate-200 overflow-hidden">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
            maxZoom={18}
          />
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri"
            maxZoom={18}
          />

          <Marker
            position={[lat, lng]}
            icon={defaultIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const m = e.target;
                const pos = m.getLatLng();
                handleMove(pos.lat, pos.lng);
              },
            }}
          />

          <MapController onMove={handleMove} gps={gps} gpsActive={gpsTrigger} />
          <CoordinateSyncer lat={lat} lng={lng} onChange={handleMove} />
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            setGpsTrigger(true);
            gpsRequest();
          }}
          disabled={gpsLoading}
          className="flex items-center gap-2 rounded-[8px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <LocateFixed size={16} />
          {gpsLoading ? "Mendeteksi..." : "Gunakan Lokasi Saya"}
        </button>

        <div className="flex items-center gap-2">
          {cacheStatus && <span className="text-xs text-slate-500">{cacheStatus}</span>}
          <button
            type="button"
            onClick={async () => {
              setCaching(true);
              setCacheStatus("Meng-cache peta...");
              const { preCacheArea } = await import("@/lib/tile-cache");
              const count = await preCacheArea(lat, lng, 13, 18);
              setCacheStatus(`✅ ${count} tile tersimpan untuk offline`);
              setCaching(false);
            }}
            disabled={caching}
            className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {caching ? <span className="animate-spin">⏳</span> : <WifiOff size={14} />}
            {caching ? "Menyimpan..." : "Simpan Peta Offline"}
          </button>
        </div>
      </div>
      {gpsError && <p className="text-xs text-red-500">{gpsError}</p>}
    </div>
  );
}
