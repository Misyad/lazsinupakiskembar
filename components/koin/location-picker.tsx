"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SearchAddress } from "./search-address";
import { useCurrentLocation } from "./use-current-location";
import { LocateFixed, MapPin, WifiOff } from "lucide-react";
import { saveTile, preCacheArea } from "@/lib/tile-cache";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
}

const DEF_LAT = -7.5;
const DEF_LNG = 112.5;

export function LocationPicker({ latitude, longitude, onChange, defaultLat, defaultLng }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const prevCoordRef = useRef({ lat: 0, lng: 0 });

  const [ready, setReady] = useState(false);
  const [caching, setCaching] = useState(false);
  const [cacheStatus, setCacheStatus] = useState("");
  const [lat, setLat] = useState(latitude ?? defaultLat ?? DEF_LAT);
  const [lng, setLng] = useState(longitude ?? defaultLng ?? DEF_LNG);
  const { location: gps, loading: gpsLoading, error: gpsError, request: gpsRequest } = useCurrentLocation();

  // Invalidate map size — called on every container resize
  const invalidateSize = useCallback(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
  }, []);

  // Observe container size changes and invalidate map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Wait until container has dimensions before initializing map
    if (container.clientWidth === 0 || container.clientHeight === 0) return;

    // Create ResizeObserver to keep map in sync with container
    const ro = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    ro.observe(container);
    resizeObserverRef.current = ro;

    return () => {
      ro.disconnect();
      resizeObserverRef.current = null;
    };
  }, []);

  // Watch window resize for browser chrome/orientation changes
  useEffect(() => {
    window.addEventListener("resize", invalidateSize);
    return () => window.removeEventListener("resize", invalidateSize);
  }, [invalidateSize]);

  // Initialize Leaflet map once (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const container = mapContainerRef.current;
    if (!container) return;
    // Don't init twice
    if (mapInstanceRef.current) return;

    let map: any = null;
    let observer: ResizeObserver | null = null;

    async function initMap() {
      const L = await import("leaflet");

      // Fix default marker icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(container, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        zoomSnap: 1,
        zoomDelta: 1,
        attributionControl: true,
      });

      // ESRI Hybrid: Satellite + Reference overlay
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "&copy; Esri", maxZoom: 19 }
      ).addTo(map);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        { attribution: "&copy; Esri", maxZoom: 19 }
      ).addTo(map);

      // Marker
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

      // Cache tiles for offline
      map.on("tileload", (e: any) => {
        if (e.tile?.src?.startsWith("http") && e.tile.complete && e.tile.naturalWidth > 0) {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = e.tile.naturalWidth || 256;
            canvas.height = e.tile.naturalHeight || 256;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(e.tile, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) saveTile(e.tile.src, blob);
              }, "image/png");
            }
          } catch { /* ignore */ }
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      setReady(true);

      // Invalidate after mount to ensure correct sizing
      map.invalidateSize();

      // Re-check on next frame for layout shifts (no arbitrary delay)
      requestAnimationFrame(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
    }

    initMap();

    return () => {
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker when lat/lng change externally (e.g., search or GPS)
  useEffect(() => {
    if (!markerRef.current || !ready) return;
    const newLat = lat;
    const newLng = lng;
    const prev = prevCoordRef.current;
    const moved = Math.abs(newLat - prev.lat) > 0.0005 || Math.abs(newLng - prev.lng) > 0.0005;

    markerRef.current.setLatLng([newLat, newLng]);
    if (moved && mapInstanceRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], mapInstanceRef.current.getZoom());
    }
    prevCoordRef.current = { lat: newLat, lng: newLng };
  }, [latitude, longitude, ready, lat, lng]);

  // Move to GPS location
  useEffect(() => {
    if (gps && ready && markerRef.current) {
      markerRef.current.setLatLng([gps.latitude, gps.longitude]);
      setLat(gps.latitude);
      setLng(gps.longitude);
      onChange(gps.latitude, gps.longitude);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([gps.latitude, gps.longitude], 17);
      }
    }
  }, [gps, ready, onChange]);

  return (
    <div className="space-y-3">
      <SearchAddress onSelect={(lat, lng, label) => {
        setLat(lat);
        setLng(lng);
        onChange(lat, lng);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (mapInstanceRef.current) mapInstanceRef.current.setView([lat, lng], 17);
      }} />

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin size={16} />
        <span>
          {lat.toFixed(6)}, {lng.toFixed(6)}
          {latitude && longitude ? " (tersimpan)" : ""}
        </span>
      </div>

      {/* Map container with explicit size and containment */}
      <div
        ref={mapContainerRef}
        className="h-72 w-full rounded-[8px] border border-slate-200 overflow-hidden relative"
        style={{ contain: "strict" }}
      />

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
