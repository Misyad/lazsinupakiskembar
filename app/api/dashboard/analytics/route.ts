import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { prisma } from "@/src/lib/db/prisma";

export async function GET() {
  const { response } = await requireApiPermission(permissions.housesRead);
  if (response) return response;

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startYear = new Date(now.getFullYear(), 0, 1);

  const [
    totalAktif,
    totalKotak,
    kotakBaru,
    kotakNonaktif,
    belumDiambil,
    totalNominalBulanIni,
    totalNominalTahunIni,
    topWilayah,
    bottomWilayah,
    petugasTeraktif
  ] = await Promise.all([
    // Total kotak aktif
    prisma.assignment.count({ where: { status: "ACTIVE", unassignedAt: null } }),

    // Total semua kotak
    prisma.coinBox.count({ where: { deletedAt: null } }),

    // Kotak baru bulan ini
    prisma.coinBox.count({ where: { createdAt: { gte: startMonth }, deletedAt: null } }),

    // Kotak nonaktif
    prisma.coinBox.count({ where: { status: "INACTIVE", deletedAt: null } }),

    // Kotak belum diambil (belum ada withdrawal)
    prisma.coinBoxAssignment.count({
      where: { status: "ACTIVE", coinBox: { withdrawals: { none: { status: "VALIDATED" } } } }
    }),

    // Total nominal bulan ini
    prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { status: "VALIDATED", collectedAt: { gte: startMonth } }
    }),

    // Total nominal tahun ini
    prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { status: "VALIDATED", collectedAt: { gte: startYear } }
    }),

    // Wilayah terbaik (top 5)
    prisma.area.findMany({
      take: 5,
      orderBy: { houses: { _count: "desc" } },
      include: { _count: { select: { houses: true } } }
    }),

    // Bottom wilayah
    prisma.area.findMany({
      take: 5,
      orderBy: { houses: { _count: "asc" } },
      include: { _count: { select: { houses: true } } }
    }),

    // Petugas teraktif (top 5)
    prisma.user.findMany({
      take: 5,
      orderBy: { withdrawals: { _count: "desc" } },
      include: {
        _count: { select: { withdrawals: true } },
        userRoles: { include: { role: true } }
      },
      where: { deletedAt: null }
    })
  ]);

  // Hitung persentase pengambilan tepat waktu (within 30 days)
  const totalWithdrawals = await prisma.withdrawal.count({ where: { status: "VALIDATED" } });
  const tepatWaktu = await prisma.withdrawal.count({
    where: {
      status: "VALIDATED",
      collectedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  });

  // Monthly growth (12 bulan terakhir)
  const monthlyGrowth = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      return prisma.coinBox.count({
        where: { createdAt: { gte: monthStart, lt: monthEnd } }
      });
    })
  );

  // Perolehan bulanan
  const monthlyRevenue = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      return prisma.withdrawal.aggregate({
        _sum: { amount: true },
        where: { status: "VALIDATED", collectedAt: { gte: monthStart, lt: monthEnd } }
      });
    })
  );

  // Status distribution
  const statusDist = await prisma.coinBox.groupBy({
    by: ["status"],
    _count: true,
    where: { deletedAt: null }
  });

  const avgPerolehan = totalKotak > 0 ? Math.round((totalNominalBulanIni._sum.amount || 0) / totalKotak) : 0;

  return Response.json({
    kpi: {
      totalAktif,
      totalKotak,
      kotakBaru,
      kotakNonaktif,
      belumDiambil,
      avgPerolehan,
      totalNominalBulanIni: totalNominalBulanIni._sum.amount || 0,
      totalNominalTahunIni: totalNominalTahunIni._sum.amount || 0,
      persentaseTepatWaktu: totalWithdrawals > 0 ? Math.round((tepatWaktu / totalWithdrawals) * 100) : 0,
    },
    topWilayah: topWilayah.map((a) => ({ name: a.name, total: a._count.houses })),
    bottomWilayah: bottomWilayah.map((a) => ({ name: a.name, total: a._count.houses })),
    petugasTeraktif: petugasTeraktif.map((u) => ({
      name: u.name,
      total: u._count.withdrawals,
      role: u.userRoles[0]?.role?.name || ""
    })),
    charts: {
      monthlyGrowth: monthlyGrowth.reverse(),
      monthlyRevenue: monthlyRevenue.reverse().map((m) => m._sum.amount || 0),
      statusDistribution: statusDist.map((s) => ({
        status: s.status,
        count: s._count
      }))
    }
  });
}
