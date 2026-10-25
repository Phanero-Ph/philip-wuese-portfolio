import mysql, { type Pool, type RowDataPacket } from "mysql2/promise";

const globalForDb = globalThis as unknown as { portfolioPool?: Pool };

export const db = globalForDb.portfolioPool ?? mysql.createPool({
  host: process.env.DATABASE_HOST || process.env.DB_HOST,
  port: Number(process.env.DATABASE_PORT || process.env.DB_PORT || 3306),
  database: process.env.DATABASE_NAME || process.env.DB_DATABASE,
  user: process.env.DATABASE_USER || process.env.DB_USERNAME,
  password: process.env.DATABASE_PASSWORD ?? process.env.DB_PASSWORD,
  charset: "utf8mb4",
  connectionLimit: 10,
  enableKeepAlive: true,
});

if (process.env.NODE_ENV !== "production") globalForDb.portfolioPool = db;

export type DbRow = RowDataPacket & Record<string, unknown>;

export function parseJson<T>(value: unknown): T {
  if (typeof value === "string") return JSON.parse(value) as T;
  return value as T;
}
