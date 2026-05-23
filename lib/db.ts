import mysql from "mysql2/promise";

const databaseUrl =
  process.env.DATABASE_URL ?? "mysql://placeholder:placeholder@127.0.0.1:3306/placeholder";

const globalForDb = globalThis as unknown as {
  mysqlPool?: mysql.Pool;
};

export const db =
  globalForDb.mysqlPool ??
  mysql.createPool({
    uri: databaseUrl,
    connectionLimit: 10,
    namedPlaceholders: true
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.mysqlPool = db;
}
