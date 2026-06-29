import { prisma } from "@/src/lib/db/prisma";
import type { CreateHouseInput, UpdateHouseInput } from "@/src/lib/validations/houses";

function generateHouseCode(id: number): string {
  return `RMH-${String(id).padStart(6, "0")}`;
}

export async function listHouses() {
  return prisma.house.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      area: { select: { id: true, name: true, code: true } },
      officer: { select: { id: true, name: true } },
      assignments: {
        where: { status: "ACTIVE" },
        include: { coinBox: { select: { id: true, boxNumber: true, status: true } } },
        take: 1
      },
      photo: { select: { id: true, mimeType: true } },
      photos: { select: { id: true, type: true, file: true } },
      _count: { select: { withdrawals: true, logs: true, photos: true } }
    }
  });
}

export async function getHouseById(id: number) {
  return prisma.house.findFirst({
    where: { id, deletedAt: null },
    include: {
      area: true,
      officer: { select: { id: true, name: true, phone: true } },
      assignments: {
        where: { status: "ACTIVE" },
        include: { coinBox: true },
        take: 1
      },
      photos: { orderBy: { createdAt: "desc" } },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } }
      },
      _count: { select: { withdrawals: true, photos: true } }
    }
  });
}

export async function createHouse(input: CreateHouseInput) {
  const area = input.areaId
    ? await prisma.area.findFirst({ where: { id: input.areaId, deletedAt: null } })
    : await prisma.area.findFirst({ where: { code: "PAKISKEMBAR", deletedAt: null } });

  if (!area) throw new Error("INVALID_RELATION");

  const house = await prisma.house.create({
    data: {
      areaId: area.id,
      headOfFamily: input.headOfFamily,
      spouseName: input.spouseName || null,
      phone: input.phone || null,
      whatsapp: input.whatsapp || null,
      email: input.email || null,
      address: input.address,
      rtRw: `${input.rt}/${input.rw}`,
      rt: input.rt,
      rw: input.rw,
      hamlet: input.hamlet,
      postalCode: input.postalCode || null,
      locationNote: input.locationNote || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      status: input.status || "belum_dipasang",
      officerId: input.officerId ?? null,
      surveyDate: input.surveyDate ?? null,
      notes: input.notes || null,
      joinedAt: input.joinedAt ?? new Date()
    },
    include: { area: true, officer: { select: { name: true } } }
  });

  // Generate house_code after insert
  const code = generateHouseCode(house.id);
  const updated = await prisma.house.update({
    where: { id: house.id },
    data: { houseCode: code }
  });

  // Create house log
  await prisma.houseLog.create({
    data: {
      houseId: house.id,
      action: "house.created",
      description: `Rumah ${input.headOfFamily} ditambahkan`,
      metadata: { headOfFamily: input.headOfFamily, area: area.name }
    }
  });

  // Re-query with full includes for serialization
  const full = await prisma.house.findFirst({
    where: { id: house.id },
    include: {
      area: { select: { id: true, name: true, code: true } },
      officer: { select: { id: true, name: true } },
      assignments: {
        where: { status: "ACTIVE" },
        include: { coinBox: { select: { id: true, boxNumber: true, status: true } } },
        take: 1
      },
      photo: { select: { id: true, mimeType: true } },
      photos: { select: { id: true, type: true, file: true } },
      _count: { select: { withdrawals: true, logs: true, photos: true } }
    }
  });

  return full!;
}

export async function updateHouse(id: number, input: UpdateHouseInput) {
  const house = await prisma.house.findFirst({ where: { id, deletedAt: null } });
  if (!house) throw new Error("NOT_FOUND");

  const data: any = {};
  if (input.headOfFamily !== undefined) data.headOfFamily = input.headOfFamily;
  if (input.spouseName !== undefined) data.spouseName = input.spouseName || null;
  if (input.phone !== undefined) data.phone = input.phone || null;
  if (input.whatsapp !== undefined) data.whatsapp = input.whatsapp || null;
  if (input.email !== undefined) data.email = input.email || null;
  if (input.address !== undefined) data.address = input.address;
  if (input.rt !== undefined) { data.rt = input.rt; data.rtRw = `${input.rt}/${input.rw || house.rw}`; }
  if (input.rw !== undefined) { data.rw = input.rw; data.rtRw = `${input.rt || house.rt}/${input.rw}`; }
  if (input.hamlet !== undefined) data.hamlet = input.hamlet;
  if (input.postalCode !== undefined) data.postalCode = input.postalCode || null;
  if (input.locationNote !== undefined) data.locationNote = input.locationNote || null;
  if (input.latitude !== undefined) data.latitude = input.latitude;
  if (input.longitude !== undefined) data.longitude = input.longitude;
  if (input.status !== undefined) data.status = input.status;
  if (input.officerId !== undefined) data.officerId = input.officerId ?? null;
  if (input.surveyDate !== undefined) data.surveyDate = input.surveyDate ?? null;
  if (input.notes !== undefined) data.notes = input.notes || null;
  if (input.areaId) data.areaId = input.areaId;

  const updated = await prisma.house.update({ where: { id }, data });

  // Re-query with full includes for serialization
  const full = await prisma.house.findFirst({
    where: { id },
    include: {
      area: { select: { id: true, name: true, code: true } },
      officer: { select: { id: true, name: true } },
      assignments: {
        where: { status: "ACTIVE" },
        include: { coinBox: { select: { id: true, boxNumber: true, status: true } } },
        take: 1
      },
      photo: { select: { id: true, mimeType: true } },
      photos: { select: { id: true, type: true, file: true } },
      _count: { select: { withdrawals: true, logs: true, photos: true } }
    }
  });

  // Log update
  await prisma.houseLog.create({
    data: {
      houseId: id,
      action: "house.updated",
      description: "Data rumah diperbarui",
      metadata: data
    }
  });

  return full!;
}

export async function deleteHouse(id: number) {
  const house = await prisma.house.findFirst({ where: { id, deletedAt: null } });
  if (!house) throw new Error("NOT_FOUND");

  return prisma.house.update({
    where: { id },
    data: { status: "nonaktif", deletedAt: new Date() }
  });
}

export function serializeHouse(house: Awaited<ReturnType<typeof listHouses>>[number]) {
  const assignment = house.assignments[0];
  return {
    id: house.id,
    houseCode: house.houseCode || "",
    headOfFamily: house.headOfFamily,
    spouseName: house.spouseName || "",
    phone: house.phone ?? "",
    whatsapp: house.whatsapp ?? "",
    email: house.email ?? "",
    address: house.address,
    rt: house.rt || "",
    rw: house.rw || "",
    hamlet: house.hamlet || "",
    postalCode: house.postalCode || "",
    locationNote: house.locationNote || "",
    latitude: house.latitude,
    longitude: house.longitude,
    status: house.status,
    officerName: house.officer?.name || "",
    officerId: house.officer?.id || null,
    surveyDate: house.surveyDate?.toISOString().slice(0, 10) || "",
    notes: house.notes || "",
    village: house.area.name,
    active: house.status === "aktif",
    joinedAt: house.joinedAt.toISOString().slice(0, 10),
    boxNumber: assignment?.coinBox?.boxNumber ?? "",
    boxStatus: assignment?.coinBox?.status ?? null,
    totalWithdrawals: house._count?.withdrawals ?? 0,
    totalPhotos: house._count?.photos ?? 0,
  };
}
