"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Boxes, Home, Wallet, AlertTriangle, Target, UserRound, Clock, DollarSign } from "lucide-react";

interface Analytics {
  kpi: {
    totalAktif: number; totalKotak: number; kotakBaru: number; kotakNonaktif: number;
    belumDiambil: number; avgPerolehan: number; totalNominalBulanIni: number; totalNominalTahunIni: number;
    persentaseTepatWaktu: number;
  };
  topWilayah: { name: string; total: number }[];
  petugasTeraktif: { name: string; total: number; role: string }[];
  charts: {
    monthlyGrowth: number[];
    monthlyRevenue: number[];
    statusDistribution: { status: string; count: number }[];
  };
}

export function DashboardAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data</div>;

  const { kpi, charts } = data;
  const maxGrowth = Math.max(...charts.monthlyGrowth, 1);
  const maxRevenue = Math.max(...charts.monthlyRevenue, 1);
  const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Boxes} label="Total Kotak Aktif" value={kpi.totalAktif} subtitle={`${kpi.kotakBaru} baru bulan ini`} color="emerald" />
        <KpiCard icon={Wallet} label="Pemasukan Bulan Ini" value={`Rp ${(kpi.totalNominalBulanIni / 1000).toFixed(1)}rb`} subtitle={`Rp ${(kpi.totalNominalTahunIni / 1e6).toFixed(1)}jt tahun ini`} color="blue" />
        <KpiCard icon={AlertTriangle} label="Belum Diambil" value={kpi.belumDiambil} subtitle={`${kpi.kotakNonaktif} nonaktif`} color="amber" />
        <KpiCard icon={Target} label="Rata-rata Perolehan" value={`Rp ${kpi.avgPerolehan.toLocaleString("id-ID")}`} subtitle={`Tepat waktu: ${kpi.persentaseTepatWaktu}%`} color="violet" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Monthly Growth */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-4">Pertumbuhan Kotak (12 Bulan)</h3>
          <div className="flex h-48 items-end gap-2">
            {charts.monthlyGrowth.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-slate-400">{v}</span>
                <div
                  className="w-full rounded-t-md transition-all hover:opacity-80"
                  style={{ height: `${(v / maxGrowth) * 100}%`, backgroundColor: v > 0 ? "#166534" : "#e5e7eb" }}
                />
                <span className="text-[10px] text-slate-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-4">Perolehan Bulanan (Rp)</h3>
          <div className="flex h-48 items-end gap-2">
            {charts.monthlyRevenue.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-slate-400">{(v / 1000).toFixed(0)}rb</span>
                <div
                  className="w-full rounded-t-md transition-all hover:opacity-80"
                  style={{ height: `${(v / maxRevenue) * 100}%`, backgroundColor: v > 0 ? "#059669" : "#e5e7eb" }}
                />
                <span className="text-[10px] text-slate-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-4">Distribusi Status</h3>
          <div className="space-y-3">
            {charts.statusDistribution.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    s.status === "ACTIVE" ? "bg-green-500" :
                    s.status === "INACTIVE" ? "bg-gray-400" :
                    s.status === "LOST" ? "bg-red-500" :
                    s.status === "DAMAGED" ? "bg-amber-500" : "bg-blue-500"
                  }`} />
                  <span className="text-sm text-slate-600 capitalize">{s.status.toLowerCase()}</span>
                </div>
                <span className="text-sm font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Wilayah */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-4">Wilayah Terbaik</h3>
          <div className="space-y-2">
            {data.topWilayah.slice(0, 5).map((w, i) => (
              <div key={w.name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-amber-100 text-amber-700" :
                    i === 1 ? "bg-slate-100 text-slate-600" :
                    i === 2 ? "bg-orange-100 text-orange-700" :
                    "bg-slate-50 text-slate-400"
                  }`}>{i + 1}</span>
                  <span className="text-sm">{w.name}</span>
                </div>
                <span className="text-sm font-medium">{w.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Petugas Teraktif */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-4">Petugas Teraktif</h3>
          <div className="space-y-2">
            {data.petugasTeraktif.slice(0, 5).map((p, i) => (
              <div key={p.name} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <UserRound size={16} className="text-slate-400" />
                  <div>
                    <p className="text-sm">{p.name}</p>
                    <p className="text-[11px] text-slate-400">{p.role}</p>
                  </div>
                </div>
                <span className="text-sm font-medium">{p.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, subtitle, color }: {
  icon: any; label: string; value: string | number; subtitle: string; color: string;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    violet: "bg-violet-50 text-violet-600 border-violet-200",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className={`p-2 rounded-lg ${colors[color] || colors.emerald}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}
