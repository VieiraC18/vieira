import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";
import { api, json } from "@/lib/security/http";
import { leadFilters } from "@/lib/server/leads";
export const GET = api(async (request) => {
  await requireAdmin(request);
  const { where, values } = leadFilters(new URL(request.url));
  const [metrics, period, source, status, category, recent] = await Promise.all(
    [
      query(
        `SELECT count(*)::int AS total,count(*) FILTER(WHERE status='new')::int AS new,count(*) FILTER(WHERE created_at>=date_trunc('month',now() AT TIME ZONE 'America/Sao_Paulo') AT TIME ZONE 'America/Sao_Paulo')::int AS this_month,count(*) FILTER(WHERE status='meeting')::int AS meetings,count(*) FILTER(WHERE status='proposal')::int AS proposals,count(*) FILTER(WHERE status='negotiation')::int AS negotiation,count(*) FILTER(WHERE status='closed')::int AS closed,COALESCE(round(100.0*count(*) FILTER(WHERE status='closed')/NULLIF(count(*),0),1),0)::float AS conversion FROM leads ${where}`,
        values,
      ),
      query(
        `SELECT to_char(created_at AT TIME ZONE 'America/Sao_Paulo','YYYY-MM-DD') AS label,count(*)::int AS value FROM leads ${where} GROUP BY 1 ORDER BY 1`,
        values,
      ),
      query(
        `SELECT COALESCE(NULLIF(utm_source,''),NULLIF(source,''),'direct') AS label,count(*)::int AS value FROM leads ${where} GROUP BY 1 ORDER BY 2 DESC`,
        values,
      ),
      query(
        `SELECT status AS label,count(*)::int AS value FROM leads ${where} GROUP BY 1 ORDER BY 2 DESC`,
        values,
      ),
      query(
        `SELECT need AS label,count(*)::int AS value FROM leads CROSS JOIN LATERAL jsonb_array_elements_text(needs) AS need ${where} GROUP BY 1 ORDER BY 2 DESC`,
        values,
      ),
      query(
        `SELECT id,name,company,email,needs,status,priority,created_at FROM leads ${where} ORDER BY created_at DESC LIMIT 8`,
        values,
      ),
    ],
  );
  return json({
    metrics: metrics[0],
    charts: { period, source, status, category, services: category },
    leads: recent,
  });
});
