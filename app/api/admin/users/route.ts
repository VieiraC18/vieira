import { hash } from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import {
  insertStatement,
  query,
  transaction,
  updateStatement,
  type Statement,
} from "@/lib/db";
import { api, ApiError, json, readJson } from "@/lib/security/http";
import { audited } from "@/lib/server/mutations";
import {
  parsePatch,
  passwordSchema,
  userSchema,
  uuidSchema,
} from "@/lib/validators";

const columns = "id,name,email,role,active,created_at,updated_at";
const lock: Statement = {
  text: "SELECT pg_advisory_xact_lock(87302411)",
  values: [],
};
// The same lock serializes account removals and demotions, including concurrent requests.
const preserveAdministrator =
  "AND (NOT (role='admin' AND active=true) OR (SELECT count(*) FROM users WHERE role='admin' AND active=true)>1)";
const editSchema = userSchema
  .omit({ password: true })
  .partial()
  .extend({
    id: uuidSchema,
    password: z.union([z.literal(""), passwordSchema]).optional(),
  })
  .strict();
export const GET = api(async (request) => {
  await requireAdmin(request, ["admin"]);
  const items = await query(
    `SELECT ${columns} FROM users ORDER BY created_at DESC`,
  );
  return json({ items, total: items.length });
});
export const POST = api(async (request) => {
  const actor = await requireAdmin(request, ["admin"]);
  const { password, ...input } = userSchema.parse(
    await readJson(request, 8192),
  );
  const insert = insertStatement("users", {
    ...input,
    passwordHash: await hash(password, 12),
  });
  insert.text = insert.text.replace("RETURNING *", `RETURNING ${columns}`);
  const statement = audited(insert, actor.id, "create", "user");
  const [item] = await query(statement.text, statement.values);
  return json({ item }, 201);
});
export const PATCH = api(async (request) => {
  const actor = await requireAdmin(request, ["admin"]);
  const { id, password, ...input } = parsePatch(
    editSchema,
    await readJson(request, 8192),
  );
  if (!Object.keys(input).length && !password)
    throw new ApiError(422, "Informe os campos que deseja alterar.");
  if (id === actor.id && (input.active === false || input.role === "editor"))
    throw new ApiError(
      409,
      "Use outra conta administradora para alterar seu próprio acesso.",
    );
  const [existing] = await query<{
    id: string;
    role: string;
    active: boolean;
    email: string;
  }>("SELECT id,role,active,email FROM users WHERE id=$1", [id]);
  if (!existing) throw new ApiError(404, "Usuário não encontrado.");
  const values: Record<string, unknown> = { ...input };
  if (password) values.passwordHash = await hash(password, 12);
  const update = updateStatement("users", id, values);
  update.text = update.text.replace(
    "RETURNING *",
    `${input.active === false || input.role === "editor" ? preserveAdministrator : ""} RETURNING ${columns}`,
  );
  const statements = [lock, audited(update, actor.id, "update", "user")];
  if (
    password ||
    (input.role !== undefined && input.role !== existing.role) ||
    (input.active !== undefined && input.active !== existing.active) ||
    (input.email !== undefined && input.email !== existing.email)
  )
    statements.push({
      text: "DELETE FROM sessions WHERE user_id=$1",
      values: [id],
    });
  const results = await transaction(statements);
  if (!results[1].length)
    throw new ApiError(
      409,
      "Mantenha ao menos um administrador ativo no sistema.",
    );
  return json({ item: results[1][0] });
});
export const PUT = PATCH;
export const DELETE = api(async (request) => {
  const actor = await requireAdmin(request, ["admin"]);
  const { id } = z
    .object({ id: uuidSchema })
    .strict()
    .parse(await readJson(request));
  if (id === actor.id)
    throw new ApiError(409, "Não é possível excluir sua própria conta.");
  const [existing] = await query("SELECT id FROM users WHERE id=$1", [id]);
  if (!existing) throw new ApiError(404, "Usuário não encontrado.");
  const results = await transaction([
    lock,
    audited(
      {
        text: `DELETE FROM users WHERE id=$1 ${preserveAdministrator} RETURNING id`,
        values: [id],
      },
      actor.id,
      "delete",
      "user",
    ),
  ]);
  if (!results[1].length)
    throw new ApiError(
      409,
      "Mantenha ao menos um administrador ativo no sistema.",
    );
  return json({ ok: true });
});
