import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { api, ApiError, json, readJson } from "@/lib/security/http";
import { audited } from "@/lib/server/mutations";
import { leadColumns, updateLead } from "@/lib/server/leads";
import { statusSchema, uuidSchema } from "@/lib/validators";
export const GET = api(async (request, context) => {
  await requireAdmin(request);
  const id = uuidSchema.parse((await context.params).id);
  const [[lead], notes, events] = await Promise.all([
    query(`SELECT ${leadColumns} FROM leads WHERE id=$1`, [id]),
    query(
      "SELECT n.id,n.body,n.created_at,COALESCE(u.name,'Usuário removido') AS author_name FROM lead_notes n LEFT JOIN users u ON u.id=n.author_id WHERE n.lead_id=$1 ORDER BY n.created_at DESC",
      [id],
    ),
    query(
      "SELECT id,type,description,metadata,created_at FROM lead_events WHERE lead_id=$1 ORDER BY created_at DESC",
      [id],
    ),
  ]);
  if (!lead) throw new ApiError(404, "Lead não encontrado.");
  return json({ lead, notes, events });
});
export const PATCH = api(async (request, context) => {
  const actor = await requireAdmin(request);
  const id = uuidSchema.parse((await context.params).id);
  const body = z
    .object({
      status: statusSchema.optional(),
      note: z.string().trim().min(1).max(6000).optional(),
    })
    .strict()
    .refine((v) => v.status || v.note)
    .parse(await readJson(request));
  await updateLead(id, actor.id, body);
  return json({ ok: true });
});
export const DELETE = api(async (request, context) => {
  const actor = await requireAdmin(request, ["admin"]);
  const id = uuidSchema.parse((await context.params).id);
  const statement = audited(
    { text: "DELETE FROM leads WHERE id=$1 RETURNING id", values: [id] },
    actor.id,
    "delete",
    "lead",
  );
  if (!(await query(statement.text, statement.values)).length)
    throw new ApiError(404, "Lead não encontrado.");
  return json({ ok: true });
});
