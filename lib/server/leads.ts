import { z } from "zod";
import { statusSchema } from "@/lib/validators";
import { query, transaction, type Statement } from "@/lib/db";
import { ApiError } from "@/lib/security/http";
import { auditStatement } from "@/lib/server/audit";
export function leadFilters(url: URL) {
  const conditions: string[] = [];
  const values: unknown[] = [];
  const add = (sql: string, value: unknown) => {
    values.push(value);
    conditions.push(sql.replace("?", `$${values.length}`));
  };
  const status = url.searchParams.get("status");
  if (status && status !== "all") add("status=?", statusSchema.parse(status));
  const search = url.searchParams.get("q") || url.searchParams.get("search");
  if (search) {
    const value = z.string().max(200).parse(search);
    values.push(`%${value.replace(/[\\%_]/g, "\\$&")}%`);
    conditions.push(
      `(name ILIKE $${values.length} OR email ILIKE $${values.length} OR company ILIKE $${values.length})`,
    );
  }
  for (const [key, operator] of [
    ["from", ">="],
    ["to", "<="],
  ] as const) {
    const v = url.searchParams.get(key);
    if (v) {
      const date = z
        .string()
        .datetime({ offset: true })
        .or(z.string().date())
        .parse(v);
      add(
        `created_at ${operator} ?::timestamptz`,
        date.length === 10
          ? `${date}T${key === "from" ? "00:00:00.000" : "23:59:59.999"}-03:00`
          : date,
      );
    }
  }
  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}
export const leadColumns =
  "id,name,company,email,whatsapp,needs,problem,current_process,manual_work,uses_spreadsheets,has_system,features,priority,budget,status,source,utm_source,utm_medium,utm_campaign,utm_term,utm_content,consent_at,consent_version,created_at,updated_at";
const statusLabels: Record<z.infer<typeof statusSchema>, string> = {
  new: "Novo",
  analyzing: "Analisando",
  contacted: "Contato iniciado",
  meeting: "Reunião",
  proposal: "Proposta",
  negotiation: "Negociação",
  closed: "Fechado",
  lost: "Perdido",
  archived: "Arquivado",
};
export async function updateLead(
  id: string,
  actorId: string,
  input: { status?: z.infer<typeof statusSchema>; note?: string },
) {
  const [lead] = await query("SELECT id FROM leads WHERE id=$1", [id]);
  if (!lead) throw new ApiError(404, "Lead não encontrado.");
  const statements: Statement[] = [];
  if (input.status)
    statements.push({
      text: "WITH previous AS MATERIALIZED (SELECT status FROM leads WHERE id=$1 FOR UPDATE),changed AS (UPDATE leads l SET status=$2::lead_status,updated_at=now() FROM previous WHERE l.id=$1 AND l.status<>$2::lead_status RETURNING l.id) INSERT INTO lead_events (lead_id,actor_id,type,description,metadata) SELECT changed.id,$3,'status_changed',$4,jsonb_build_object('from',previous.status,'to',$2::text) FROM changed,previous",
      values: [
        id,
        input.status,
        actorId,
        `Status alterado para ${statusLabels[input.status]}.`,
      ],
    });
  if (input.note)
    statements.push(
      {
        text: "INSERT INTO lead_notes (lead_id,author_id,body) VALUES ($1,$2,$3)",
        values: [id, actorId, input.note],
      },
      {
        text: "INSERT INTO lead_events (lead_id,actor_id,type,description) VALUES ($1,$2,'note_added','Nota adicionada ao atendimento.')",
        values: [id, actorId],
      },
    );
  statements.push(
    auditStatement(actorId, "update", "lead", id, {
      status: input.status,
      noteAdded: !!input.note,
    }),
  );
  await transaction(statements);
}
