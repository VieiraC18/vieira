import { requireAdmin } from "@/lib/auth";
import { query, transaction, type Statement } from "@/lib/db";
import { api, json, readJson } from "@/lib/security/http";
import { auditStatement } from "@/lib/server/audit";
import { defaultSettings } from "@/lib/server/defaults";
import { settingsSchema } from "@/lib/validators";

export const GET = api(async (request) => {
  await requireAdmin(request, ["admin"]);
  const rows = await query<{ key: string; value: unknown }>(
    "SELECT key,value FROM site_settings",
  );
  return json({
    settings: {
      ...defaultSettings,
      ...Object.fromEntries(rows.map((row) => [row.key, row.value])),
    },
  });
});
export const PUT = api(async (request) => {
  const actor = await requireAdmin(request, ["admin"]);
  const input = settingsSchema.parse(await readJson(request));
  const statements: Statement[] = Object.entries(input).map(([key, value]) => ({
    text: "INSERT INTO site_settings (key,value) VALUES ($1,$2::jsonb) ON CONFLICT (key) DO UPDATE SET value=excluded.value,updated_at=now()",
    values: [key, JSON.stringify(value)],
  }));
  for (const [platform, url] of [
    ["instagram", input.instagram],
    ["linkedin", input.linkedin],
    ["github", input.github],
  ])
    statements.push({
      text: "INSERT INTO social_links (platform,url,active) VALUES ($1,$2,$3) ON CONFLICT (platform) DO UPDATE SET url=excluded.url,active=excluded.active",
      values: [platform, url, Boolean(url)],
    });
  statements.push(
    auditStatement(actor.id, "update", "settings", null, {
      keys: Object.keys(input),
    }),
  );
  await transaction(statements);
  return json({ settings: input });
});
