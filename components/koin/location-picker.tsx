"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { SearchAddress } from "./search-address";
import { useCurrentLocation } from "./use-current-location";
import { LocateFixed, MapPin, WifiOff, Loader2 } from "lucide-react";
import { reverseGeocode, type ReverseGeoResult } from "@/lib/reverse-geocode";

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
  onReverseGeocode?: (result: ReverseGeoResult) => void;
  onGeoStatus?: (status: "idle" | "ok" | "error") => void;
  defaultLat?: number;
  defaultLng?: number;
}

const DEF_LAT = -7.5;
const DEF_LNG = 112.5;
const GEOCODE_DEBOUNCE_MS = 600;

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

  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (gps && gpsActive) {
      map.flyTo([gps.latitude, gps.longitude], 17);
      onMove(gps.latitude, gps.longitude);
    }
  }, [gps, gpsActive, map, onMove]);

  return null;
}

// ── Component: syncs external coordinate changes ─────────────────
function CoordinateSyncer({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
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
export function LocationPicker({ latitude, longitude, onChange, onReverseGeocode, defaultLat, defaultLng }: Props) {
  const [lat, setLat] = useState(latitude ?? defaultLat ?? DEF_LAT);
  const [lng, setLng] = useState(longitude ?? defaultLng ?? DEF_LNG);
  const [gpsTrigger, setGpsTrigger] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "ok" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { location: gps, loading: gpsLoading, error: gpsError, request: gpsRequest } = useCurrentLocation();

  const [caching, setCaching] = useState(false);
  const [cacheStatus, setCacheStatus] = useState("");

  const prevCoordGeo = useRef({ lat: 0, lng: 0 });

  // ── Reverse geocode with debounce ─────────────────────────────
  const triggerReverseGeocode = useCallback(
    (clat: number, clng: number) => {
      if (!onReverseGeocode) return;

      // Skip if coordinates barely moved
      const prev = prevCoordGeo.current;
      if (Math.abs(clat - prev.lat) < 0.00005 && Math.abs(clng - prev.lng) < 0.00005) return;
      prevCoordGeo.current = { lat: clat, lng: clng };

      // Debounce
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setGeocoding(true);
        setGeoStatus("idle");
        onGeoStatus?.("idle");
        try {
          const result = await reverseGeocode(clat, clng);
          if (result) {
            onReverseGeocode(result);
            setGeoStatus("ok");
            onGeoStatus?.("ok");
          } else {
            setGeoStatus("error");
            onGeoStatus?.("error");
          }
        } catch {
          setGeoStatus("error");
          onGeoStatus?.("error");
        } finally {
          setGeocoding(false);
        }
      }, GEOCODE_DEBOUNCE_MS);
    },
    [onReverseGeocode, onGeoStatus]
  );

  const handleMove = useCallback(
    (newLat: number, newLng: number) => {
      setLat(newLat);
      setLng(newLng);
      onChange(newLat, newLng);
      triggerReverseGeocode(newLat, newLng);
    },
    [onChange, triggerReverseGeocode]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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
        {geocoding && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <Loader2 size={12} className="animate-spin" /> Mencari alamat...
          </span>
        )}
        {!geocoding && geoStatus === "ok" && (
          <span className="text-xs text-green-600">✅ Alamat ditemukan</span>
        )}
        {!geocoding && geoStatus === "error" && (
          <span className="text-xs text-amber-600">⚠ Isi alamat manual</span>
        )}
      </div>

      {/* Map */}
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
          <CoordinateSyncer lat={lat} lng={lng} />
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
