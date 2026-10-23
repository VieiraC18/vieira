import { type Statement } from "@/lib/db";
export function auditStatement(
  userId: string | null,
  action: string,
  entity: string,
  entityId: string | null,
  metadata: Record<string, unknown> = {},
): Statement {
  return {
    text: "INSERT INTO audit_logs (user_id,action,entity,entity_id,metadata) VALUES ($1,$2,$3,$4,$5::jsonb)",
    values: [userId, action, entity, entityId, JSON.stringify(metadata)],
  };
}
