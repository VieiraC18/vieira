import { revokeSession } from "@/lib/auth";
import { api, assertSameOrigin, json } from "@/lib/security/http";
export const POST = api(async (request) => {
  assertSameOrigin(request);
  await revokeSession();
  return json({ ok: true });
});
