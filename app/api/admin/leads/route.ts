import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { api, json } from "@/lib/security/http";
import { leadColumns, leadFilters } from "@/lib/server/leads";
export const GET = api(async (request) => {
  await requireAdmin(request);
  const url = new URL(request.url);
  const { where, values } = leadFilters(url);
  const page = z.coerce
    .number()
    .int()
    .min(1)
    .max(100000)
    .parse(url.searchParams.get("page") || 1);
  const limit = z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .parse(url.searchParams.get("limit") || 50);
  const [items, [total]] = await Promise.all([
    query(
      `SELECT ${leadColumns} FROM leads ${where} ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, (page - 1) * limit],
    ),
    query<{ count: number }>(
      `SELECT count(*)::int AS count FROM leads ${where}`,
      values,
    ),
  ]);
  return json({ items, total: total.count, page, limit });
});
