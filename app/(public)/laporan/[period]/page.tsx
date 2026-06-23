import { PublicReportTable, PublicSummaryPage } from "@/components/public-site";

// Render on request (reads live DB data); skip build-time static prerender.
export const dynamic = "force-dynamic";

export default async function PublicReportPeriodPage({ params }: { params: Promise<{ period: string }> }) {
  const { period: periodParam } = await params;
  const period = periodParam.replace(/-/g, " ");

  return (
    <>
      <PublicSummaryPage
        title={`Laporan Publik ${period}`}
        description="Halaman laporan periodik publik KOIN NU Ranting Pakiskembar berdasarkan data keuangan tervalidasi."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <PublicReportTable />
      </section>
    </>
  );
}
