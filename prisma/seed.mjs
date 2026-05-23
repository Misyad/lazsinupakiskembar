import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const permissions = [
  ["houses.read", "Lihat rumah donatur"],
  ["houses.create", "Tambah rumah donatur"],
  ["houses.update", "Ubah rumah donatur"],
  ["houses.delete", "Nonaktifkan rumah donatur"],
  ["coin_boxes.read", "Lihat kaleng"],
  ["coin_boxes.create", "Tambah kaleng"],
  ["coin_boxes.assign", "Assign kaleng"],
  ["withdrawals.read", "Lihat penarikan"],
  ["withdrawals.create", "Input penarikan"],
  ["withdrawals.validate", "Validasi penarikan"],
  ["withdrawals.reject", "Tolak penarikan"],
  ["audit.read", "Lihat audit log"],
  ["settings.manage", "Kelola pengaturan"]
];

const rolePermissions = {
  SUPER_ADMIN: permissions.map(([code]) => code),
  ADMIN_RANTING: [
    "houses.read",
    "houses.create",
    "houses.update",
    "coin_boxes.read",
    "coin_boxes.create",
    "coin_boxes.assign",
    "withdrawals.read",
    "withdrawals.create",
    "withdrawals.validate",
    "withdrawals.reject"
  ],
  PETUGAS: ["houses.read", "coin_boxes.read", "withdrawals.read", "withdrawals.create"],
  BENDAHARA: ["houses.read", "coin_boxes.read", "withdrawals.read", "withdrawals.validate", "withdrawals.reject"]
};

const roles = [
  ["SUPER_ADMIN", "Super Admin", "Akses penuh sistem"],
  ["ADMIN_RANTING", "Admin Ranting", "Mengelola operasional ranting"],
  ["PETUGAS", "Petugas", "Input penarikan dan tugas lapangan"],
  ["BENDAHARA", "Bendahara", "Validasi dan rekap keuangan"]
];

async function main() {
  for (const [code, name] of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: { name },
      create: { code, name }
    });
  }

  for (const [code, name, description] of roles) {
    await prisma.role.upsert({
      where: { code },
      update: { name, description },
      create: { code, name, description }
    });
  }

  for (const [roleCode, permissionCodes] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
    const grants = await prisma.permission.findMany({ where: { code: { in: permissionCodes } } });

    for (const permission of grants) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });
    }
  }

  const area = await prisma.area.upsert({
    where: { code: "PAKISKEMBAR" },
    update: { name: "Pakiskembar" },
    create: { code: "PAKISKEMBAR", name: "Pakiskembar" }
  });

  const incomeCategory = await prisma.financialCategory.upsert({
    where: { code: "KOIN_RUTIN" },
    update: { name: "Pemasukan KOIN NU", type: "INCOME" },
    create: { code: "KOIN_RUTIN", name: "Pemasukan KOIN NU", type: "INCOME" }
  });

  await prisma.financialCategory.upsert({
    where: { code: "PENYALURAN_SOSIAL" },
    update: { name: "Penyaluran Sosial", type: "EXPENSE" },
    create: { code: "PENYALURAN_SOSIAL", name: "Penyaluran Sosial", type: "EXPENSE" }
  });

  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const users = [
    ["Admin Pusat", "superadmin@koinnu.local", "SUPER_ADMIN"],
    ["Admin Ranting", "admin@ranting.local", "ADMIN_RANTING"],
    ["Petugas A", "petugas@ranting.local", "PETUGAS"],
    ["Bendahara", "bendahara@ranting.local", "BENDAHARA"]
  ];

  for (const [name, email, roleCode] of users) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, status: "ACTIVE" },
      create: { name, email, passwordHash, status: "ACTIVE" }
    });
    const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: role.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        roleId: role.id
      }
    });
  }

  const seededHouses = [
    ["Keluarga H. Mahfudz", "081234567890", "Jl. Masjid RT 01 RW 02", "RT01/RW02", "KNU-RT01-001"],
    ["Keluarga Ibu Aminah", "082223334444", "Jl. Pesantren RT 02 RW 02", "RT02/RW02", "KNU-RT02-014"],
    ["Keluarga Bu Siti", "081999223344", "Jl. Langgar RT 01 RW 01", "RT01/RW01", "KNU-RT01-021"]
  ];

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@ranting.local" } });

  for (const [name, phone, address, rtRw, boxNumber] of seededHouses) {
    const existingHouse = await prisma.house.findFirst({ where: { name, deletedAt: null } });
    const house =
      existingHouse ??
      (await prisma.house.create({
        data: {
          areaId: area.id,
          name,
          phone,
          address,
          rtRw,
          joinedAt: new Date("2026-01-08")
        }
      }));

    const box = await prisma.coinBox.upsert({
      where: { boxNumber },
      update: {},
      create: {
        boxNumber,
        status: "ACTIVE",
        distributedAt: new Date("2026-01-08")
      }
    });

    const existingAssignment = await prisma.coinBoxAssignment.findFirst({
      where: { coinBoxId: box.id, houseId: house.id, status: "ACTIVE" }
    });
    if (!existingAssignment) {
      await prisma.coinBoxAssignment.create({
        data: { coinBoxId: box.id, houseId: house.id, status: "ACTIVE" }
      });
    }
  }

  const firstBox = await prisma.coinBox.findUniqueOrThrow({ where: { boxNumber: "KNU-RT01-001" } });
  const firstHouse = await prisma.house.findFirstOrThrow({ where: { name: "Keluarga H. Mahfudz", deletedAt: null } });
  const existingWithdrawal = await prisma.withdrawal.findFirst({ where: { coinBoxId: firstBox.id, houseId: firstHouse.id } });

  if (!existingWithdrawal) {
    const withdrawal = await prisma.withdrawal.create({
      data: {
        coinBoxId: firstBox.id,
        houseId: firstHouse.id,
        collectorId: admin.id,
        amount: 127500,
        status: "VALIDATED",
        notes: "Setoran rutin bulan Mei",
        collectedAt: new Date("2026-05-03T09:12:00"),
        validatedAt: new Date("2026-05-03T10:00:00")
      }
    });
    await prisma.cashTransaction.create({
      data: {
        categoryId: incomeCategory.id,
        withdrawalId: withdrawal.id,
        type: "INCOME",
        amount: withdrawal.amount,
        description: "Pemasukan KOIN NU tervalidasi",
        transactionAt: withdrawal.validatedAt ?? new Date()
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Prisma seed completed.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
