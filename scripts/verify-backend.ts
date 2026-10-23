/** Integration checks against an isolated PostgreSQL PGlite database, never Neon. */
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { resolve, sep } from "node:path";
import {
  closeLocalClient,
  query,
  transaction,
  insertStatement,
} from "../lib/db";
import { ApiError, assertSameOrigin } from "../lib/security/http";
import { rateLimit } from "../lib/security/rate-limit";
import { audited } from "../lib/server/mutations";
import { updateLead } from "../lib/server/leads";
import {
  leadSchema,
  parsePatch,
  projectSchema,
  serviceSchema,
  userSchema,
} from "../lib/validators";
import { POST as submitLead } from "../app/api/leads/route";

async function main() {
  assert.deepEqual(
    parsePatch(projectSchema.partial(), { image: "/projects/demo.webp" }),
    { image: "/projects/demo.webp" },
  );
  assert.deepEqual(
    parsePatch(serviceSchema.partial(), { name: "Nome revisado" }),
    { name: "Nome revisado" },
  );
  assert.deepEqual(
    parsePatch(userSchema.omit({ password: true }).partial(), {
      name: "Nome revisado",
    }),
    { name: "Nome revisado" },
  );
  if (process.env.NODE_ENV === "production")
    throw new Error(
      "Execute a verificação somente em desenvolvimento ou teste.",
    );
  const root = resolve(process.cwd(), ".data");
  await mkdir(root, { recursive: true });
  const directory = await mkdtemp(resolve(root, "backend-test-"));
  process.env.DATABASE_MODE = "local";
  process.env.LOCAL_DATABASE_PATH = directory;
  process.env.AUTH_SECRET = randomBytes(32).toString("hex");
  process.env.APP_URL = "https://test.vieira.local";
  const context = { params: Promise.resolve({}) };
  const request = (body: unknown, origin = process.env.APP_URL!) =>
    new Request(`${process.env.APP_URL}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify(body),
    });
  try {
    for (const script of ["migrate.ts", "seed.ts", "migrate.ts", "seed.ts"])
      execFileSync(process.execPath, ["--import", "tsx", `scripts/${script}`], {
        cwd: process.cwd(),
        env: process.env,
        stdio: "pipe",
      });
    const [seeded] = await query<{ services: number; leads: number }>(
      "SELECT (SELECT count(*)::int FROM services) AS services,(SELECT count(*)::int FROM leads) AS leads",
    );
    assert.equal(seeded.services, 12, "O seed precisa ser idempotente.");
    assert.equal(seeded.leads, 0, "O seed não deve inventar leads.");
    // This scenario deliberately exercises an installation without a contact number.
    await query(
      "UPDATE site_settings SET value=$1::jsonb WHERE key='whatsapp'",
      [JSON.stringify("")],
    );
    assert.throws(
      () => assertSameOrigin(request({}, "https://untrusted.example")),
      (e) => e instanceof ApiError && e.status === 403,
    );
    assert.doesNotThrow(() => assertSameOrigin(request({})));
    const input = {
      name: "Verificação técnica",
      company: "Ambiente de teste",
      email: "verification@example.test",
      whatsapp: "5511999999999",
      needs: ["Automação de dados"],
      problem: "Consolidar arquivos de dados recebidos diariamente.",
      currentProcess: "Uma pessoa confere os arquivos e atualiza uma planilha.",
      manualWork: "Sim",
      usesSpreadsheets: true,
      hasSystem: false,
      features: ["Dashboard"],
      priority: "Pesquisando",
      consent: true,
      idempotencyKey: randomUUID(),
      website: "",
      utmSource: "verificacao",
      budget: "Não configurar",
    };
    assert.equal(
      leadSchema.safeParse({ ...input, consent: false }).success,
      false,
    );
    assert.equal(
      serviceSchema.safeParse({
        name: "Serviço",
        slug: "servico",
        summary: "Resumo para validação",
        image: "/\\untrusted.example/image.svg",
      }).success,
      false,
    );
    assert.equal(
      projectSchema.safeParse({
        title: "Projeto",
        slug: "projeto",
        description: "Descrição válida",
        url: "javascript:alert(1)",
      }).success,
      false,
    );
    const first = await submitLead(request(input), context);
    assert.equal(first.status, 201, await first.clone().text());
    const firstBody = (await first.json()) as {
      id: string;
      whatsappUrl: string | null;
    };
    assert.equal(
      firstBody.whatsappUrl,
      null,
      "Sem WhatsApp configurado não pode inventar número.",
    );
    assert.equal(
      "payloadHash" in firstBody,
      false,
      "Respostas públicas não podem expor hashes internos.",
    );
    const duplicate = await submitLead(request(input), context);
    assert.equal(duplicate.status, 201);
    assert.equal(
      (await duplicate.json()).id,
      firstBody.id,
      "Reenvios devem retornar o mesmo lead.",
    );
    const conflict = await submitLead(
      request({
        ...input,
        problem: "Outro problema com o mesmo identificador de envio.",
      }),
      context,
    );
    assert.equal(
      conflict.status,
      409,
      "Uma chave não pode ser reutilizada com outro conteúdo.",
    );
    const [stored] = await query<{
      leads: number;
      events: number;
      budget: string;
    }>(
      "SELECT (SELECT count(*)::int FROM leads) AS leads,(SELECT count(*)::int FROM lead_events) AS events,(SELECT budget FROM leads LIMIT 1) AS budget",
    );
    assert.equal(stored.leads, 1);
    assert.equal(stored.events, 1);
    assert.equal(stored.budget, "");
    const limits = await Promise.allSettled([
      rateLimit("verification", "same-client", 2, 60),
      rateLimit("verification", "same-client", 2, 60),
      rateLimit("verification", "same-client", 2, 60),
    ]);
    assert.equal(
      limits.filter((result) => result.status === "fulfilled").length,
      2,
      "O contador persistente deve ser atômico.",
    );
    const rejected = limits.find((result) => result.status === "rejected");
    assert.ok(
      rejected?.status === "rejected" &&
        rejected.reason instanceof ApiError &&
        rejected.reason.status === 429,
    );
    const [limited] = await query<{ key: string }>(
      "SELECT key FROM rate_limits WHERE key LIKE 'verification:%'",
    );
    assert.equal(
      limited.key.includes("same-client"),
      false,
      "Identidade de rate-limit deve estar anonimizada.",
    );
    const accountId = randomUUID();
    await query(
      "INSERT INTO users (id,name,email,password_hash,role) VALUES ($1,'Verificação','transaction@example.test','test-only-hash','admin')",
      [accountId],
    );
    await updateLead(firstBody.id, accountId, {
      status: "meeting",
      note: "Conversa agendada para entender o cenário.",
    });
    const [changed] = await query<{
      status: string;
      notes: number;
      previous: string;
    }>(
      "SELECT status,(SELECT count(*)::int FROM lead_notes WHERE lead_id=$1) AS notes,(SELECT metadata->>'from' FROM lead_events WHERE lead_id=$1 AND type='status_changed' LIMIT 1) AS previous FROM leads WHERE id=$1",
      [firstBody.id],
    );
    assert.equal(changed.status, "meeting");
    assert.equal(changed.notes, 1);
    assert.equal(changed.previous, "new");
    const mutation = audited(
      insertStatement("services", {
        name: "Teste de rollback",
        slug: "rollback-test",
        summary: "Mudança que deve ser desfeita",
      }),
      accountId,
      "create",
      "service",
    );
    await assert.rejects(transaction([mutation, { text: "SELECT 1/0" }]));
    const [rollback] = await query<{ services: number; audits: number }>(
      "SELECT (SELECT count(*)::int FROM services WHERE slug='rollback-test') AS services,(SELECT count(*)::int FROM audit_logs WHERE user_id=$1 AND entity='service') AS audits",
      [accountId],
    );
    assert.equal(rollback.services, 0);
    assert.equal(rollback.audits, 0);
    await query(mutation.text, mutation.values);
    const [committed] = await query<{ count: number }>(
      "SELECT count(*)::int AS count FROM audit_logs WHERE user_id=$1 AND entity='service'",
      [accountId],
    );
    assert.equal(
      committed.count,
      1,
      "A gravação concluída deve ter um registro de auditoria.",
    );
    console.log(
      "Backend aprovado: migração e seed idempotentes; validação; CSRF; lead/evento atômicos; reenvio idempotente; rate-limit persistente; rollback e auditoria.",
    );
  } finally {
    await closeLocalClient();
    const target = resolve(directory);
    if (
      !target.startsWith(root + sep) ||
      !target.slice((root + sep).length).startsWith("backend-test-")
    )
      throw new Error("Diretório temporário fora do escopo de verificação.");
    await rm(target, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Falha na verificação do backend.",
  );
  process.exitCode = 1;
});
