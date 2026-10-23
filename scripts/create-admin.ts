import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { loadEnvConfig } from "@next/env";
import { closeLocalClient, query, transaction } from "../lib/db";
import { userSchema } from "../lib/validators";
import { auditStatement } from "../lib/server/audit";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
async function main() {
  const input = userSchema.safeParse({
    name: process.env.ADMIN_NAME ?? "Administrador",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: "admin",
    active: true,
  });
  if (!input.success)
    throw new Error(
      "Defina ADMIN_EMAIL e ADMIN_PASSWORD (12 a 72 bytes) no ambiente. ADMIN_NAME é opcional.",
    );
  const [existing] = await query("SELECT id FROM users WHERE email=$1", [
    input.data.email,
  ]);
  if (existing)
    throw new Error(
      "Esse e-mail já está cadastrado. Gerencie o acesso pelo painel de usuários.",
    );
  const id = randomUUID();
  await transaction([
    {
      text: "INSERT INTO users (id,name,email,password_hash,role,active) VALUES ($1,$2,$3,$4,'admin',true)",
      values: [
        id,
        input.data.name,
        input.data.email,
        await hash(input.data.password, 12),
      ],
    },
    auditStatement(id, "create", "user", id, { method: "bootstrap" }),
  ]);
  console.log(
    "Administrador criado. Use o e-mail e a senha definidos no ambiente para entrar em /admin/login.",
  );
}
main()
  .catch((error) => {
    console.error(
      error instanceof Error ? error.message : "Falha ao criar administrador.",
    );
    process.exitCode = 1;
  })
  .finally(closeLocalClient);
