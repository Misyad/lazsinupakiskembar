import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { prisma } from "@/src/lib/db/prisma";

export async function GET() {
  const { response } = await requireApiPermission(permissions.housesRead);
  if (response) return response;

  const houses = await prisma.house.findMany({
    where: { deletedAt: null },
    include: {
      area: { select: { name: true } },
      assignments: { where: { status: "ACTIVE" }, select: { id: true } }
    }
  });

  // Group by dusun (from area or rt_rw)
  const dusunMap = new Map<string, { totalKK: number; totalKotak: number; rws: Map<string, { rts: Set<string>; kotak: number }> }>();
  const rtMap = new Map<string, { kota: number; kk: number }>();

  houses.forEach((h) => {
    const dusun = h.dusun || h.area?.name || "Lainnya";
    const rw = h.rw || "00";
    const rt = h.rt || "00";
    const key = `${dusun}-${rw}-${rt}`;

    if (!dusunMap.has(dusun)) {
      dusunMap.set(dusun, { totalKK: 0, totalKotak: 0, rws: new Map() });
    }
    const d = dusunMap.get(dusun)!;
    d.totalKK++;

    if (!d.rws.has(rw)) {
      d.rws.set(rw, { rts: new Set(), kotak: 0 });
    }
    const rwData = d.rws.get(rw)!;
    rwData.rts.add(rt);

    if (h.assignments.length > 0) {
      d.totalKotak++;
      rwData.kotak++;
    }

    rtMap.set(key, {
      kota: h.assignments.length > 0 ? 1 : 0,
      kk: 1
    });
  });

  const coverage = Array.from(dusunMap.entries()).map(([dusun, data]) => {
    const coveragePct = data.totalKK > 0 ? Math.round((data.totalKotak / data.totalKK) * 10000) / 100 : 0;
    const totalRt = Array.from(data.rws.values()).reduce((sum, rw) => sum + rw.rts.size, 0);

    let status = "prioritas";
    if (coveragePct >= 10) status = "padat";
    else if (coveragePct >= 5) status = "sedang";
    else if (coveragePct >= 2) status = "kurang";

    const rwData = Array.from(data.rws.entries()).map(([rw, rwInfo]) => ({
      rw,
      totalRt: rwInfo.rts.size,
      totalKotak: rwInfo.kotak
    }));

    return {
      dusun,
      totalKK: data.totalKK,
      totalKotak: data.totalKotak,
      coverage: coveragePct,
      totalRt,
      status,
      rwData,
      target: Math.ceil(data.totalKK * 0.1),
      rekomendasi: coveragePct < 5
        ? `${dusun} memiliki ${data.totalKK} KK namun baru ${data.totalKotak} kotak. Wilayah ini direkomendasikan menjadi prioritas pemasangan.`
        : null
    };
  });

  return Response.json({
    coverage: coverage.sort((a, b) => a.coverage - b.coverage),
    total: {
      dusun: coverage.length,
      totalKK: houses.length,
      totalKotak: houses.filter((h) => h.assignments.length > 0).length,
      rataCoverage: houses.length > 0
        ? Math.round((houses.filter((h) => h.assignments.length > 0).length / houses.length) * 10000) / 100
        : 0
    }
  });
}
