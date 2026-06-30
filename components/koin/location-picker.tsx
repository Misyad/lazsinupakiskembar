"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { SearchAddress } from "./search-address";
import { useCurrentLocation } from "./use-current-location";
import { LocateFixed, MapPin, WifiOff } from "lucide-react";
import { saveTile } from "@/lib/tile-cache";
import { ESRI_MAX_ZOOM } from "@/lib/tile-cache";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  onChange: (lat: number, lng: number) => void;
  defaultLat?: number;
  defaultLng?: number;
}

const DEF_LAT = -7.5;
const DEF_LNG = 112.5;

// Debug logger — active only on localhost or with ?debug=map in URL
const debug = typeof window !== "undefined" && (location.hostname === "localhost" || location.search.includes("debug=map"))
  ? (...args: unknown[]) => console.debug("[Map]", ...args)
  : () => {};

export function LocationPicker({ latitude, longitude, onChange, defaultLat, defaultLng }: Props) {
  // ── Debug: disable cache with ?nocache ──────────────────────────
  // Set to true to bypass IndexedDB entirely for comparison
  const CACHE_ENABLED = typeof window !== "undefined"
    ? !location.search.includes("nocache")
    : true;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const prevCoordRef = useRef({ lat: 0, lng: 0 });

  const [ready, setReady] = useState(false);
  const [caching, setCaching] = useState(false);
  const [cacheStatus, setCacheStatus] = useState("");
  const [lat, setLat] = useState(latitude ?? defaultLat ?? DEF_LAT);
  const [lng, setLng] = useState(longitude ?? defaultLng ?? DEF_LNG);
  const { location: gps, loading: gpsLoading, error: gpsError, request: gpsRequest } = useCurrentLocation();

  // ── Resize handling ────────────────────────────────────────────
  const invalidate = useCallback(() => {
    if (mapRef.current) {
      const size = mapRef.current.getSize();
      debug("invalidateSize — current map size:", size.x, "x", size.y);
      mapRef.current.invalidateSize();
    }
  }, []);

  // ResizeObserver: keep map synced when container changes size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.clientWidth === 0 || el.clientHeight === 0) {
      debug("container has zero size — skipping ResizeObserver");
      return;
    }

    const ro = new ResizeObserver(() => {
      debug("ResizeObserver fired — container:", el.clientWidth, "x", el.clientHeight);
      invalidate();
    });
    ro.observe(el);

    // Also observe any parent that may collapse/expand (sidebar, etc.)
    ro.observe(document.getElementById("__next") || document.body);

    return () => ro.disconnect();
  }, [invalidate]);

  // Window resize (orientation change etc.)
  useEffect(() => {
    window.addEventListener("resize", invalidate);
    return () => window.removeEventListener("resize", invalidate);
  }, [invalidate]);

  // ── Map initialisation (once) ──────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    // Guard: container must have size before initialising
    if (el.clientWidth === 0 || el.clientHeight === 0) {
      debug("container still has zero size — deferring map init");
      return;
    }

    debug("container is", el.clientWidth, "x", el.clientHeight, "— starting map init");

    let map: any = null;
    let destroyed = false;

    (async () => {
      const L = await import("leaflet");

      // ── Log tile loading ──────────────────────────────────────
      // Monkey-patch L.TileLayer._loadTile to trace failures
      const origLoad = (L.TileLayer.prototype as any)._loadTile;
      (L.TileLayer.prototype as any)._loadTile = function (tile: any, tilePoint: any) {
        tile.onerror = () => debug("tile error:", tile.src);
        tile.onload = () => debug("tile loaded:", tile.src.substring(0, 60));
        return origLoad.call(this, tile, tilePoint);
      };

      // ── Fix default icon ──────────────────────────────────────
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      map = L.map(el, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      });

      debug("L.map created — size before tiles:", map.getSize().x, "x", map.getSize().y);

      // ── ESRI Satellite (base) ──────────────────────────────────
      const sat = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "&copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: ESRI_MAX_ZOOM,
          crossOrigin: "anonymous",
        }
      );
      map.addLayer(sat);
      debug("satellite layer added — maxZoom:", ESRI_MAX_ZOOM);

      // ── ESRI Reference (overlay) ───────────────────────────────
      const ref = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "&copy; Esri",
          maxZoom: ESRI_MAX_ZOOM,
          crossOrigin: "anonymous",
        }
      );
      map.addLayer(ref);
      debug("reference layer added — maxZoom:", ESRI_MAX_ZOOM);

      // ── Marker ─────────────────────────────────────────────────
      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
      marker.on("dragend", () => {
        const p = marker.getLatLng();
        setLat(p.lat);
        setLng(p.lng);
        onChange(p.lat, p.lng);
      });
      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        setLat(e.latlng.lat);
        setLng(e.latlng.lng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      // ── Offline caching + detailed tile logging ────────────────
      // Each log line: REQUEST → CACHE HIT/MISS → FETCH → STATUS → SIZE → STORED
      map.on("tileloadstart", (e: any) => {
        debug("TILE REQUEST:", e.tile?.src?.substring(0, 80));
      });

      map.on("tileload", (e: any) => {
        const url = e.tile?.src;
        if (!url?.startsWith("http")) return;

        const status = e.tile?.complete ? "loaded" : "?";
        const w = e.tile?.naturalWidth || 0;
        debug(`TILE LOADED — ${status} ${w}px url=${url.substring(0, 60)}`);

        if (!CACHE_ENABLED) {
          debug("TILE CACHE DISABLED — skipping save");
          return;
        }

        // Fetch via XHR (not canvas — avoids CORS taint on Safari)
        fetch(url, { mode: "cors" })
          .then((r) => {
            debug(`TILE FETCH — status=${r.status} type=${r.headers.get("content-type")} size=${r.headers.get("content-length") || "?"} url=${url.substring(0, 60)}`);
            if (!r.ok) {
              debug("TILE FETCH FAILED — not caching");
              return null;
            }
            return r.blob();
          })
          .then((blob) => {
            if (!blob) return;
            debug(`TILE CACHE SAVE — blob: type=${blob.type} size=${blob.size} url=${url.substring(0, 60)}`);
            saveTile(url, blob, "tileload");
          })
          .catch((err) => {
            debug("TILE FETCH ERROR:", err, "url=", url.substring(0, 60));
          });
      });

      // Log tile errors (404, timeout, CORS, etc.)
      map.on("tileerror", (e: any) => {
        const url = e.tile?.src || e.url || "?";
        debug("TILE ERROR:", e.error?.message || e.error || "unknown", "url=", url.substring(0, 80));
      });

      // ── Store refs ────────────────────────────────────────────
      mapRef.current = map;
      markerRef.current = marker;
      setReady(true);

      debug("map init complete — final size:", map.getSize().x, "x", map.getSize().y);

      // Double-check on next frame (catches late layout shifts)
      requestAnimationFrame(() => {
        if (destroyed) return;
        debug("rAF invalidateSize — size:", map.getSize().x, "x", map.getSize().y);
        map.invalidateSize();
      });
    })();

    return () => {
      destroyed = true;
      if (map) {
        debug("map cleanup");
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── External coordinate sync ───────────────────────────────────
  useEffect(() => {
    if (!markerRef.current || !ready) return;
    const p = prevCoordRef.current;
    const moved = Math.abs(lat - p.lat) > 0.0005 || Math.abs(lng - p.lng) > 0.0005;
    markerRef.current.setLatLng([lat, lng]);
    if (moved && mapRef.current) mapRef.current.setView([lat, lng], mapRef.current.getZoom());
    prevCoordRef.current = { lat, lng };
  }, [latitude, longitude, ready, lat, lng]);

  // ── GPS ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!gps || !ready || !markerRef.current) return;
    markerRef.current.setLatLng([gps.latitude, gps.longitude]);
    setLat(gps.latitude);
    setLng(gps.longitude);
    onChange(gps.latitude, gps.longitude);
    if (mapRef.current) mapRef.current.setView([gps.latitude, gps.longitude], 17);
  }, [gps, ready, onChange]);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <SearchAddress
        onSelect={(lat, lng) => {
          setLat(lat); setLng(lng); onChange(lat, lng);
          markerRef.current?.setLatLng([lat, lng]);
          mapRef.current?.setView([lat, lng], 17);
        }}
      />

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <MapPin size={16} />
        <span>{lat.toFixed(6)}, {lng.toFixed(6)}{latitude && longitude ? " (tersimpan)" : ""}</span>
      </div>

      {/* Map container — explicit dimensions, no contain:strict (breaks Safari) */}
      <div
        ref={containerRef}
        className="h-72 w-full rounded-[8px] border border-slate-200 overflow-hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button type="button" onClick={gpsRequest} disabled={gpsLoading}
          className="flex items-center gap-2 rounded-[8px] bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
          <LocateFixed size={16} />
          {gpsLoading ? "Mendeteksi..." : "Gunakan Lokasi Saya"}
        </button>
        <div className="flex items-center gap-2">
          {cacheStatus && <span className="text-xs text-slate-500">{cacheStatus}</span>}
          <button type="button" onClick={async () => {
            setCaching(true); setCacheStatus("Meng-cache peta...");
            const { preCacheArea } = await import("@/lib/tile-cache");
            const count = await preCacheArea(lat, lng, 13, 19);
            setCacheStatus(`✅ ${count} tile tersimpan untuk offline`);
            setCaching(false);
          }} disabled={caching}
            className="flex items-center gap-2 rounded-[8px] border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            {caching ? <span className="animate-spin">⏳</span> : <WifiOff size={14} />}
            {caching ? "Menyimpan..." : "Simpan Peta Offline"}
          </button>
        </div>
      </div>
      {gpsError && <p className="text-xs text-red-500">{gpsError}</p>}
    </div>
  );
}
