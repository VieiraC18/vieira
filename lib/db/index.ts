import { neon } from "@neondatabase/serverless";
import type { PGlite } from "@electric-sql/pglite";

export class DatabaseUnavailableError extends Error {
  constructor() {
    super(
      "O banco de dados ainda não está configurado. Tente novamente após a configuração.",
    );
  }
}
export type Statement = { text: string; values?: unknown[] };
type Row = Record<string, unknown>;
type Globals = typeof globalThis & { __vieiraLocalDb?: Promise<PGlite> };
export function databaseMode() {
  return process.env.DATABASE_MODE === "local" &&
    process.env.NODE_ENV !== "production"
    ? "local"
    : process.env.DATABASE_URL
      ? "neon"
      : "unconfigured";
}
export function databaseConfigured() {
  return databaseMode() !== "unconfigured";
}
export async function getLocalClient(): Promise<PGlite> {
  if (databaseMode() !== "local") throw new DatabaseUnavailableError();
  const global = globalThis as Globals;
  global.__vieiraLocalDb ??= (async () => {
    const [{ PGlite }, { mkdir }, { resolve }] = await Promise.all([
      import("@electric-sql/pglite"),
      import("node:fs/promises"),
      import("node:path"),
    ]);
    const directory = resolve(
      process.env.LOCAL_DATABASE_PATH || ".data/vieira",
    );
    await mkdir(directory, { recursive: true });
    const client = new PGlite(directory);
    await client.waitReady;
    return client;
  })();
  return global.__vieiraLocalDb;
}
export async function closeLocalClient() {
  const global = globalThis as Globals;
  if (global.__vieiraLocalDb) {
    try {
      await (await global.__vieiraLocalDb).close();
    } catch {
      /* Preserve the original initialization error. */
    } finally {
      delete global.__vieiraLocalDb;
    }
  }
}
function camel<T>(rows: Row[]): T[] {
  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [
        key.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
        value,
      ]),
    ),
  ) as T[];
}
export async function query<T = Row>(
  text: string,
  values: unknown[] = [],
): Promise<T[]> {
  if (databaseMode() === "local")
    return camel<T>(
      (await (await getLocalClient()).query<Row>(text, values)).rows,
    );
  if (!process.env.DATABASE_URL) throw new DatabaseUnavailableError();
  const client = neon(process.env.DATABASE_URL);
  return camel<T>((await client.query(text, values)) as Row[]);
}
/** Ordered statements commit atomically. Use CTEs for writes depending on query results. */
export async function transaction(statements: Statement[]): Promise<Row[][]> {
  if (databaseMode() === "local")
    return (await getLocalClient()).transaction(async (tx) => {
      const results: Row[][] = [];
      for (const statement of statements)
        results.push(
          camel<Row>(
            (await tx.query<Row>(statement.text, statement.values)).rows,
          ),
        );
      return results;
    });
  if (!process.env.DATABASE_URL) throw new DatabaseUnavailableError();
  const client = neon(process.env.DATABASE_URL);
  const results = await client.transaction(
    statements.map((s) => client.query(s.text, s.values || [])),
  );
  return (results as Row[][]).map((rows) => camel<Row>(rows));
}
export function columnName(key: string) {
  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(key)) throw new Error("Invalid column");
  return `"${key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)}"`;
}
export function insertStatement(
  table: "projects" | "services" | "users" | "leads",
  data: Record<string, unknown>,
): Statement {
  const entries = Object.entries(data);
  return {
    text: `INSERT INTO ${table} (${entries.map(([k]) => columnName(k)).join(",")}) VALUES (${entries.map((_, i) => `$${i + 1}`).join(",")}) RETURNING *`,
    values: entries.map(([, v]) => (Array.isArray(v) ? JSON.stringify(v) : v)),
  };
}
export function updateStatement(
  table: "projects" | "services" | "users",
  id: string,
  data: Record<string, unknown>,
): Statement {
  const entries = Object.entries(data);
  return {
    text: `UPDATE ${table} SET ${entries.map(([k], i) => `${columnName(k)}=$${i + 2}`).join(",")}, updated_at=now() WHERE id=$1 RETURNING *`,
    values: [id, ...entries.map(([, v]) => v)],
  };
}
