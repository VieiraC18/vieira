import { randomUUID } from "node:crypto";
import {
  test,
  expect,
  type APIRequestContext,
  type APIResponse,
} from "@playwright/test";

test.describe("API administrativa e persistência", () => {
  test.describe.configure({ mode: "serial" });
  let admin: APIRequestContext;
  let origin: string;
  const suffix = randomUUID().slice(0, 8);
  async function success(response: APIResponse, status = 200) {
    expect(response.status(), await response.text()).toBe(status);
    return response.json();
  }
  test.beforeAll(async ({ playwright, baseURL }) => {
    origin = baseURL ?? "http://127.0.0.1:3100";
    expect(
      process.env.TEST_ADMIN_EMAIL,
      "TEST_ADMIN_EMAIL precisa ser fornecido pelo runner.",
    ).toBeTruthy();
    expect(
      process.env.TEST_ADMIN_PASSWORD,
      "TEST_ADMIN_PASSWORD precisa ser fornecido pelo runner.",
    ).toBeTruthy();
    admin = await playwright.request.newContext({
      baseURL: origin,
      extraHTTPHeaders: { Origin: origin },
    });
    const body = await success(
      await admin.post("/api/admin/login", {
        data: {
          email: process.env.TEST_ADMIN_EMAIL,
          password: process.env.TEST_ADMIN_PASSWORD,
        },
      }),
    );
    expect(body.user.role).toBe("admin");
    expect(body.user).not.toHaveProperty("passwordHash");
  });
  test.afterAll(async () => {
    await admin?.dispose();
  });

  test("exige sessão, valida origem e mantém cookie protegido", async ({
    playwright,
  }) => {
    const anonymous = await playwright.request.newContext({ baseURL: origin });
    try {
      expect((await anonymous.get("/api/admin/leads")).status()).toBe(401);
      expect(
        (
          await anonymous.post("/api/admin/login", {
            data: { email: "invalid@example.test", password: "invalid" },
          })
        ).status(),
      ).toBe(403);
      expect(
        (
          await anonymous.post("/api/admin/login", {
            headers: { Origin: origin },
            data: {
              email: `missing-${suffix}@example.test`,
              password: "invalid-password",
            },
          })
        ).status(),
      ).toBe(401);
      expect(
        (
          await admin.post("/api/admin/services", {
            headers: { Origin: "https://untrusted.example" },
            data: {},
          })
        ).status(),
      ).toBe(403);
      const session = await success(await admin.get("/api/admin/session"));
      expect(session.user.email).toBe(process.env.TEST_ADMIN_EMAIL);
      const cookies = (await admin.storageState()).cookies;
      const cookie = cookies.find((item) =>
        item.name.includes("vieira_session"),
      );
      expect(cookie?.httpOnly).toBe(true);
      expect(cookie?.sameSite).toBe("Strict");
      expect(
        (await admin.get("/api/admin/leads")).headers()["cache-control"],
      ).toContain("no-store");
    } finally {
      await anonymous.dispose();
    }
  });

  test("CRUD de serviços valida campos e registra auditoria", async () => {
    const slug = `servico-teste-${suffix}`;
    const created = await success(
      await admin.post("/api/admin/services", {
        data: {
          name: "Serviço de verificação",
          slug,
          summary: "Serviço temporário para validar o gerenciamento.",
          active: false,
        },
      }),
      201,
    );
    const id = created.item.id;
    try {
      const changed = await success(
        await admin.patch("/api/admin/services", {
          data: { id, name: "Serviço revisado", order: 90, featured: true },
        }),
      );
      expect(changed.item.name).toBe("Serviço revisado");
      expect(changed.item.slug).toBe(slug);
      expect(changed.item.active).toBe(false);
      expect(changed.item.summary).toBe(created.item.summary);
      expect(
        (await admin.patch("/api/admin/services", { data: { id } })).status(),
      ).toBe(422);
      expect(
        (
          await admin.patch("/api/admin/services", {
            data: { id, name: "Serviço", passwordHash: "injected" },
          })
        ).status(),
      ).toBe(422);
      expect(
        (
          await admin.post("/api/admin/services", {
            data: {
              name: "Duplicado",
              slug,
              summary: "Descrição do serviço duplicado.",
            },
          })
        ).status(),
      ).toBe(409);
      expect(
        (
          await admin.patch("/api/admin/services", {
            data: { id, image: "javascript:alert(1)" },
          })
        ).status(),
      ).toBe(422);
      const list = await success(await admin.get("/api/admin/services"));
      expect(list.items.some((item: { id: string }) => item.id === id)).toBe(
        true,
      );
    } finally {
      await success(
        await admin.delete("/api/admin/services", { data: { id } }),
      );
    }
    expect(
      (await admin.delete("/api/admin/services", { data: { id } })).status(),
    ).toBe(404);
  });

  test("CRUD de projetos persiste galeria e tecnologias e oculta cliente", async () => {
    const slug = `demonstracao-${suffix}`;
    const created = await success(
      await admin.post("/api/admin/projects", {
        data: {
          title: `Demonstração técnica ${suffix}`,
          slug,
          description: "Projeto temporário de verificação do portfólio.",
          client: `CLIENTE-PRIVADO-${suffix}`,
          hideClient: true,
          kind: "technical",
          published: true,
          featured: true,
          order: 23,
          problem:
            "Preservar os campos originais ao atualizar a capa do projeto.",
          gallery: ["/brand/icon-vieira-systems.png"],
          technologies: ["TypeScript", "PostgreSQL"],
        },
      }),
      201,
    );
    const id = created.item.id;
    try {
      expect(created.item.gallery).toEqual(["/brand/icon-vieira-systems.png"]);
      expect(created.item.technologies).toEqual(
        expect.arrayContaining(["TypeScript", "PostgreSQL"]),
      );
      const published = await admin.get(`/projetos/${slug}`);
      expect(published.status()).toBe(200);
      expect(await published.text()).not.toContain(`CLIENTE-PRIVADO-${suffix}`);
      const updated = await success(
        await admin.patch("/api/admin/projects", {
          data: {
            id,
            result: "Fluxo validado em ambiente de teste.",
            gallery: [],
            technologies: ["React"],
          },
        }),
      );
      expect(updated.item.gallery).toEqual([]);
      expect(updated.item.technologies).toEqual(["React"]);
      expect(updated.item.slug).toBe(slug);
      expect(updated.item.published).toBe(true);
      expect(updated.item.kind).toBe("technical");
      expect(updated.item.client).toBe(created.item.client);
      expect(updated.item.problem).toBe(created.item.problem);
      const imageOnly = await success(
        await admin.patch("/api/admin/projects", {
          data: { id, image: "/brand/icon-vieira-systems.png" },
        }),
      );
      expect(imageOnly.item.technologies).toEqual(["React"]);
      expect(imageOnly.item.featured).toBe(true);
      expect(imageOnly.item.order).toBe(23);
      expect(imageOnly.item.published).toBe(true);
      expect(imageOnly.item.result).toBe(updated.item.result);
      expect(
        (await admin.patch("/api/admin/projects", { data: { id } })).status(),
      ).toBe(422);
      const list = await success(await admin.get("/api/admin/projects"));
      expect(list.items.some((item: { id: string }) => item.id === id)).toBe(
        true,
      );
    } finally {
      await success(
        await admin.delete("/api/admin/projects", { data: { id } }),
      );
    }
    expect((await admin.get(`/projetos/${slug}`)).status()).toBe(404);
  });

  test("CMS publica alteração no site e configurações rejeitam scripts", async () => {
    const content = await success(await admin.get("/api/admin/content"));
    const original = content.sections.hero;
    const title = `Processos conectados ${suffix}`;
    try {
      await success(
        await admin.put("/api/admin/content", {
          data: { key: "hero", value: { ...original, title } },
        }),
      );
      const saved = await success(await admin.get("/api/admin/content"));
      expect(saved.sections.hero.title).toBe(title);
      const home = await admin.get("/");
      expect(home.status()).toBe(200);
      expect(await home.text()).toContain(title);
      expect(
        (
          await admin.put("/api/admin/content", {
            data: { key: "passwordHash", value: "not-allowed" },
          })
        ).status(),
      ).toBe(422);
      const { settings } = await success(
        await admin.get("/api/admin/settings"),
      );
      expect(
        (
          await admin.put("/api/admin/settings", {
            data: {
              ...settings,
              googleAnalyticsId: "<script>alert(1)</script>",
            },
          })
        ).status(),
      ).toBe(422);
      expect(
        (
          await admin.put("/api/admin/settings", {
            data: { ...settings, github: "javascript:alert(1)" },
          })
        ).status(),
      ).toBe(422);
    } finally {
      await success(
        await admin.put("/api/admin/content", {
          data: { key: "hero", value: original },
        }),
      );
    }
  });

  test("orçamento salva lead, WhatsApp, UTMs, notas, status e métricas", async () => {
    const { settings } = await success(await admin.get("/api/admin/settings"));
    let id: string | undefined;
    try {
      await success(
        await admin.put("/api/admin/settings", {
          data: {
            ...settings,
            whatsapp: "5511999999999",
            budgetEnabled: true,
            budgetRanges: ["Faixa de teste"],
          },
        }),
      );
      const publicSettings = await success(
        await admin.get("/api/public-settings"),
      );
      expect(publicSettings.investmentEnabled).toBe(true);
      const lead = {
        name: "Contato de verificação",
        company: "Empresa de teste",
        email: `lead-${suffix}@example.test`,
        phone: "5511988888888",
        need: "Automação de dados",
        problem: "Consolidar planilhas de diferentes áreas da empresa.",
        currentProcess:
          "Cada pessoa prepara um arquivo e envia para conferência.",
        manualWork: "Sim",
        usesSpreadsheets: "Sim",
        hasSystem: "Não",
        features: ["Dashboard", "Integração"],
        priority: "Pesquisando",
        investment: "Faixa de teste",
        consent: true,
        website: "",
        idempotencyKey: randomUUID(),
        utm: { source: "teste", medium: "qa", campaign: suffix },
      };
      expect(
        (
          await admin.post("/api/leads", { data: { ...lead, consent: false } })
        ).status(),
      ).toBe(422);
      const submitted = await success(
        await admin.post("/api/leads", { data: lead }),
        201,
      );
      id = submitted.id;
      expect(submitted.whatsappUrl).toMatch(
        /^https:\/\/wa\.me\/5511999999999\?text=/,
      );
      expect(decodeURIComponent(submitted.whatsappUrl)).toContain(lead.problem);
      expect(submitted).not.toHaveProperty("payloadHash");
      const resent = await success(
        await admin.post("/api/leads", { data: lead }),
        201,
      );
      expect(resent.id).toBe(id);
      expect(
        (
          await admin.post("/api/leads", {
            data: {
              ...lead,
              problem: "Outro problema enviado com uma chave já utilizada.",
            },
          })
        ).status(),
      ).toBe(409);
      await success(
        await admin.patch(`/api/admin/leads/${id}`, {
          data: {
            status: "meeting",
            note: "Reunião para entender o processo atual.",
          },
        }),
      );
      const detail = await success(await admin.get(`/api/admin/leads/${id}`));
      expect(detail.lead.status).toBe("meeting");
      expect(detail.lead.utmSource).toBe("teste");
      expect(detail.lead.budget).toBe("Faixa de teste");
      expect(detail.notes).toHaveLength(1);
      expect(
        detail.events.filter(
          (event: { type: string }) => event.type === "created",
        ),
      ).toHaveLength(1);
      expect(
        detail.events.some(
          (event: { type: string }) => event.type === "status_changed",
        ),
      ).toBe(true);
      const list = await success(
        await admin.get(
          `/api/admin/leads?q=${encodeURIComponent(lead.email)}&status=meeting`,
        ),
      );
      expect(list.total).toBe(1);
      const dashboard = await success(
        await admin.get("/api/admin/dashboard?from=2020-01-01&to=2100-01-01"),
      );
      expect(dashboard.metrics.total).toBeGreaterThanOrEqual(1);
      expect(dashboard.metrics.meetings).toBeGreaterThanOrEqual(1);
      expect(
        dashboard.charts.category.some(
          (point: { label: string }) => point.label === "Automação de dados",
        ),
      ).toBe(true);
    } finally {
      if (id) await success(await admin.delete(`/api/admin/leads/${id}`));
      await success(await admin.put("/api/admin/settings", { data: settings }));
    }
  });

  test("RBAC, usuários e revogação imediata de acesso", async ({
    playwright,
  }) => {
    const email = `editor-${suffix}@example.test`;
    const password = `Secret-${randomUUID()}`;
    const created = await success(
      await admin.post("/api/admin/users", {
        data: { name: "Editor temporário", email, password, role: "editor" },
      }),
      201,
    );
    const id = created.item.id;
    expect(created.item).not.toHaveProperty("passwordHash");
    const editor = await playwright.request.newContext({
      baseURL: origin,
      extraHTTPHeaders: { Origin: origin },
    });
    try {
      await success(
        await editor.post("/api/admin/login", { data: { email, password } }),
      );
      expect((await editor.get("/api/admin/leads")).status()).toBe(200);
      expect((await editor.get("/api/admin/services")).status()).toBe(200);
      for (const endpoint of ["users", "settings", "system"])
        expect((await editor.get(`/api/admin/${endpoint}`)).status()).toBe(403);
      expect(
        (await editor.delete(`/api/admin/leads/${randomUUID()}`)).status(),
      ).toBe(403);
      await success(
        await admin.patch("/api/admin/users", { data: { id, active: false } }),
      );
      expect((await editor.get("/api/admin/session")).status()).toBe(401);
      const renamed = await success(
        await admin.patch("/api/admin/users", {
          data: { id, name: "Editor revisado" },
        }),
      );
      expect(renamed.item.active).toBe(false);
      expect(renamed.item.role).toBe("editor");
      expect(
        (
          await editor.post("/api/admin/login", { data: { email, password } })
        ).status(),
      ).toBe(401);
      await success(
        await admin.patch("/api/admin/users", { data: { id, active: true } }),
      );
      await success(
        await editor.post("/api/admin/login", { data: { email, password } }),
      );
      await success(
        await admin.patch("/api/admin/users", {
          data: { id, password: `Changed-${randomUUID()}` },
        }),
      );
      expect((await editor.get("/api/admin/session")).status()).toBe(401);
      const session = await success(await admin.get("/api/admin/session"));
      const selfEdit = await success(
        await admin.patch("/api/admin/users", {
          data: { id: session.user.id, name: session.user.name },
        }),
      );
      expect(selfEdit.item.role).toBe("admin");
      expect(selfEdit.item.active).toBe(true);
      expect(
        (
          await admin.patch("/api/admin/users", {
            data: { id: session.user.id },
          })
        ).status(),
      ).toBe(422);
      expect(
        (
          await admin.delete("/api/admin/users", {
            data: { id: session.user.id },
          })
        ).status(),
      ).toBe(409);
      expect(
        (
          await admin.patch("/api/admin/users", {
            data: { id: session.user.id, role: "editor" },
          })
        ).status(),
      ).toBe(409);
      const users = await success(await admin.get("/api/admin/users"));
      expect(JSON.stringify(users)).not.toContain("passwordHash");
    } finally {
      await editor.dispose();
      await success(await admin.delete("/api/admin/users", { data: { id } }));
    }
  });

  test("auditoria acessível apenas a administradores e logout revoga sessão", async () => {
    const system = await success(await admin.get("/api/admin/system"));
    expect(system.database.connected).toBe(true);
    expect(system.counts.users).toBeGreaterThanOrEqual(1);
    expect(
      system.auditLogs.some(
        (log: { entity: string }) => log.entity === "service",
      ),
    ).toBe(true);
    expect(
      system.auditLogs.some((log: { entity: string }) => log.entity === "lead"),
    ).toBe(true);
    expect(JSON.stringify(system)).not.toContain(
      process.env.TEST_ADMIN_PASSWORD!,
    );
    await success(await admin.post("/api/admin/logout"));
    expect((await admin.get("/api/admin/session")).status()).toBe(401);
  });
});
