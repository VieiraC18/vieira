import { z } from "zod";
import { DatabaseUnavailableError } from "@/lib/db";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public headers?: Record<string, string>,
  ) {
    super(message);
  }
}
export function assertSameOrigin(request: Request) {
  const supplied = request.headers.get("origin");
  const configured =
    process.env.APP_URL ||
    (process.env.NODE_ENV !== "production" ? new URL(request.url).origin : "");
  if (!configured)
    throw new ApiError(
      503,
      "Defina APP_URL antes de habilitar as operações do sistema.",
    );
  let expected: string;
  try {
    expected = new URL(configured).origin;
  } catch {
    throw new ApiError(503, "A URL do sistema está inválida.");
  }
  if (
    !supplied ||
    supplied !== expected ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    throw new ApiError(403, "Origem da solicitação não autorizada.");
}
export async function readJson(
  request: Request,
  maxBytes = 65536,
): Promise<Record<string, unknown>> {
  if (
    !request.headers
      .get("content-type")
      ?.toLowerCase()
      .startsWith("application/json")
  )
    throw new ApiError(415, "Envie os dados no formato JSON.");
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maxBytes)
    throw new ApiError(413, "O conteúdo excede o limite permitido.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "O corpo da solicitação está vazio.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new ApiError(413, "O conteúdo excede o limite permitido.");
    }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const body: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body))
      throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new ApiError(400, "JSON inválido.");
  }
}
export function json(
  data: unknown,
  status = 200,
  headers?: Record<string, string>,
) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
export function api(
  handler: (
    request: Request,
    context: { params: Promise<Record<string, string>> },
  ) => Promise<Response>,
) {
  return async (
    request: Request,
    context: { params: Promise<Record<string, string>> },
  ) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof ApiError)
        return json({ error: error.message }, error.status, error.headers);
      if (error instanceof DatabaseUnavailableError)
        return json({ error: error.message }, 503);
      if (error instanceof z.ZodError)
        return json(
          {
            error: "Revise os campos informados.",
            issues: error.issues.map((i) => ({
              path: i.path.join("."),
              message: i.message,
            })),
          },
          422,
        );
      const code =
        error && typeof error === "object" && "code" in error
          ? String(error.code)
          : "";
      if (code === "23505")
        return json({ error: "Já existe um registro com esses dados." }, 409);
      // Never log SQL parameters, lead data, passwords, or session tokens.
      console.error("[api] Operation failed", {
        type: error instanceof Error ? error.name : "UnknownError",
        code,
      });
      return json(
        { error: "Não foi possível concluir a operação. Tente novamente." },
        500,
      );
    }
  };
}
