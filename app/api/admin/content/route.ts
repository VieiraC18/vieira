import { requireAdmin } from "@/lib/auth";
import { query, transaction } from "@/lib/db";
import { api, json, readJson } from "@/lib/security/http";
import { auditStatement } from "@/lib/server/audit";
import { defaultContent } from "@/lib/server/defaults";
import { contentSchema } from "@/lib/validators";

export const GET = api(async (request) => {
  await requireAdmin(request);
  const rows = await query<{ key: string; value: unknown }>(
    "SELECT key,value FROM content_sections",
  );
  return json({
    sections: {
      ...defaultContent,
      ...Object.fromEntries(
        rows.map((row) => [
          row.key,
          row.value &&
          typeof row.value === "object" &&
          !Array.isArray(row.value)
            ? { ...((defaultContent[row.key] as object) ?? {}), ...row.value }
            : row.value,
        ]),
      ),
    },
  });
});
export const PUT = api(async (request) => {
  const actor = await requireAdmin(request);
  const { key, value } = contentSchema.parse(await readJson(request));
  await transaction([
    {
      text: "INSERT INTO content_sections (key,value) VALUES ($1,$2::jsonb) ON CONFLICT (key) DO UPDATE SET value=excluded.value,updated_at=now()",
      values: [key, JSON.stringify(value)],
    },
    auditStatement(actor.id, "update", "content", key),
  ]);
  return json({ ok: true });
});
