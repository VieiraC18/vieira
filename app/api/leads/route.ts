import { randomUUID } from "node:crypto";
import { insertStatement, query } from "@/lib/db";
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
import { getPublicSettings } from "@/lib/server/public";
import { leadSchema, normalizeLead } from "@/lib/validators";
export const POST = api(async (request) => {
  assertSameOrigin(request);
  const input = leadSchema.parse(
    normalizeLead(
      await readJson(request),
      request.headers.get("Idempotency-Key"),
    ),
  );
  await rateLimit("lead-ip", requestAddress(request), 15, 3600);
  await rateLimit("lead-email", input.email, 5, 3600);
  const settings = await getPublicSettings();
  const { consent, website, ...data } = input;
  void consent;
  void website;
  data.budget =
    settings.budgetEnabled && settings.budgetRanges.includes(data.budget)
      ? data.budget
      : "";
  const { idempotencyKey, ...fingerprintData } = data;
  const payloadHash = fingerprint(JSON.stringify(fingerprintData));
  const statement = insertStatement("leads", {
    id: randomUUID(),
    ...data,
    idempotencyKey,
    payloadHash,
  });
  const text = `WITH inserted AS (${statement.text.replace(" RETURNING *", " ON CONFLICT (idempotency_key) DO NOTHING RETURNING id,payload_hash")}), event AS (INSERT INTO lead_events (lead_id,type,description) SELECT id,'created','Lead criado pelo formulário de orçamento.' FROM inserted RETURNING id) SELECT id,payload_hash FROM inserted UNION ALL SELECT id,payload_hash FROM leads WHERE idempotency_key=$${(statement.values?.length ?? 0) + 1} LIMIT 1`;
  let [row] = await query<{ id: string; payloadHash: string }>(text, [
    ...statement.values!,
    idempotencyKey,
  ]);
  // A simultaneous request can commit between the INSERT conflict and the snapshot SELECT.
  if (!row)
    [row] = await query<{ id: string; payloadHash: string }>(
      "SELECT id,payload_hash FROM leads WHERE idempotency_key=$1",
      [idempotencyKey],
    );
  if (!row)
    throw new ApiError(
      409,
      "Não foi possível confirmar o envio. Tente novamente com os mesmos dados.",
    );
  if (row.payloadHash !== payloadHash)
    throw new ApiError(
      409,
      "Este envio já foi utilizado com outros dados. Atualize a página para iniciar outro projeto.",
    );
  const message = [
    `Olá! Meu nome é ${data.name} e gostaria de conversar com a VIEIRA SYSTEMS.`,
    "",
    `EMPRESA\n${data.company || "Não informada"}`,
    `NECESSIDADE\n${data.needs.join(", ")}`,
    `PROBLEMA\n${data.problem}`,
    `PROCESSO ATUAL\n${data.currentProcess}`,
    `FUNCIONALIDADES\n${data.features.join(", ") || "A definir"}`,
    `PRIORIDADE\n${data.priority}`,
    "Gostaria de entender quais soluções a VIEIRA SYSTEMS recomenda para esse cenário.",
  ].join("\n\n");
  const number = settings.whatsapp.replace(/\D/g, "");
  return json(
    {
      id: row.id,
      whatsappUrl: number
        ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
        : null,
    },
    201,
  );
});
