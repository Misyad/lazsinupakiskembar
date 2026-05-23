import bcrypt from "bcryptjs";
import { createSession } from "@/lib/auth";
import { apiJson, applyCorsOrigin, corsPreflight } from "@/lib/api-response";
import { prisma } from "@/src/lib/db/prisma";
import { loginSchema } from "@/src/lib/validations/auth";
import { requestIp, writeAuditLog } from "@/src/lib/audit/audit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return applyCorsOrigin(
      apiJson({ error: "Email dan password wajib diisi." }, { status: 400 }),
      request
    );
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findFirst({
    where: {
      email,
      status: "ACTIVE",
      deletedAt: null
    },
    include: {
      userRoles: { include: { role: true } }
    }
  });

  if (!user) {
    return applyCorsOrigin(
      apiJson({ error: "Email atau password salah." }, { status: 401 }),
      request
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return applyCorsOrigin(
      apiJson({ error: "Email atau password salah." }, { status: 401 }),
      request
    );
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  await writeAuditLog({
    actorId: user.id,
    action: "auth.login",
    entityType: "User",
    entityId: user.id,
    ipAddress: requestIp(request)
  });

  return applyCorsOrigin(
    apiJson({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.userRoles[0]?.role.code ?? "PETUGAS",
        roles: user.userRoles.map((item) => item.role.code)
      }
    }),
    request
  );
}

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}
