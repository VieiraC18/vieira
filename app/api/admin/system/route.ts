import { requireAdmin } from "@/lib/auth";
import { databaseConfigured, databaseMode, query } from "@/lib/db";
import { api, json } from "@/lib/security/http";

export const GET = api(async (request) => {
  await requireAdmin(request, ["admin"]);
  const [[counts], auditLogs] = await Promise.all([
    query(
      "SELECT (SELECT count(*)::int FROM leads) AS leads,(SELECT count(*)::int FROM projects) AS projects,(SELECT count(*)::int FROM services) AS services,(SELECT count(*)::int FROM users) AS users,(SELECT count(*)::int FROM sessions WHERE expires_at>now()) AS sessions",
    ),
    query(
      "SELECT a.id,a.action,a.entity,a.entity_id,a.created_at,COALESCE(u.name,'Sistema') AS user_name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 100",
    ),
  ]);
  return json({
    database: {
      connected: true,
      configured: databaseConfigured(),
      message:
        databaseMode() === "local"
          ? "PostgreSQL local de desenvolvimento (PGlite)."
          : "PostgreSQL Neon conectado.",
    },
    counts,
    auditLogs,
    environment: process.env.NODE_ENV ?? "development",
  });
});
