import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import type mysql from "mysql2/promise";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/session-cookie";

export type AuthRole =
  | "Super Admin"
  | "Admin Ranting"
  | "Petugas Lapangan"
  | "Bendahara"
  | "Viewer Publik";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
};

const SESSION_DAYS = 7;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.execute(
    `INSERT INTO user_sessions (user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [userId, tokenHash, expiresAt]
  );

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
    await db.execute("DELETE FROM user_sessions WHERE token_hash = ?", [hashToken(token)]);
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT users.id, users.name, users.email, roles.name AS role
     FROM user_sessions
     INNER JOIN users ON users.id = user_sessions.user_id
     INNER JOIN roles ON roles.id = users.role_id
     WHERE user_sessions.token_hash = ?
       AND user_sessions.expires_at > NOW()
       AND users.status = 'active'
     LIMIT 1`,
    [hashToken(token)]
  );

  const user = rows[0];
  if (!user) return null;

  return {
    id: Number(user.id),
    name: String(user.name),
    email: String(user.email),
    role: user.role as AuthRole
  };
}
