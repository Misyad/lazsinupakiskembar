"use client";

import { Coins, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginPage() {
  const router = useRouter();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginEmail, setLoginEmail] = useState("admin@ranting.local");
  const [loginPassword, setLoginPassword] = useState("Admin123!");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const payload = await response.json();

      if (!response.ok) {
        setLoginError(payload.error ?? "Login gagal.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setLoginError("Tidak bisa menghubungi server login.");
    } finally {
      setLoginLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <section className="w-full max-w-5xl overflow-hidden rounded-[8px] border border-brand-100 bg-white shadow-soft">
        <div className="grid min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-between bg-brand-700 p-7 text-white sm:p-10">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-[6px] bg-white/12 px-3 py-2 text-sm">
                <Coins size={18} />
                GERAKAN KOIN NU
              </div>
              <h1 className="max-w-xl text-3xl font-semibold leading-tight sm:text-5xl">
                KOINNU Ranting System
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-brand-50">
                Area internal pengurus untuk pendataan rumah, tracking kaleng,
                penarikan koin, validasi bendahara, dan laporan dana ranting.
              </p>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <LoginMetric label="Rumah aktif" value="1.000+" />
              <LoginMetric label="Laporan" value="Real-time" />
              <LoginMetric label="Audit" value="Tercatat" />
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-medium text-brand-700">Masuk aplikasi</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Login pengurus</h2>
            </div>
            <form className="grid gap-4" onSubmit={login}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Email
                <input
                  className="h-11 rounded-[8px] border border-slate-200 px-3 font-normal outline-none transition focus:border-brand-500"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Password
                <input
                  className="h-11 rounded-[8px] border border-slate-200 px-3 font-normal outline-none transition focus:border-brand-500"
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>
              {loginError ? (
                <div className="rounded-[8px] border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {loginError}
                </div>
              ) : null}
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-brand-600 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={loginLoading}
              >
                <ShieldCheck size={18} />
                {loginLoading ? "Memproses..." : "Masuk"}
              </button>
            </form>
            <div className="mt-6 rounded-[8px] border border-slate-200 bg-paper p-4 text-sm text-slate-600">
              <p className="font-semibold text-ink">Akun awal</p>
              <p className="mt-2">admin@ranting.local / Admin123!</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function LoginMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/20 bg-white/10 p-4">
      <p className="text-xs text-brand-50">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
    </div>
  );
}
