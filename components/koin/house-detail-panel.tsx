"use client";

import { X, ExternalLink, Phone, MapPin, History } from "lucide-react";
import { useState } from "react";
import type { HouseFeature } from "./map-view";

interface Props {
  house: HouseFeature;
  onClose: () => void;
}

export function HouseDetailPanel({ house, onClose }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any>(null);

  const loadHistory = async () => {
    if (history) { setShowHistory(!showHistory); return; }
    try {
      const res = await fetch(`/api/houses/${house.id}/history`);
      const data = await res.json();
      setHistory(data);
      setShowHistory(true);
    } catch {}
  };

  const navigate = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${house.latitude},${house.longitude}`,
      "_blank"
    );
  };

  const wa = () => {
    if (house.phone) {
      window.open(`https://wa.me/${house.phone.replace(/[^0-9]/g, "")}`, "_blank");
    }
  };

  return (
    <div className="absolute bottom-0 right-0 z-20 w-96 max-h-[80vh] bg-white border border-slate-200 rounded-t-xl shadow-xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 sticky top-0 bg-white">
        <div>
          <p className="font-semibold text-sm">{house.boxNumber || "—"}</p>
          <p className="text-xs text-slate-500">{house.name}</p>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            house.status === "active" ? "bg-green-100 text-green-700" :
            house.status === "inactive" ? "bg-gray-100 text-gray-600" :
            "bg-amber-100 text-amber-700"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              house.status === "active" ? "bg-green-500" :
              house.status === "inactive" ? "bg-gray-500" : "bg-amber-500"
            }`} />
            {house.status === "active" ? "Aktif" : house.status === "inactive" ? "Nonaktif" : "Belum Diambil"}
          </span>
        </div>

        {/* Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
            <span>{house.address}</span>
          </div>
          <p className="text-slate-500 ml-6">RT {house.rt} / RW {house.rw}{house.dusun ? ` · ${house.dusun}` : ""}</p>
          {house.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-slate-400" />
              <span>{house.phone}</span>
            </div>
          )}
        </div>

        {/* Last withdrawal */}
        {house.lastWithdrawal && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm">
            <p className="text-slate-500 text-xs mb-1">Terakhir Diambil</p>
            <p className="font-medium">
              {new Date(house.lastWithdrawal).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric"
              })}
            </p>
            {house.lastAmount && (
              <p className="text-slate-500">Rp {house.lastAmount.toLocaleString("id-ID")}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={navigate}
            className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <ExternalLink size={14} /> Navigasi
          </button>
          {house.phone && (
            <button
              onClick={wa}
              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Phone size={14} /> WhatsApp
            </button>
          )}
          <button
            onClick={loadHistory}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <History size={14} /> Riwayat
          </button>
        </div>

        {/* History */}
        {showHistory && history && (
          <div className="space-y-3 border-t border-slate-200 pt-3">
            {history.withdrawals?.length > 0 ? (
              history.withdrawals.slice(0, 5).map((w: any) => (
                <div key={w.id} className="text-sm bg-slate-50 rounded-lg p-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Rp {w.amount.toLocaleString("id-ID")}</span>
                    <span className="text-slate-500">{new Date(w.collectedAt).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Oleh: {w.collector}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-2">Belum ada riwayat pengambilan</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
