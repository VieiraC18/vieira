import { loadEnvConfig } from "@next/env";
import {
  closeLocalClient,
  insertStatement,
  transaction,
  type Statement,
} from "../lib/db";
import {
  defaultContent,
  defaultServices,
  defaultSettings,
} from "../lib/server/defaults";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
async function main() {
  const statements: Statement[] = [];
  for (const service of defaultServices) {
    const insert = insertStatement("services", service);
    insert.text = insert.text.replace(
      "RETURNING *",
      "ON CONFLICT (slug) DO NOTHING",
    );
    statements.push(insert);
  }
  for (const [key, value] of Object.entries(defaultSettings))
    statements.push({
      text: "INSERT INTO site_settings (key,value) VALUES ($1,$2::jsonb) ON CONFLICT (key) DO NOTHING",
      values: [key, JSON.stringify(value)],
    });
  for (const [key, value] of Object.entries(defaultContent))
    statements.push({
      text: "INSERT INTO content_sections (key,value) VALUES ($1,$2::jsonb) ON CONFLICT (key) DO NOTHING",
      values: [key, JSON.stringify(value)],
    });
  await transaction(statements);
  console.log(
    "Serviços, configurações e conteúdo inicial cadastrados. Valores existentes foram preservados.",
  );
}
main()
  .catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : "Falha ao cadastrar conteúdo inicial.",
    );
    process.exitCode = 1;
  })
  .finally(closeLocalClient);
