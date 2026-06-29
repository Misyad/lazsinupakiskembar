"use client";
import { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Calendar, User, Package, History, FileText, ExternalLink, ArrowLeft, QrCode } from "lucide-react";

interface HouseDetail {
  id: number; houseCode: string; headOfFamily: string; spouseName: string;
  phone: string; whatsapp: string; email: string; address: string;
  rt: string; rw: string; hamlet: string; postalCode: string;
  locationNote: string; latitude: number | null; longitude: number | null;
  status: string; officerId: number | null; surveyDate: string; notes: string;
  area: { id: number; name: string }; officer: { id: number; name: string; phone: string } | null;
  assignments: any[]; photos: any[]; logs: any[];
  _count: { withdrawals: number; photos: number };
}

const statusBadge: Record<string, string> = {
  aktif: "bg-green-100 text-green-700",
  belum_dipasang: "bg-amber-100 text-amber-700",
  nonaktif: "bg-gray-100 text-gray-600",
  menolak: "bg-red-100 text-red-700",
  pindah: "bg-blue-100 text-blue-700",
  ditarik: "bg-purple-100 text-purple-700",
};

const statusLabel: Record<string, string> = {
  aktif: "Aktif", belum_dipasang: "Belum Dipasang Kaleng",
  nonaktif: "Nonaktif", menolak: "Menolak", pindah: "Pindah", ditarik: "Ditarik",
};

export function HouseDetail({ houseId, onBack }: { houseId: number; onBack?: () => void }) {
  const [house, setHouse] = useState<HouseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("ringkasan");

  useEffect(() => {
    fetch(`/api/houses/${houseId}/history`)
      .then((r) => r.json())
      .then((data) => setHouse(data.house || data))
      .finally(() => setLoading(false));
  }, [houseId]);

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat detail rumah...</div>;
  if (!house) return <div className="p-8 text-center text-red-500">Rumah tidak ditemukan</div>;

  const tabs = [
    { key: "ringkasan", label: "Ringkasan", icon: User },
    { key: "lokasi", label: "Lokasi", icon: MapPin },
    { key: "kaleng", label: "Kaleng", icon: Package },
    { key: "riwayat", label: "Riwayat", icon: History },
    { key: "dokumen", label: "Dokumen", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">{house.headOfFamily}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge[house.status] || "bg-slate-100 text-slate-600"}`}>
              {statusLabel[house.status] || house.status}
            </span>
            <span className="text-xs font-mono text-slate-400">{house.houseCode}</span>
          </div>
          <p className="text-sm text-slate-500">{house.address}, {house.hamlet}</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">
          <QrCode size={14} /> Pasang Kaleng
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "ringkasan" && <RingkasanTab house={house} />}
      {tab === "lokasi" && <LokasiTab house={house} />}
      {tab === "kaleng" && <KalengTab house={house} />}
      {tab === "riwayat" && <RiwayatTab house={house} />}
      {tab === "dokumen" && <DokumenTab house={house} />}
    </div>
  );
}

function RingkasanTab({ house }: { house: HouseDetail }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-sm text-slate-700 mb-3">Data Pemilik</h3>
        <InfoRow icon={User} label="Kepala Keluarga" value={house.headOfFamily} />
        {house.spouseName && <InfoRow label="Pasangan" value={house.spouseName} />}
        {house.phone && <InfoRow icon={Phone} label="No HP" value={house.phone} />}
        {house.whatsapp && <InfoRow icon={Phone} label="WhatsApp" value={house.whatsapp} />}
        {house.email && <InfoRow icon={Mail} label="Email" value={house.email} />}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-sm text-slate-700 mb-3">Alamat</h3>
        <InfoRow label="Alamat" value={house.address} />
        <InfoRow label="RT/RW" value={`${house.rt}/${house.rw}`} />
        <InfoRow label="Dusun" value={house.hamlet} />
        {house.postalCode && <InfoRow label="Kode Pos" value={house.postalCode} />}
        {house.locationNote && <InfoRow label="Catatan Lokasi" value={house.locationNote} />}
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
        <h3 className="font-semibold text-sm text-slate-700 mb-3">Status & Petugas</h3>
        <InfoRow label="Status" value={house.status} />
        {house.officer && <InfoRow icon={User} label="Petugas" value={house.officer.name} />}
        {house.surveyDate && <InfoRow icon={Calendar} label="Tgl Pendataan" value={new Date(house.surveyDate).toLocaleDateString("id-ID")} />}
        <InfoRow icon={Package} label="Total Pengambilan" value={String(house._count.withdrawals)} />
      </div>
      {house.notes && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-2">Catatan Admin</h3>
          <p className="text-sm text-slate-600">{house.notes}</p>
        </div>
      )}
    </div>
  );
}

function LokasiTab({ house }: { house: HouseDetail }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="space-y-2 mb-4">
          <InfoRow icon={MapPin} label="Latitude" value={String(house.latitude || "—")} />
          <InfoRow icon={MapPin} label="Longitude" value={String(house.longitude || "—")} />
        </div>
        <div className="h-72 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center" id="house-detail-map">
          {house.latitude && house.longitude ? (
            <button
              onClick={() => window.open(`https://www.google.com/maps?q=${house.latitude},${house.longitude}`, "_blank")}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
            >
              <ExternalLink size={16} /> Buka di Google Maps
            </button>
          ) : (
            <p className="text-slate-400 text-sm">Koordinat belum tersedia</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KalengTab({ house }: { house: HouseDetail }) {
  const box = house.assignments?.[0];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {box ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-brand-600" />
            <div>
              <p className="font-semibold">{box.coinBox?.boxNumber || "—"}</p>
              <p className="text-sm text-slate-500">Status: {box.coinBox?.status || "—"}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">
              Cetak QR Code
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Package size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm mb-4">Rumah ini belum memiliki kaleng</p>
          <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm hover:bg-brand-700">
            Pasang Kaleng
          </button>
        </div>
      )}
    </div>
  );
}

function RiwayatTab({ house }: { house: HouseDetail }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {house.logs?.length > 0 ? (
        <div className="space-y-3">
          {house.logs.slice(0, 20).map((log: any) => (
            <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0">
              <div className="w-2 h-2 rounded-full bg-brand-400 mt-2 shrink-0" />
              <div className="flex-1">
                <p className="text-sm">{log.description || log.action}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(log.createdAt).toLocaleString("id-ID")}
                  {log.user?.name ? ` oleh ${log.user.name}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-400 text-sm py-8">Belum ada riwayat aktivitas</p>
      )}
    </div>
  );
}

function DokumenTab({ house }: { house: HouseDetail }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      {house.photos?.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-3">
          {house.photos.map((photo: any) => (
            <div key={photo.id} className="border border-slate-200 rounded-lg p-3">
              <p className="text-xs font-medium text-slate-500 mb-2 capitalize">{photo.type}</p>
              <img src={photo.file} alt={photo.type} className="w-full h-32 object-cover rounded" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-400 text-sm py-8">Belum ada foto</p>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon?: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon size={16} className="text-slate-400 mt-0.5 shrink-0" />}
      <span className="text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}
