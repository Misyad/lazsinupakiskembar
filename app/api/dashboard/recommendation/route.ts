import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { prisma } from "@/src/lib/db/prisma";

export async function GET() {
  const { response } = await requireApiPermission(permissions.housesRead);
  if (response) return response;

  const houses: any[] = await prisma.house.findMany({
    where: { deletedAt: null },
    include: {
      area: { select: { name: true } },
      assignments: { where: { status: "ACTIVE" }, select: { id: true } },
      withdrawals: { orderBy: { collectedAt: "desc" }, take: 1 }
    }
  });

  const now = new Date();
  const insights: { type: string; message: string; severity: string }[] = [];

  // 1. Bandingkan jumlah kotak dengan bulan lalu
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [kotakSekarang, kotakBulanLalu] = await Promise.all([
    prisma.coinBoxAssignment.count({ where: { status: "ACTIVE" } }),
    prisma.coinBoxAssignment.count({ where: { status: "ACTIVE", assignedAt: { lt: thisMonth } } })
  ]);

  if (kotakBulanLalu > 0) {
    const growth = Math.round(((kotakSekarang - kotakBulanLalu) / kotakBulanLalu) * 100);
    insights.push({
      type: "growth",
      message: `Jumlah kotak aktif ${growth >= 0 ? "meningkat" : "menurun"} ${Math.abs(growth)}% dibanding bulan lalu.`,
      severity: growth >= 0 ? "info" : "warning"
    });
  }

  // 2. Dusun dengan coverage terendah
  const dusunStats = new Map<string, { kk: number; kotak: number }>();
  houses.forEach((h) => {
    const dusun = h.hamlet || h.area?.name || "Lainnya";
    if (!dusunStats.has(dusun)) dusunStats.set(dusun, { kk: 0, kotak: 0 });
    const d = dusunStats.get(dusun)!;
    d.kk++;
    if (h.assignments.length > 0) d.kotak++;
  });

  let worstDusun = "";
  let worstCoverage = 100;
  dusunStats.forEach((v, k) => {
    const c = v.kk > 0 ? (v.kotak / v.kk) * 100 : 0;
    if (c < worstCoverage) { worstCoverage = c; worstDusun = k; }
  });

  if (worstDusun) {
    insights.push({
      type: "priority",
      message: `${worstDusun} merupakan prioritas pemasangan dengan coverage ${worstCoverage.toFixed(1)}%.`,
      severity: "critical"
    });
  }

  // 3. RT dengan perolehan tertinggi
  const rtStats = new Map<string, { total: number; count: number }>();
  houses.forEach((h) => {
    if (h.withdrawals[0]) {
      const key = `${h.rt || "00"}/${h.rw || "00"}`;
      if (!rtStats.has(key)) rtStats.set(key, { total: 0, count: 0 });
      const r = rtStats.get(key)!;
      r.total += h.withdrawals[0].amount || 0;
      r.count++;
    }
  });

  let bestRt = "";
  let bestAvg = 0;
  rtStats.forEach((v, k) => {
    const avg = v.total / v.count;
    if (avg > bestAvg) { bestAvg = avg; bestRt = k; }
  });
  if (bestRt) {
    insights.push({
      type: "top",
      message: `RT ${bestRt} memiliki rata-rata perolehan tertinggi (Rp ${bestAvg.toLocaleString("id-ID")}).`,
      severity: "info"
    });
  }

  // 4. Dusun tanpa petugas
  const petugasWilayah = new Map<string, Set<number>>();
  houses.forEach((h: any) => {
    h.assignments.forEach((a: any) => {
      if (a.status === "ACTIVE") {
        const dusun = h.hamlet || h.area?.name || "Lainnya";
        if (!petugasWilayah.has(dusun)) petugasWilayah.set(dusun, new Set());
      }
    });
  });
  if (worstDusun && !petugasWilayah.has(worstDusun)) {
    insights.push({
      type: "petugas",
      message: `${worstDusun} belum memiliki petugas tetap.`,
      severity: "warning"
    });
  }

  // 5. Target pemasangan
  const totalTarget = houses.length;
  const terpasang = houses.filter((h) => h.assignments.length > 0).length;
  const pctTarget = Math.round((terpasang / (totalTarget * 0.1)) * 100);
  insights.push({
    type: "target",
    message: `Kecamatan telah mencapai ${Math.min(pctTarget, 100)}% target pemasangan (${terpasang} dari ${Math.ceil(totalTarget * 0.1)} target).`,
    severity: pctTarget >= 80 ? "success" : "warning"
  });

  return Response.json({ insights });
}
