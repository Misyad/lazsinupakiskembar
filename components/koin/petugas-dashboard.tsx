"use client";
import { useEffect, useState } from "react";
import { Target, CheckCircle2, Clock, DollarSign, Route, Calendar, MapPin } from "lucide-react";

interface PetugasDashboardData {
  hariIni: {
    target: number;
    sudah: number;
    nominal: number;
    estimasi: number;
  };
  ruteAktif: {
    id: number;
    totalKotak: number;
    jarak: number;
    estimasi: number;
    status: string;
    dusun: string | null;
    tanggal: string;
  } | null;
  riwayat: { tanggal: string; total: number; nominal: number }[];
}

export function PetugasDashboard() {
  const [data, setData] = useState<PetugasDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/routes").then((r) => r.json()),
      fetch("/api/dashboard/analytics").then((r) => r.json()).catch(() => ({ kpi: {} })),
    ]).then(([routesRes, analytics]) => {
      const today = new Date().toISOString().split("T")[0];
      const ruteHariIni = (routesRes.routes || []).filter(
        (r: any) => r.tanggal?.startsWith(today)
      );
      const ruteAktif = (routesRes.routes || []).find((r: any) => r.status === "on_going");
      const selesai = (routesRes.routes || []).filter((r: any) => r.status === "completed");

      setData({
        hariIni: {
          target: ruteHariIni.reduce((s: number, r: any) => s + (r.totalKotak || 0), 0),
          sudah: selesai.reduce((s: number, r: any) => s + (r.totalKotak || 0), 0),
          nominal: analytics.kpi?.totalNominalBulanIni || 0,
          estimasi: ruteHariIni.reduce((s: number, r: any) => s + (r.estimasi || 0), 0),
        },
        ruteAktif: ruteAktif || null,
        riwayat: selesai.slice(-7).map((r: any) => ({
          tanggal: r.tanggal,
          total: r.totalKotak,
          nominal: 0,
        })),
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat dashboard...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Gagal memuat data</div>;

  const { hariIni, ruteAktif } = data;
  const sisa = Math.max(0, hariIni.target - hariIni.sudah);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">Dashboard Petugas</h2>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{hariIni.target}</p>
          <p className="text-sm text-slate-500">Target Hari Ini</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{hariIni.sudah}</p>
          <p className="text-sm text-slate-500">Sudah Diambil</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={20} className="text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">{sisa}</p>
          <p className="text-sm text-slate-500">Sisa ({hariIni.target > 0 ? Math.round((hariIni.sudah / hariIni.target) * 100) : 0}%)</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={20} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-800">Rp {(hariIni.nominal / 1000).toFixed(0)}rb</p>
          <p className="text-sm text-slate-500">Nominal Bulan Ini</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progress Hari Ini</span>
          <span className="text-sm text-slate-500">
            {hariIni.sudah} / {hariIni.target} kotak
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all"
            style={{ width: `${hariIni.target > 0 ? Math.min((hariIni.sudah / hariIni.target) * 100, 100) : 0}%` }}
          />
        </div>
        {hariIni.estimasi > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            Estimasi waktu: {Math.floor(hariIni.estimasi / 60)} jam {hariIni.estimasi % 60} menit
          </p>
        )}
      </div>

      {/* Active route */}
      {ruteAktif && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Route size={18} className="text-amber-600" />
            <h3 className="font-semibold text-sm text-amber-800">Rute Sedang Berjalan</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-amber-700">
            <span className="flex items-center gap-1"><MapPin size={14} /> {ruteAktif.totalKotak} kotak</span>
            <span className="flex items-center gap-1"><Route size={14} /> {ruteAktif.jarak.toFixed(1)} km</span>
            {ruteAktif.dusun && <span>Dusun: {ruteAktif.dusun}</span>}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-sm text-slate-700 mb-4">Riwayat</h3>
        {data.riwayat.length > 0 ? (
          <div className="space-y-2">
            {data.riwayat.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {new Date(r.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <span className="text-sm font-medium">{r.total} kotak</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">Belum ada riwayat</p>
        )}
      </div>
    </div>
  );
}
