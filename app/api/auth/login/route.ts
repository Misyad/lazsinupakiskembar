import bcrypt from "bcryptjs";
import type mysql from "mysql2/promise";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { apiJson, applyCorsOrigin, corsPreflight } from "@/lib/api-response";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!email || !password) {
    return applyCorsOrigin(
      apiJson({ error: "Email dan password wajib diisi." }, { status: 400 }),
      request
    );
  }

  const [rows] = await db.execute<mysql.RowDataPacket[]>(
    `SELECT users.id, users.name, users.email, users.password_hash, roles.name AS role
     FROM users
     INNER JOIN roles ON roles.id = users.role_id
     WHERE users.email = ?
       AND users.status = 'active'
     LIMIT 1`,
    [email]
  );

  const user = rows[0];
  if (!user) {
    return applyCorsOrigin(
      apiJson({ error: "Email atau password salah." }, { status: 401 }),
      request
    );
  }

  const valid = await bcrypt.compare(password, String(user.password_hash));
  if (!valid) {
    return applyCorsOrigin(
      apiJson({ error: "Email atau password salah." }, { status: 401 }),
      request
    );
  }

  await db.execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);
  await createSession(Number(user.id));

  return applyCorsOrigin(
    apiJson({
      user: {
        id: Number(user.id),
        name: String(user.name),
        email: String(user.email),
        role: String(user.role)
      }
    }),
    request
  );
}

export function OPTIONS(request: Request) {
  return corsPreflight(request);
}
