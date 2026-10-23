import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { databaseConfigured, query, transaction } from "@/lib/db";
import { ApiError, assertSameOrigin } from "@/lib/security/http";
import { auditStatement } from "@/lib/server/audit";
export type Session = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
};
const cookieName = () =>
  process.env.NODE_ENV === "production"
    ? "__Host-vieira_session"
    : "vieira_session";
export const sessionHash = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(cookieName())?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token) || !databaseConfigured())
    return null;
  const [session] = await query<Session>(
    "SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now() AND u.active=true",
    [sessionHash(token)],
  );
  return session ?? null;
}
export async function requireAdmin(
  request?: Request,
  roles: Session["role"][] = ["admin", "editor"],
): Promise<Session> {
  if (request && !["GET", "HEAD", "OPTIONS"].includes(request.method))
    assertSameOrigin(request);
  const session = await getSession();
  if (!session) throw new ApiError(401, "Entre na sua conta para continuar.");
  if (!roles.includes(session.role))
    throw new ApiError(403, "Seu perfil não tem permissão para esta ação.");
  return session;
}
export async function createSession(user: Session) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await transaction([
    { text: "DELETE FROM sessions WHERE expires_at<=now()", values: [] },
    {
      text: "INSERT INTO sessions (token_hash,user_id,expires_at) VALUES ($1,$2,$3)",
      values: [sessionHash(token), user.id, expires],
    },
    auditStatement(user.id, "login", "session", null),
  ]);
  (await cookies()).set(cookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires,
  });
}
export async function revokeSession() {
  const store = await cookies();
  const token = store.get(cookieName())?.value;
  if (token && databaseConfigured())
    await query(
      "WITH revoked AS (DELETE FROM sessions WHERE token_hash=$1 RETURNING user_id) INSERT INTO audit_logs (user_id,action,entity) SELECT user_id,'logout','session' FROM revoked",
      [sessionHash(token)],
    );
  store.set(cookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
