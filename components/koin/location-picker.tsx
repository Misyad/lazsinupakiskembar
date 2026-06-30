"use client";

import { useEffect, useRef, useState } from "react";
import { SearchAddress } from "./search-address";
import { useCurrentLocation } from "./use-current-location";
import { LocateFixed, MapPin, Wifi, WifiOff } from "lucide-react";
import { saveTile, getTile, preCacheArea, getCacheInfo } from "@/lib/tile-cache";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  /** Default: Desa. Koordinat untuk default view */
  defaultLat?: number;
  defaultLng?: number;
}

// Default center: Indonesia
const DEF_LAT = -7.5;
const DEF_LNG = 112.5;

export function LocationPicker({ latitude, longitude, onChange, defaultLat, defaultLng }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [caching, setCaching] = useState(false);
  const [cacheStatus, setCacheStatus] = useState("");
  const [lat, setLat] = useState(latitude ?? defaultLat ?? DEF_LAT);
  const [lng, setLng] = useState(longitude ?? defaultLng ?? DEF_LNG);
  const { location: gps, loading: gpsLoading, error: gpsError, request: gpsRequest } = useCurrentLocation();

  // Load Leaflet dynamically (avoid SSR issues)
  useEffect(() => {
    if (typeof window === "undefined") return;

    async function init() {
      const L = await import("leaflet");

      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 60,
      });

      // Invalidate size after initialization to fix mobile container issues
      setTimeout(() => map.invalidateSize(), 200);

      // ESRI Hybrid: Satellite + Reference (jalan, batas)
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "&copy; ESRI", maxZoom: 19 }
      ).addTo(map);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { attribution: "&copy; ESRI", maxZoom: 19 }
      ).addTo(map);

      // Cache tiles as they load (for offline use)
      map.on("tileload", (e: any) => {
        if (e.tile && e.tile.src && e.tile.src.startsWith("http")) {
          const img = e.tile;
          if (img.complete && img.naturalWidth > 0) {
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth || 256;
              canvas.height = img.naturalHeight || 256;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((blob) => {
                  if (blob) saveTile(e.tile.src, blob);
                }, "image/png");
              }
            } catch { /* skip */ }
          }
        }
      });

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        setLat(pos.lat);
        setLng(pos.lng);
        onChange(pos.lat, pos.lng);
      });

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstance.current = map;
      markerRef.current = marker;
      setReady(true);
    }

    init();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update marker position when lat/lng change externally
  const prevCoord = useRef({ lat: 0, lng: 0 });
  useEffect(() => {
    if (!markerRef.current || !ready) return;
    const newLat = lat;
    const newLng = lng;
    // Only re-center if coordinates changed significantly (>50m)
    const prev = prevCoord.current;
    const moved = Math.abs(newLat - prev.lat) > 0.001 || Math.abs(newLng - prev.lng) > 0.001;
    markerRef.current.setLatLng([newLat, newLng]);
    if (moved && mapInstance.current) {
      mapInstance.current.setView([newLat, newLng], mapInstance.current.getZoom());
    }
    prevCoord.current = { lat: newLat, lng: newLng };
  }, [latitude, longitude]);

  // Move to GPS location
  useEffect(() => {
    if (gps && ready && markerRef.current) {
      markerRef.current.setLatLng([gps.latitude, gps.longitude]);
      setLat(gps.latitude);
      setLng(gps.longitude);
      onChange(gps.latitude, gps.longitude);
      if (mapInstance.current) {
        mapInstance.current.setView([gps.latitude, gps.longitude], 17);
      }
    }
  }, [gps]);

  return (
    <div className="space-y-3">
      <SearchAddress onSelect={(lat, lng, label) => {
        setLat(lat);
        setLng(lng);
        onChange(lat, lng);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (mapInstance.current) mapInstance.current.setView([lat, lng], 17);
      }} />

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin size={16} />
        <span>
          {lat.toFixed(6)}, {lng.toFixed(6)}
          {latitude && longitude ? " (tersimpan)" : ""}
        </span>
      </div>

      <div ref={mapRef} className="h-72 w-full rounded-[8px] border border-slate-200 overflow-hidden z-0" />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={gpsRequest}
          disabled={gpsLoading}
          className="flex items-center gap-2 rounded-[8px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <LocateFixed size={16} />
          {gpsLoading ? "Mendeteksi..." : "Gunakan Lokasi Saya"}
        </button>
        <div className="flex items-center gap-2">
          {cacheStatus && (
            <span className="text-xs text-slate-500">{cacheStatus}</span>
          )}
          <button
            type="button"
            onClick={async () => {
              setCaching(true);
              setCacheStatus("Meng-cache peta...");
              const count = await preCacheArea(lat, lng, 13, 19);
              setCacheStatus(`✅ ${count} tile tersimpan untuk offline`);
              setCaching(false);
            }}
            disabled={caching}
            className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {caching ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <WifiOff size={14} />
            )}
            {caching ? "Menyimpan..." : "Simpan Peta Offline"}
          </button>
        </div>
      </div>
      {gpsError && <p className="text-xs text-red-500">{gpsError}</p>}
    </div>
  );
}
