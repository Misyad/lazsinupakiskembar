import { permissions } from "@/src/lib/permissions/permissions";
import { requireApiPermission } from "@/lib/auth";
import { jsonError } from "@/src/lib/api/errors";
import { prisma } from "@/src/lib/db/prisma";

export async function POST(request: Request) {
  const { user, response } = await requireApiPermission(permissions.coinBoxesAssign);
  if (response || !user) return response;

  try {
    const { petugasId, dusun, tanggal, houseIds } = await request.json();

    if (!petugasId || !tanggal) {
      return Response.json({ error: "petugasId and tanggal required" }, { status: 400 });
    }

    // Get houses with coordinates
    const whereId = houseIds?.length ? { id: { in: houseIds } } : {};
    const houses = await prisma.house.findMany({
      where: {
        ...whereId,
        ...(dusun ? { dusun } : {}),
        deletedAt: null,
        ...(houseIds?.length ? {} : { latitude: { not: null } }),
        assignments: { some: { status: "ACTIVE" } }
      },
      include: {
        assignments: { where: { status: "ACTIVE" }, include: { coinBox: true } }
      }
    });

    if (houses.length === 0) {
      return Response.json({ error: "No houses found" }, { status: 404 });
    }

    // Simple nearest-neighbor route optimization
    const sorted = optimizeRoute(houses);

    // Calculate distance using Haversine
    let totalDistance = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      totalDistance += haversine(
        sorted[i].latitude!, sorted[i].longitude!,
        sorted[i + 1].latitude!, sorted[i + 1].longitude!
      );
    }

    const waktuEstimasi = Math.ceil(totalDistance / 30 * 60 + sorted.length * 5); // 30km/h + 5min per stop

    // Save route
    const route = await prisma.routeCollection.create({
      data: {
        petugasId,
        tanggal: new Date(tanggal),
        dusun: dusun || null,
        jarak: Math.round(totalDistance * 100) / 100,
        estimasi: waktuEstimasi,
        status: "planned",
        totalKotak: sorted.length
      }
    });

    return Response.json({
      route: {
        id: route.id,
        jarak: route.jarak,
        estimasi: route.estimasi,
        totalKotak: sorted.length
      },
      urutan: sorted.map((h, i) => ({
        urutan: i + 1,
        id: h.id,
        name: h.name,
        boxNumber: h.assignments[0]?.coinBox?.boxNumber || "",
        address: h.address,
        latitude: h.latitude,
        longitude: h.longitude
      })),
      totalJarak: Math.round(totalDistance * 100) / 100,
      estimasiWaktu: waktuEstimasi
    });
  } catch (error) {
    return jsonError(error);
  }
}

function optimizeRoute(houses: any[]) {
  const withCoords = houses.filter((h) => h.latitude && h.longitude);
  if (withCoords.length <= 1) return withCoords;

  // Nearest neighbor from first house
  const visited = new Set<number>();
  const result = [];
  let current = withCoords[0];
  visited.add(current.id);
  result.push(current);

  while (result.length < withCoords.length) {
    let nearest: any = null;
    let nearestDist = Infinity;
    for (const h of withCoords) {
      if (visited.has(h.id)) continue;
      const d = haversine(current.latitude!, current.longitude!, h.latitude!, h.longitude!);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = h;
      }
    }
    if (nearest) {
      visited.add(nearest.id);
      result.push(nearest);
      current = nearest;
    }
  }
  return result;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
