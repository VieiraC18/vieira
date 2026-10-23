import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { insertStatement, query, updateStatement } from "@/lib/db";
import { api, ApiError, json, readJson } from "@/lib/security/http";
import { audited } from "@/lib/server/mutations";
import { parsePatch, serviceSchema, uuidSchema } from "@/lib/validators";

export const GET = api(async (request) => {
  await requireAdmin(request);
  const items = await query('SELECT * FROM services ORDER BY "order",name');
  return json({ items, total: items.length });
});
export const POST = api(async (request) => {
  const actor = await requireAdmin(request);
  const statement = audited(
    insertStatement("services", serviceSchema.parse(await readJson(request))),
    actor.id,
    "create",
    "service",
  );
  const [item] = await query(statement.text, statement.values);
  return json({ item }, 201);
});
export const PATCH = api(async (request) => {
  const actor = await requireAdmin(request);
  const { id, ...input } = parsePatch(
    serviceSchema.partial().extend({ id: uuidSchema }).strict(),
    await readJson(request),
  );
  if (!Object.keys(input).length)
    throw new ApiError(422, "Informe os campos que deseja alterar.");
  const statement = audited(
    updateStatement("services", id, input),
    actor.id,
    "update",
    "service",
  );
  const [item] = await query(statement.text, statement.values);
  if (!item) throw new ApiError(404, "Serviço não encontrado.");
  return json({ item });
});
export const PUT = PATCH;
export const DELETE = api(async (request) => {
  const actor = await requireAdmin(request);
  const { id } = z
    .object({ id: uuidSchema })
    .strict()
    .parse(await readJson(request));
  const statement = audited(
    { text: "DELETE FROM services WHERE id=$1 RETURNING id", values: [id] },
    actor.id,
    "delete",
    "service",
  );
  if (!(await query(statement.text, statement.values)).length)
    throw new ApiError(404, "Serviço não encontrado.");
  return json({ ok: true });
});
