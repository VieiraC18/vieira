import { compare, hash } from "bcryptjs";
import { query } from "@/lib/db";
import { createSession, type Session } from "@/lib/auth";
import {
  api,
  ApiError,
  assertSameOrigin,
  json,
  readJson,
} from "@/lib/security/http";
import {
  fingerprint,
  rateLimit,
  requestAddress,
} from "@/lib/security/rate-limit";
import { loginSchema } from "@/lib/validators";
let dummyHash: Promise<string> | undefined;
export const POST = api(async (request) => {
  assertSameOrigin(request);
  const input = loginSchema.parse(await readJson(request, 4096));
  await rateLimit("login-ip", requestAddress(request), 30, 900);
  await rateLimit("login-account", input.email, 8, 900);
  const [user] = await query<
    Session & { passwordHash: string; active: boolean }
  >(
    "SELECT id,name,email,role,password_hash,active FROM users WHERE email=$1",
    [input.email],
  );
  dummyHash ??= hash(fingerprint("nonexistent-account"), 12);
  const valid = await compare(
    input.password,
    user?.passwordHash ?? (await dummyHash),
  );
  if (!user || !user.active || !valid)
    throw new ApiError(401, "E-mail ou senha inválidos.");
  const { id, name, email, role } = user;
  await createSession({ id, name, email, role });
  return json({ user: { id, name, email, role } });
});
