import { type Statement } from "@/lib/db";

/** Audits only records actually changed, inside the same atomic database statement. */
export function audited(
  statement: Statement,
  actorId: string,
  action: string,
  entity: string,
): Statement {
  const values = [...(statement.values ?? []), actorId, action, entity];
  const offset = values.length - 3;
  return {
    text: `WITH changed AS (${statement.text}), logged AS (INSERT INTO audit_logs (user_id,action,entity,entity_id) SELECT $${offset + 1},$${offset + 2},$${offset + 3},id::text FROM changed RETURNING id) SELECT * FROM changed`,
    values,
  };
}
