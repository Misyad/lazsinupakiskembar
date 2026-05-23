import { DocumentationGrid, HeroCta, IncomeChart, programs, PublicReportTable, publicStats, PublicStatCard } from "@/components/public-site";

export default function PublicHomePage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#f7faf7_0%,#ffffff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">Portal Resmi Transparansi</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-ink sm:text-6xl">
              Gerakan KOIN NU Ranting Pakiskembar
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Transparansi pengelolaan dana umat untuk mendukung penyaluran sosial,
              pendidikan, kesehatan, dan program kemaslahatan warga Pakiskembar.
            </p>
            <div className="mt-8">
              <HeroCta />
            </div>
          </div>
          <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-brand-700">Ringkasan Mei 2026</p>
            <div className="mt-5 grid gap-4">
              {publicStats.slice(0, 3).map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-[8px] bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="font-semibold text-ink">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[8px] bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Laporan publik menampilkan agregat dana dan program. Data pribadi donatur
              tetap berada di area internal pengurus.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {publicStats.map((item) => (
            <PublicStatCard key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <IncomeChart />
          <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-semibold text-brand-700">Program Berjalan</p>
            <h2 className="mt-1 text-2xl font-semibold text-ink">Penyaluran sosial aktif</h2>
            <div className="mt-6 grid gap-3">
              {programs.map((program) => (
                <article key={program.title} className="rounded-[8px] border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-ink">{program.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">Alokasi berjalan: {program.amount}</p>
                    </div>
                    <span className="rounded-[6px] bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {program.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-700">Dokumentasi Kegiatan</p>
          <h2 className="mt-1 text-3xl font-semibold text-ink">Kegiatan LAZISNU Pakiskembar</h2>
        </div>
        <DocumentationGrid />
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold text-brand-700">Transparansi Ringkas</p>
              <h2 className="mt-1 text-3xl font-semibold text-ink">Laporan publik terbaru</h2>
            </div>
          </div>
          <PublicReportTable />
        </div>
      </section>
    </main>
  );
}
