import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";
import {
  databaseConfigured,
  databaseMode,
  closeLocalClient,
  query,
  transaction,
  type Statement,
} from "../lib/db";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");

async function main() {
  if (!databaseConfigured())
    throw new Error(
      "Configure DATABASE_URL (Neon), ou DATABASE_MODE=local para desenvolvimento.",
    );
  await query(
    "CREATE TABLE IF NOT EXISTS vieira_migrations (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const directory = resolve(process.cwd(), "drizzle");
  const files = (await readdir(directory))
    .filter((name) => /^\d+.*\.sql$/.test(name))
    .sort();
  if (!files.length)
    throw new Error(
      "Nenhuma migração encontrada. Execute npm run db:generate.",
    );
  for (const name of files) {
    const source = await readFile(resolve(directory, name), "utf8");
    const checksum = createHash("sha256").update(source).digest("hex");
    const [existing] = await query<{ checksum: string }>(
      "SELECT checksum FROM vieira_migrations WHERE name=$1",
      [name],
    );
    if (existing) {
      if (existing.checksum !== checksum)
        throw new Error(
          `A migração aplicada ${name} foi alterada. Crie uma nova migração.`,
        );
      continue;
    }
    const statements: Statement[] = source
      .split("--> statement-breakpoint")
      .map((text) => ({ text: text.trim() }))
      .filter((s) => s.text);
    statements.push({
      text: "INSERT INTO vieira_migrations (name,checksum) VALUES ($1,$2)",
      values: [name, checksum],
    });
    await transaction(statements);
    console.log(`Migração aplicada: ${name}`);
  }
  console.log(`Banco ${databaseMode()}: migrações concluídas.`);
}
main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Falha ao migrar banco.",
    );
    process.exitCode = 1;
  })
  .finally(closeLocalClient);
