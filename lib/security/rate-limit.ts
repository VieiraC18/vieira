import { createHmac } from "node:crypto";
import { query } from "@/lib/db";
import { ApiError } from "@/lib/security/http";

export function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32)
    throw new ApiError(
      503,
      "A configuração de segurança do sistema está incompleta.",
    );
  return value;
}
export function fingerprint(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
export function requestAddress(request: Request) {
  // Vercel overwrites this header. Self-hosted proxies must explicitly opt in.
  if (process.env.VERCEL)
    return (
      request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown"
    );
  if (process.env.TRUST_PROXY === "1")
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    );
  return "shared";
}
export async function rateLimit(
  scope: string,
  identity: string,
  limit: number,
  windowSeconds: number,
) {
  const key = `${scope}:${fingerprint(identity)}`;
  // Bounded retention: fingerprints are operational abuse counters, not visitor history.
  await query(
    "DELETE FROM rate_limits WHERE reset_at < now() - interval '1 day'",
  );
  const [row] = await query<{ count: number; resetAt: Date | string }>(
    `INSERT INTO rate_limits (key,count,reset_at) VALUES ($1,1,now()+($2 * interval '1 second')) ON CONFLICT (key) DO UPDATE SET count=CASE WHEN rate_limits.reset_at<=now() THEN 1 ELSE rate_limits.count+1 END,reset_at=CASE WHEN rate_limits.reset_at<=now() THEN now()+($2 * interval '1 second') ELSE rate_limits.reset_at END RETURNING count,reset_at`,
    [key, windowSeconds],
  );
  if (row.count > limit)
    throw new ApiError(
      429,
      "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      {
        "Retry-After": String(
          Math.max(
            1,
            Math.ceil((new Date(row.resetAt).getTime() - Date.now()) / 1000),
          ),
        ),
      },
    );
}
