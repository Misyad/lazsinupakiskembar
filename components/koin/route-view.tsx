"use client";
import { useEffect, useState } from "react";
import { Plus, Play, CheckCircle2, MapPin, Clock, Route, Navigation, ChevronRight, X } from "lucide-react";

interface Route {
  id: number; petugasId: number; tanggal: string; dusun: string | null;
  jarak: number; estimasi: number; status: string; totalKotak: number;
  selesaiDi: string | null; petugas: { id: number; name: string };
}

interface RouteOrder {
  urutan: number; id: number; name: string; boxNumber: string;
  address: string; latitude: number; longitude: number;
}

export function RouteView() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOrder[] | null>(null);
  const [petugasList, setPetugasList] = useState<{ id: number; name: string }[]>([]);
  const [dusunList, setDusunList] = useState<string[]>([]);
  const [form, setForm] = useState({ petugasId: "", dusun: "", tanggal: new Date().toISOString().split("T")[0] });

  useEffect(() => {
    Promise.all([
      fetch("/api/routes").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()).catch(() => ({ users: [] })),
    ]).then(([r, u]) => {
      setRoutes(r.routes || []);
      setPetugasList((u.users || []).filter((p: any) => p.role === "PETUGAS" || !p.role));
    }).finally(() => setLoading(false));

    // Get dusun list
    fetch("/api/koin/map")
      .then((r) => r.json())
      .then((data) => {
        const dusun = [...new Set((data.features || []).map((f: any) => f.properties?.dusun).filter(Boolean))];
        setDusunList(dusun.sort());
      });
  }, []);

  const generateRoute = async () => {
    if (!form.petugasId || !form.tanggal) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/routes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petugasId: Number(form.petugasId),
          dusun: form.dusun || undefined,
          tanggal: form.tanggal,
        }),
      });
      const data = await res.json();
      if (data.urutan) {
        setSelectedRoute(data.urutan);
        setShowForm(false);
        // Refresh route list
        const r = await fetch("/api/routes").then((r) => r.json());
        setRoutes(r.routes || []);
      }
    } catch {}
    setGenerating(false);
  };

  const startRoute = async (routeId: number) => {
    await fetch("/api/routes/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId }),
    });
    setRoutes((prev) => prev.map((r) => r.id === routeId ? { ...r, status: "on_going" } : r));
  };

  const finishRoute = async (routeId: number) => {
    await fetch("/api/routes/finish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId }),
    });
    setRoutes((prev) => prev.map((r) => r.id === routeId ? { ...r, status: "completed", selesaiDi: new Date().toISOString() } : r));
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      planned: "bg-blue-100 text-blue-700",
      on_going: "bg-amber-100 text-amber-700",
      completed: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-slate-100 text-slate-600";
  };

  const statusLabel: Record<string, string> = {
    planned: "Direncanakan",
    on_going: "Sedang Berjalan",
    completed: "Selesai",
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat rute...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Rute Pengambilan</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
        >
          <Plus size={16} /> Buat Rute Baru
        </button>
      </div>

      {/* Generate Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Buat Rute Baru</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-slate-100 rounded"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Petugas</label>
                <select
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
                  value={form.petugasId}
                  onChange={(e) => setForm({ ...form, petugasId: e.target.value })}
                >
                  <option value="">Pilih petugas...</option>
                  {petugasList.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Dusun (opsional)</label>
                <select
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
                  value={form.dusun}
                  onChange={(e) => setForm({ ...form, dusun: e.target.value })}
                >
                  <option value="">Semua Dusun</option>
                  {dusunList.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Tanggal</label>
                <input
                  type="date"
                  className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                />
              </div>
              <button
                onClick={generateRoute}
                disabled={generating || !form.petugasId}
                className="w-full h-11 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? "Mengoptimalkan..." : "Buat Rute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route result detail */}
      {selectedRoute && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Route size={18} className="text-brand-600" />
              <h3 className="font-semibold text-sm">Rute Optimal</h3>
            </div>
            <button onClick={() => setSelectedRoute(null)} className="text-xs text-slate-400 hover:text-slate-600">
              Tutup
            </button>
          </div>
          <div className="space-y-1">
            {selectedRoute.map((stop) => (
              <div key={stop.urutan} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {stop.urutan}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{stop.boxNumber} — {stop.name}</p>
                  <p className="text-xs text-slate-400 truncate">{stop.address}</p>
                </div>
                <button
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`, "_blank")}
                  className="shrink-0 p-1.5 hover:bg-slate-100 rounded"
                >
                  <Navigation size={14} className="text-slate-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route List */}
      <div className="space-y-3">
        {routes.map((route) => (
          <div key={route.id} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(route.status)}`}>
                  {statusLabel[route.status] || route.status}
                </span>
                <span className="text-sm font-medium">{route.petugas?.name || "—"}</span>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(route.tanggal).toLocaleDateString("id-ID")}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {route.totalKotak} kotak
              </span>
              <span className="flex items-center gap-1">
                <Route size={14} /> {route.jarak.toFixed(1)} km
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} /> {Math.floor(route.estimasi / 60)}j {route.estimasi % 60}m
              </span>
            </div>
            {route.dusun && (
              <p className="text-xs text-slate-400 mt-1">Dusun: {route.dusun}</p>
            )}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
              {route.status === "planned" && (
                <button
                  onClick={() => startRoute(route.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700"
                >
                  <Play size={12} /> Mulai
                </button>
              )}
              {route.status === "on_going" && (
                <button
                  onClick={() => finishRoute(route.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700"
                >
                  <CheckCircle2 size={12} /> Selesai
                </button>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {route.status === "completed" && route.selesaiDi
                  ? `Selesai: ${new Date(route.selesaiDi).toLocaleTimeString("id-ID")}`
                  : `Dibuat: ${new Date(route.createdAt || route.tanggal).toLocaleDateString("id-ID")}`}
              </span>
            </div>
          </div>
        ))}
        {routes.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Route size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Belum ada rute. Buat rute baru untuk mulai.</p>
          </div>
        )}
      </div>
    </div>
  );
}
