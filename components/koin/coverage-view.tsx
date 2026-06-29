"use client";
import { useEffect, useState } from "react";
import { MapPin, Users, Boxes, Target, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react";

interface CoverageData {
  coverage: {
    dusun: string; totalKK: number; totalKotak: number; coverage: number;
    totalRt: number; status: string; rwData: { rw: string; totalRt: number; totalKotak: number }[];
    target: number; rekomendasi: string | null;
  }[];
  total: { dusun: number; totalKK: number; totalKotak: number; rataCoverage: number };
}

interface Insight {
  type: string; message: string; severity: string;
}

const statusColors: Record<string, string> = {
  padat: "bg-green-100 text-green-700 border-green-300",
  sedang: "bg-yellow-100 text-yellow-700 border-yellow-300",
  kurang: "bg-orange-100 text-orange-700 border-orange-300",
  prioritas: "bg-red-100 text-red-700 border-red-300",
};

const statusBadges: Record<string, string> = {
  padat: "🟢 Padat",
  sedang: "🟡 Sedang",
  kurang: "🟠 Kurang",
  prioritas: "🔴 Prioritas",
};

export function CoverageView() {
  const [data, setData] = useState<CoverageData | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDusun, setSelectedDusun] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/coverage").then((r) => r.json()),
      fetch("/api/dashboard/recommendation").then((r) => r.json()),
    ]).then(([c, r]) => {
      setData(c);
      setInsights(r.insights || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat data wilayah...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data</div>;

  const filtered = data.coverage.filter(
    (d) => !filter || d.dusun.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <MapPin size={20} className="text-emerald-600" />
          <div>
            <p className="text-xl font-bold">{data.total.dusun}</p>
            <p className="text-xs text-slate-500">Dusun</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <Boxes size={20} className="text-blue-600" />
          <div>
            <p className="text-xl font-bold">{data.total.totalKotak}</p>
            <p className="text-xs text-slate-500">Total Kotak</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <Target size={20} className="text-violet-600" />
          <div>
            <p className="text-xl font-bold">{data.total.rataCoverage}%</p>
            <p className="text-xs text-slate-500">Rata-rata Coverage</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <Users size={20} className="text-amber-600" />
          <div>
            <p className="text-xl font-bold">{data.total.totalKK}</p>
            <p className="text-xs text-slate-500">Total KK</p>
          </div>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-amber-500" />
            <h3 className="font-semibold text-sm text-slate-700">Insight & Rekomendasi</h3>
          </div>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                ins.severity === "critical" ? "bg-red-50 text-red-700" :
                ins.severity === "warning" ? "bg-amber-50 text-amber-700" :
                ins.severity === "success" ? "bg-green-50 text-green-700" :
                "bg-blue-50 text-blue-700"
              }`}>
                {ins.severity === "critical" ? <AlertTriangle size={16} className="mt-0.5 shrink-0" /> :
                 ins.severity === "success" ? <TrendingUp size={16} className="mt-0.5 shrink-0" /> :
                 <Lightbulb size={16} className="mt-0.5 shrink-0" />}
                <span>{ins.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <input
          className="w-full h-10 pl-3 pr-3 rounded-lg border border-slate-200 text-sm"
          placeholder="Cari dusun..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Coverage List */}
      <div className="grid gap-4">
        {filtered.map((d) => (
          <div
            key={d.dusun}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedDusun(selectedDusun === d.dusun ? null : d.dusun)}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[d.status] || statusColors.prioritas}`}>
                  {statusBadges[d.status] || "⚪ Unknown"}
                </span>
                <div>
                  <h4 className="font-semibold text-sm">{d.dusun}</h4>
                  <p className="text-xs text-slate-400">{d.totalRt} RT</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium">{d.totalKotak}</p>
                  <p className="text-[11px] text-slate-400">Kotak</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{d.coverage}%</p>
                  <p className="text-[11px] text-slate-400">Coverage</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{d.totalKK}</p>
                  <p className="text-[11px] text-slate-400">KK</p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  d.status === "padat" ? "bg-green-500" :
                  d.status === "sedang" ? "bg-yellow-500" :
                  d.status === "kurang" ? "bg-orange-500" : "bg-red-500"
                }`} />
              </div>
            </div>

            {/* Expanded RW details */}
            {selectedDusun === d.dusun && (
              <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
                <div className="grid gap-2">
                  {d.rwData.map((rw) => (
                    <div key={rw.rw} className="flex items-center justify-between text-sm px-3 py-2 bg-white rounded-lg">
                      <span className="text-slate-600">RW {rw.rw}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-slate-500">{rw.totalRt} RT</span>
                        <span className="font-medium">{rw.totalKotak} kotak</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Target & Coverage bar */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Target: {d.target} kotak</span>
                    <span>Realisasi: {d.totalKotak} kotak ({d.coverage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        d.coverage >= 10 ? "bg-green-500" :
                        d.coverage >= 5 ? "bg-yellow-500" :
                        d.coverage >= 2 ? "bg-orange-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min((d.coverage / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation */}
                {d.rekomendasi && (
                  <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 rounded-lg text-sm text-red-700">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <span>{d.rekomendasi}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
