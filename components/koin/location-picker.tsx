"use client";

import { useEffect, useRef, useState } from "react";
import { SearchAddress } from "./search-address";
import { useCurrentLocation } from "./use-current-location";
import { LocateFixed, MapPin } from "lucide-react";

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

      // Small delay to ensure container has dimensions (fixes mobile layout issues)
      await new Promise((r) => setTimeout(r, 100));

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      });

      // Invalidate size after initialization to fix mobile container issues
      setTimeout(() => map.invalidateSize(), 200);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

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
  useEffect(() => {
    if (!markerRef.current || !ready) return;
    markerRef.current.setLatLng([lat, lng]);
    if (mapInstance.current) {
      mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
    }
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

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={gpsRequest}
          disabled={gpsLoading}
          className="flex items-center gap-2 rounded-[8px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <LocateFixed size={16} />
          {gpsLoading ? "Mendeteksi..." : "Gunakan Lokasi Saya"}
        </button>
        {gpsError && <p className="text-xs text-red-500">{gpsError}</p>}
        <p className="text-xs text-slate-400">Klik peta atau geser marker</p>
      </div>
    </div>
  );
}
