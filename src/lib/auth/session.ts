import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/db/prisma";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import type { PermissionCode, RoleCode } from "@/src/lib/permissions/permissions";

const SESSION_DAYS = 7;

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  roles: RoleCode[];
  permissions: string[];
  role: RoleCode;
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.userSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await prisma.userSession.findFirst({
    where: {
      tokenHash: hashToken(token),
      expiresAt: { gt: new Date() },
      user: {
        status: "ACTIVE",
        deletedAt: null
      }
    },
    include: {
      user: {
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: { permission: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!session) return null;

  const roles = session.user.userRoles.map((item) => item.role.code as RoleCode);
  const permissions = Array.from(
    new Set(
      session.user.userRoles.flatMap((item) =>
        item.role.rolePermissions.map((grant) => grant.permission.code)
      )
    )
  );

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    phone: session.user.phone,
    roles,
    permissions,
    role: roles[0] ?? "PETUGAS"
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(roles: RoleCode[]) {
  const user = await requireAuth();
  if (!user.roles.some((role) => roles.includes(role))) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function requirePermission(permission: PermissionCode) {
  const user = await requireAuth();
  if (!user.permissions.includes(permission)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return user;
}

export async function requireApiAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user, response: null };
}

export async function requireApiPermission(permission: PermissionCode) {
  const { user, response } = await requireApiAuth();
  if (response || !user) return { user: null, response };

  if (!user.permissions.includes(permission)) {
    return { user: null, response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, response: null };
}
