"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Search, Filter, Layers, MapIcon, List, X } from "lucide-react";
import { MapStats } from "./map-stats";
import { MapFilter } from "./map-filter";
import { HouseDetailPanel } from "./house-detail-panel";

export interface HouseFeature {
  id: number;
  name: string;
  address: string;
  rt: string;
  rw: string;
  dusun: string;
  phone: string | null;
  active: boolean;
  boxNumber: string | null;
  boxStatus: string | null;
  lastWithdrawal: string | null;
  lastAmount: number | null;
  status: string;
  latitude: number;
  longitude: number;
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerClusterRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const heatmapRef = useRef<any>(null);
  const [houses, setHouses] = useState<HouseFeature[]>([]);
  const [filtered, setFiltered] = useState<HouseFeature[]>([]);
  const [selected, setSelected] = useState<HouseFeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ dusun: "", rt: "", rw: "", status: "" });

  // Fetch data
  useEffect(() => {
    fetch("/api/koin/map")
      .then((r) => r.json())
      .then((data) => {
        const items = (data.features || []).map((f: any) => ({
          id: f.id,
          ...f.properties,
          latitude: f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
        }));
        setHouses(items);
        setFiltered(items);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter logic
  useEffect(() => {
    let result = [...houses];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q) ||
          h.boxNumber?.toLowerCase().includes(q) ||
          h.dusun.toLowerCase().includes(q)
      );
    }
    if (filters.dusun) result = result.filter((h) => h.dusun === filters.dusun);
    if (filters.rt) result = result.filter((h) => h.rt === filters.rt);
    if (filters.rw) result = result.filter((h) => h.rw === filters.rw);
    if (filters.status) result = result.filter((h) => h.status === filters.status);
    setFiltered(result);
  }, [houses, search, filters]);

  // Initialize map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || mapInstance.current) return;

    async function init() {
      const L = await import("leaflet");

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: [-7.5, 112.5],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      mapInstance.current = map;
      renderMarkers(L, map, filtered);
    }

    init();
    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Re-render markers when filtered data changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const L = (window as any).L;
    if (L) renderMarkers(L, mapInstance.current, filtered);
  }, [filtered]);

  const renderMarkers = useCallback(async (L: any, map: any, data: HouseFeature[]) => {
    // Clear existing markers
    if (markerClusterRef.current) {
      map.removeLayer(markerClusterRef.current);
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (heatmapRef.current) {
      map.removeLayer(heatmapRef.current);
      heatmapRef.current = null;
    }

    if (data.length === 0) return;

    // Try to load MarkerCluster
    let MarkerClusterGroup: any;
    try {
      const mod = await import("leaflet.markercluster");
      MarkerClusterGroup = mod.MarkerClusterGroup || (window as any).L?.MarkerClusterGroup;
    } catch {
      MarkerClusterGroup = null;
    }

    const markers = MarkerClusterGroup ? new MarkerClusterGroup({ chunkedLoading: true }) : null;
    const colors: Record<string, string> = {
      active: "#22c55e",
      inactive: "#6b7280",
      unassigned: "#f59e0b",
    };

    data.forEach((house) => {
      const color = colors[house.status] || colors.active;
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="width:24px;height:24px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([house.latitude, house.longitude], { icon });
      marker.bindPopup(`
        <div style="font-family:sans-serif;min-width:200px">
          <p style="font-weight:600;margin:0 0 4px">${house.boxNumber || "—"}</p>
          <p style="margin:0 0 2px;font-size:13px">${house.name}</p>
          <p style="margin:0 0 2px;font-size:12px;color:#666">${house.address}</p>
          <p style="margin:0 0 4px;font-size:12px;color:#666">RT ${house.rt} / RW ${house.rw}</p>
          <button onclick="window.dispatchEvent(new CustomEvent('select-house',{detail:${house.id}}))"
            style="background:#166534;color:white;border:none;padding:4px 12px;border-radius:6px;font-size:12px;cursor:pointer">
            Detail
          </button>
        </div>
      `);
      marker.on("click", () => setSelected(house));

      if (markers) markers.addLayer(marker);
      else markersRef.current.push(marker);
    });

    if (markers) {
      map.addLayer(markers);
      markerClusterRef.current = markers;
    } else {
      markersRef.current.forEach((m) => map.addLayer(m));
    }

    // Fit bounds
    if (data.length > 0 && data.length < 500) {
      const bounds = L.latLngBounds(data.map((h: HouseFeature) => [h.latitude, h.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, []);

  // Listen for custom event from popup
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const house = filtered.find((h) => h.id === e.detail);
      if (house) setSelected(house);
    };
    window.addEventListener("select-house" as any, handler as any);
    return () => window.removeEventListener("select-house" as any, handler as any);
  }, [filtered]);

  const dusunList = [...new Set(houses.map((h) => h.dusun).filter(Boolean))].sort();
  const rtList = [...new Set(houses.map((h) => h.rt).filter(Boolean))].sort();
  const rwList = [...new Set(houses.map((h) => h.rw).filter(Boolean))].sort();

  return (
    <div className="relative h-[calc(100vh-6rem)] w-full flex flex-col">
      {/* Stats bar */}
      <MapStats houses={filtered} allHouses={houses} />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 text-sm"
            placeholder="Cari nama, alamat, atau nomor kotak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-1.5 h-10 px-3 rounded-lg border text-sm transition-colors ${
            showFilter ? "bg-brand-50 border-brand-300 text-brand-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Filter size={16} /> Filter
        </button>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`flex items-center gap-1.5 h-10 px-3 rounded-lg border text-sm transition-colors ${
            showHeatmap ? "bg-orange-50 border-orange-300 text-orange-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Layers size={16} /> {showHeatmap ? "Marker" : "Heatmap"}
        </button>
        <span className="text-sm text-slate-500">
          {filtered.length} / {houses.length} kotak
        </span>
      </div>

      {/* Filter sidebar */}
      {showFilter && (
        <MapFilter
          dusunList={dusunList}
          rtList={rtList}
          rwList={rwList}
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <p className="text-slate-500">Memuat peta...</p>
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* Detail Panel */}
      {selected && (
        <HouseDetailPanel house={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
