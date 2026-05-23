import { PublicReportTable, PublicSummaryPage } from "@/components/public-site";

export default async function PublicReportPeriodPage({ params }: { params: Promise<{ period: string }> }) {
  const { period: periodParam } = await params;
  const period = periodParam.replace(/-/g, " ");

  return (
    <>
      <PublicSummaryPage
        title={`Laporan Publik ${period}`}
        description="Halaman laporan periodik publik berbasis dummy data untuk MVP transparansi KOIN NU."
      />
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <PublicReportTable />
      </section>
    </>
  );
}
