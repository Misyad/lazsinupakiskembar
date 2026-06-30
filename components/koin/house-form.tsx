"use client";
import { useState } from "react";
import { Save, Loader2, Upload } from "lucide-react";
import { LocationPicker } from "./location-picker";

interface Props {
  onSuccess?: (house: any) => void;
}

export function HouseForm({ onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [form, setForm] = useState({
    headOfFamily: "", spouseName: "", phone: "", whatsapp: "", email: "",
    address: "", rt: "", rw: "", hamlet: "", postalCode: "", locationNote: "",
    latitude: null as number | null, longitude: null as number | null,
    status: "belum_dipasang", officerId: "", surveyDate: "", notes: "",
    photoFront: "", photoBox: "", photoOwner: "",
  });
  const [error, setError] = useState("");

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setError("");
    if (!form.headOfFamily.trim()) { setError("Nama Kepala Keluarga wajib diisi"); return; }
    if (!form.address.trim()) { setError("Alamat wajib diisi"); return; }
    if (!form.rt.trim() || !form.rw.trim()) { setError("RT dan RW wajib diisi"); return; }
    if (!form.hamlet.trim()) { setError("Dusun wajib diisi"); return; }
    if (!form.phone && !form.whatsapp) { setError("Minimal satu nomor kontak wajib diisi"); return; }
    if (form.latitude === null || form.longitude === null) { setError("Koordinat wajib ditentukan"); return; }

    setSaving(true);
    try {
      // 1. Create house
      const res = await fetch("/api/houses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, officerId: form.officerId ? Number(form.officerId) : null, surveyDate: form.surveyDate || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Gagal menyimpan"); return; }
      const house = data.house;

      // 2. Upload photos
      const photoTypes = [
        { type: "depan", value: form.photoFront },
        { type: "kaleng", value: form.photoBox },
        { type: "pemilik", value: form.photoOwner },
      ];
      for (const pt of photoTypes) {
        if (pt.value) {
          await fetch(`/api/houses/${house.id}/photos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: pt.type, file: pt.value }),
          });
        }
      }

      onSuccess?.(house);
      // Reset form
      setForm({
        headOfFamily: "", spouseName: "", phone: "", whatsapp: "", email: "",
        address: "", rt: "", rw: "", hamlet: "", postalCode: "", locationNote: "",
        latitude: null, longitude: null, status: "belum_dipasang", officerId: "", surveyDate: "", notes: "",
        photoFront: "", photoBox: "", photoOwner: "",
      });
    } catch {
      setError("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Section 1: Informasi Pemilik */}
      <Section title="Informasi Pemilik">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nama Kepala Keluarga *" required>
            <input className="input" value={form.headOfFamily} onChange={(e) => update("headOfFamily", e.target.value)} placeholder="Nama lengkap" />
          </Field>
          <Field label="Nama Pasangan">
            <input className="input" value={form.spouseName} onChange={(e) => update("spouseName", e.target.value)} placeholder="Nama pasangan" />
          </Field>
          <Field label="Nomor HP * (minimal satu kontak)">
            <input className="input" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="08xxxx" />
          </Field>
          <Field label="Nomor WhatsApp">
            <input className="input" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="08xxxx" />
          </Field>
          <Field label="Email (Opsional)">
            <input className="input" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@domain.com" />
          </Field>
        </div>
      </Section>

      {/* Section 2: Alamat */}
      <Section title="Alamat">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="Alamat Lengkap *" required>
              <textarea className="input min-h-[60px]" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Jl. ..." />
            </Field>
          </div>
          <Field label="Dusun *" required>
            <input className="input" value={form.hamlet} onChange={(e) => update("hamlet", e.target.value)} placeholder="Dusun" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="RT *" required>
              <input className="input" value={form.rt} onChange={(e) => update("rt", e.target.value)} placeholder="001" />
            </Field>
            <Field label="RW *" required>
              <input className="input" value={form.rw} onChange={(e) => update("rw", e.target.value)} placeholder="002" />
            </Field>
          </div>
          <Field label="Kode Pos (Opsional)">
            <input className="input" value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} placeholder="61151" />
          </Field>
          <Field label="Catatan Lokasi">
            <input className="input" value={form.locationNote} onChange={(e) => update("locationNote", e.target.value)} placeholder="Rumah warna hijau, pagar putih" />
          </Field>
        </div>
      </Section>

      {/* Section 3: Lokasi */}
      <Section title="Lokasi *">
        <p className="text-xs text-slate-500 mb-3">Klik peta, geser marker, atau cari alamat untuk menentukan lokasi</p>
        <LocationPicker
          latitude={form.latitude}
          longitude={form.longitude}
          onChange={(lat, lng) => { update("latitude", lat); update("longitude", lng); }}
        />
      </Section>

      {/* Section 4: Foto Rumah */}
      <Section title="Foto Rumah">
        <div className="grid gap-4 md:grid-cols-3">
          <PhotoField label="Foto Depan Rumah *" required value={form.photoFront} onChange={(v) => update("photoFront", v)} />
          <PhotoField label="Foto Letak Kaleng" value={form.photoBox} onChange={(v) => update("photoBox", v)} />
          <PhotoField label="Foto Pemilik" value={form.photoOwner} onChange={(v) => update("photoOwner", v)} />
        </div>
      </Section>

      {/* Section 5: Informasi Tambahan */}
      <Section title="Informasi Tambahan">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Status Rumah">
            <select className="input" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="belum_dipasang">Belum Dipasang Kaleng</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
              <option value="menolak">Menolak</option>
              <option value="pindah">Pindah</option>
              <option value="ditarik">Ditarik</option>
            </select>
          </Field>
          <Field label="Tanggal Pendataan">
            <input className="input" type="date" value={form.surveyDate} onChange={(e) => update("surveyDate", e.target.value)} />
          </Field>
          <Field label="Petugas Penanggung Jawab">
            <input className="input" value={form.officerId} onChange={(e) => update("officerId", e.target.value)} placeholder="ID Petugas" />
          </Field>
          <div className="md:col-span-2">
            <Field label="Catatan Admin">
              <textarea className="input min-h-[60px]" value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Catatan..." />
            </Field>
          </div>
        </div>
      </Section>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

      <button
        onClick={submit}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? "Menyimpan..." : "Simpan Rumah"}
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-sm text-slate-700 mb-4 pb-3 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function PhotoField({ label, required, value, onChange }: { label: string; required?: boolean; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body });
      const data = await res.json();
      if (res.ok && data.asset?.id) {
        onChange(`/api/media/${data.asset.id}`);
      }
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="border border-slate-200 rounded-lg p-3">
      <p className="text-xs font-medium text-slate-500 mb-2">{label} {required && <span className="text-red-500">*</span>}</p>
      {value ? (
        <div className="relative">
          <img src={value} alt={label} className="w-full h-28 object-cover rounded-lg" />
          <button
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs"
          >×</button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-brand-400">
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-slate-400" />
          ) : (
            <>
              <Upload size={20} className="text-slate-400 mb-1" />
              <span className="text-xs text-slate-400">Unggah foto</span>
            </>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      )}
    </div>
  );
}
