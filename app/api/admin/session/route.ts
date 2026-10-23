import { requireAdmin } from "@/lib/auth";
import { api, json } from "@/lib/security/http";
export const GET = api(async (request) =>
  json({ user: await requireAdmin(request) }),
);
