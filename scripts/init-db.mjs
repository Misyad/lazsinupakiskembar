import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const connection = await mysql.createConnection(databaseUrl);

await connection.query(`
  CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await connection.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    phone VARCHAR(30) NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    last_login_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

await connection.query(`
  CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_expires_at (expires_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`);

const roles = [
  ["Super Admin", "Akses penuh sistem"],
  ["Admin Ranting", "Mengelola data operasional ranting"],
  ["Petugas Lapangan", "Input penarikan dan tugas lapangan"],
  ["Bendahara", "Validasi dan rekap keuangan"],
  ["Viewer Publik", "Akses ringkasan transparansi"]
];

for (const [name, description] of roles) {
  await connection.execute(
    `INSERT INTO roles (name, description)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE description = VALUES(description)`,
    [name, description]
  );
}

const passwordHash = await bcrypt.hash("Admin123!", 12);
const users = [
  ["Admin Pusat", "superadmin@koinnu.local", "Super Admin"],
  ["Admin Ranting", "admin@ranting.local", "Admin Ranting"],
  ["Petugas A", "petugas@ranting.local", "Petugas Lapangan"],
  ["Bendahara", "bendahara@ranting.local", "Bendahara"],
  ["Viewer Publik", "publik@koinnu.local", "Viewer Publik"]
];

for (const [name, email, roleName] of users) {
  await connection.execute(
    `INSERT INTO users (name, email, password_hash, role_id, status)
     SELECT ?, ?, ?, roles.id, 'active'
     FROM roles
     WHERE roles.name = ?
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       role_id = VALUES(role_id),
       status = 'active'`,
    [name, email, passwordHash, roleName]
  );
}

await connection.end();
console.log("Database initialized.");

