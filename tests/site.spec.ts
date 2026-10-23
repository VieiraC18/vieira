import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";

const publicPaths = [
  "/",
  "/servicos",
  "/servicos/software",
  "/solucoes",
  "/automacao",
  "/dados",
  "/inteligencia-artificial",
  "/consultoria",
  "/assessoria",
  "/projetos",
  "/sobre",
  "/contato",
  "/orcamento",
  "/politica-de-privacidade",
  "/termos",
];
async function contact(page: Page, email: string) {
  await page
    .getByLabel("Nome", { exact: false })
    .fill("Contato de teste do navegador");
  await page.getByLabel("Empresa", { exact: true }).fill("Verificação local");
  await page.getByLabel("WhatsApp", { exact: false }).fill("11988887777");
  await page.getByLabel("E-mail", { exact: false }).fill(email);
}
async function advance(page: Page) {
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
}
async function remainingSteps(page: Page) {
  await advance(page);
  await page
    .getByRole("textbox", { name: /O problema/ })
    .fill("Consolidar os relatórios enviados em planilhas todas as semanas.");
  await advance(page);
  await page
    .getByRole("textbox", { name: /Processo atual/ })
    .fill("Cada área envia uma planilha e alguém faz a conferência manual.");
  await advance(page);
  await page
    .getByRole("group", { name: "Existe trabalho manual?" })
    .getByRole("button", { name: "Sim", exact: true })
    .click();
  await page
    .getByRole("group", { name: "A equipe usa planilhas?" })
    .getByRole("button", { name: "Sim", exact: true })
    .click();
  await page
    .getByRole("group", { name: "Já existe algum sistema?" })
    .getByRole("button", { name: "Não", exact: true })
    .click();
  await advance(page);
  await page.getByRole("button", { name: "Dashboard", exact: true }).click();
  await page.getByRole("button", { name: "Integração", exact: true }).click();
  await advance(page);
  await page
    .getByRole("button", { name: "Quero começar em breve", exact: true })
    .click();
  await page.getByLabel("Autorizo o tratamento").check();
}

test("Home, navegação e páginas públicas têm conteúdo, SEO e imagens válidas", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const path of publicPaths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1"), path).toHaveCount(1);
    await expect(page.locator("h1"), path).toBeVisible();
    expect(await page.title()).toContain("VIEIRA SYSTEMS");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /.{20,}/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `http://127.0.0.1:3100${path === "/" ? "" : path}`,
    );
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /VIEIRA SYSTEMS/,
    );
    expect(
      await page.locator('script[type="application/ld+json"]').count(),
    ).toBeGreaterThan(0);
    await expect(page.locator("[data-nextjs-dialog]")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

for (const width of [320, 375, 430, 768, 1024, 1440, 1920, 2560]) {
  test(`Layout público sem overflow em ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const path of publicPaths) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
        `${width}px ${path}`,
      ).toBe(true);
      if (path === "/") {
        const pause = await page
          .getByRole("button", { name: "Pausar animação" })
          .boundingBox();
        expect(
          pause && pause.x + pause.width <= width,
          "Controle de animação visível",
        ).toBeTruthy();
        await page.screenshot({
          path: testInfo.outputPath(`home-${width}.png`),
          fullPage: true,
        });
      }
    }
  });
}

test("Menu mobile prende foco, fecha com Escape e navega", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu de navegação" });
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menu" })).toBeFocused();
  await page.getByRole("button", { name: "Abrir menu" }).click();
  await menu.getByRole("link", { name: "Serviços", exact: true }).click();
  await expect(page).toHaveURL(/\/servicos$/);
  await expect(menu).not.toBeVisible();
});

test("Tema claro/escuro persiste e movimento pode ser pausado", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Ativar modo claro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.screenshot({
    path: testInfo.outputPath("home-light.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Pausar animação" }).click();
  await expect(page.locator(".hero-flow")).toHaveClass(/motion-paused/);
  await page.getByRole("button", { name: "Ativar modo escuro" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("Orçamento valida campos, pré-seleciona necessidade e persiste lead com UTMs", async ({
  page,
  playwright,
  baseURL,
}) => {
  const api = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL! },
  });
  await api.post("/api/admin/login", {
    data: {
      email: process.env.TEST_ADMIN_EMAIL,
      password: process.env.TEST_ADMIN_PASSWORD,
    },
  });
  const email = `wizard-${randomUUID()}@example.test`;
  let leadId: string | undefined;
  try {
    await page.goto(
      "/?utm_source=playwright&utm_medium=qa&utm_campaign=fluxo-completo",
    );
    await page
      .getByRole("button", { name: "Quero desenvolver um SaaS" })
      .click();
    await page.getByRole("link", { name: "Explorar solução" }).click();
    await advance(page);
    await expect(page.getByText("Informe seu nome completo.")).toBeVisible();
    await contact(page, email);
    await advance(page);
    await expect(
      page.getByRole("button", { name: "SaaS", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await remainingSteps(page);
    await page
      .getByText("Revisar informações do pedido", { exact: true })
      .click();
    await expect(page.locator(".quote-review")).toContainText(email);
    await page
      .getByRole("button", { name: "Enviar pedido", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Obrigado por compartilhar seu cenário.",
      }),
    ).toBeVisible();
    const list = await (
      await api.get(`/api/admin/leads?q=${encodeURIComponent(email)}`)
    ).json();
    expect(list.total).toBe(1);
    leadId = list.items[0].id;
    const detail = await (await api.get(`/api/admin/leads/${leadId}`)).json();
    expect(detail.lead.needs).toEqual(["SaaS"]);
    expect(detail.lead.utmSource).toBe("playwright");
    expect(detail.lead.utmCampaign).toBe("fluxo-completo");
    expect(detail.lead.source).toBe("/");
    expect(detail.events).toHaveLength(1);
  } finally {
    if (leadId) await api.delete(`/api/admin/leads/${leadId}`);
    await api.dispose();
  }
});

test("Wizard mostra erro de rede e permite tentar de novo", async ({
  page,
}) => {
  await page.goto("/orcamento?necessidade=Sistema");
  await contact(page, `retry-${randomUUID()}@example.test`);
  await advance(page);
  await remainingSteps(page);
  await page.route("**/api/leads", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Indisponível" }),
    }),
  );
  await page
    .getByRole("button", { name: "Enviar pedido", exact: true })
    .click();
  await expect(page.locator(".wizard-error")).toContainText(
    "temporariamente indisponível",
  );
  await expect(
    page.getByRole("button", { name: "Enviar pedido", exact: true }),
  ).toBeEnabled();
});

test("SEO técnico, 404, manifest e ícones oficiais", async ({
  page,
  request,
}) => {
  const response = await page.goto("/rota-que-nao-existe");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("link", { name: /Voltar para o início/ }),
  ).toBeVisible();
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.name).toBe("VIEIRA SYSTEMS");
  expect(
    manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable"),
  ).toBe(true);
  for (const icon of manifest.icons)
    expect((await request.get(icon.src)).status()).toBe(200);
  const og = await request.get("/opengraph-image");
  expect(og.status()).toBe(200);
  expect(og.headers()["content-type"]).toContain("image/png");
  expect((await og.body()).length).toBeGreaterThan(10000);
  expect(await (await request.get("/robots.txt")).text()).toContain(
    "Disallow: /admin",
  );
  expect(await (await request.get("/sitemap.xml")).text()).toContain(
    "/servicos/software",
  );
});

test("Cookies opcionais não são carregados sem configuração", async ({
  page,
}) => {
  const external: string[] = [];
  page.on("request", (r) => {
    if (/googletagmanager|google-analytics|connect\.facebook/.test(r.url()))
      external.push(r.url());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Preferências de cookies" }).click();
  await expect(
    page.getByText("Nenhuma ferramenta de medição ou publicidade está ativa.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Entendi", exact: true }).click();
  expect(external).toEqual([]);
});

test("Acessibilidade das páginas públicas nos dois temas", async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of ["dark", "light"]) {
    await page.goto("/");
    if (theme === "light")
      await page.getByRole("button", { name: "Ativar modo claro" }).click();
    for (const path of [
      "/",
      "/servicos",
      "/projetos",
      "/sobre",
      "/contato",
      "/orcamento",
      "/admin/login",
    ]) {
      await page.goto(path);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      await testInfo.attach(`${theme}-${path.replaceAll("/", "_")}`, {
        body: JSON.stringify(result.violations, null, 2),
        contentType: "application/json",
      });
      expect(result.violations, `${theme} ${path}`).toEqual([]);
    }
  }
});

test("Consentimento permite e revoga analytics; WhatsApp abre somente após salvar", async ({
  page,
  playwright,
  baseURL,
}) => {
  const api = await playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: { Origin: baseURL! },
  });
  await api.post("/api/admin/login", {
    data: {
      email: process.env.TEST_ADMIN_EMAIL,
      password: process.env.TEST_ADMIN_PASSWORD,
    },
  });
  const settings = (await (await api.get("/api/admin/settings")).json())
    .settings;
  let leadId: string | undefined;
  const trackingRequests: string[] = [];
  await page
    .context()
    .route(
      /googletagmanager|google-analytics|connect\.facebook/,
      async (route) => {
        trackingRequests.push(route.request().url());
        await route.fulfill({
          contentType: "application/javascript",
          body: "/* tracking deliberately stubbed in isolated tests */",
        });
      },
    );
  await page.context().route("https://wa.me/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<title>WhatsApp test</title><p>External message is never sent by tests.</p>",
    }),
  );
  try {
    await api.put("/api/admin/settings", {
      data: {
        ...settings,
        googleAnalyticsId: "G-TEST123",
        whatsapp: "5511999999999",
        budgetEnabled: true,
        budgetRanges: ["A definir após diagnóstico"],
      },
    });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Você decide sobre os cookies" }),
    ).toBeVisible();
    expect(trackingRequests).toHaveLength(0);
    await page.getByRole("button", { name: "Somente necessários" }).click();
    await page.reload();
    expect(trackingRequests).toHaveLength(0);
    await page.getByRole("button", { name: "Preferências de cookies" }).click();
    await page.getByRole("button", { name: "Aceitar opcionais" }).click();
    await expect.poll(() => trackingRequests.length).toBeGreaterThan(0);
    await page.getByRole("button", { name: "Preferências de cookies" }).click();
    await page.getByRole("button", { name: "Revogar consentimento" }).click();
    await page.waitForLoadState("domcontentloaded");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("vs-cookie-consent-v1") || "{}")
              .choice,
        ),
      )
      .toBe("denied");
    await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(
      0,
    );

    await page.goto("/orcamento?necessidade=Automação%20de%20dados");
    await contact(page, `whatsapp-${randomUUID()}@example.test`);
    await advance(page);
    await remainingSteps(page);
    await page
      .getByLabel("Preferência de investimento", { exact: false })
      .selectOption("A definir após diagnóstico");
    const popupPromise = page.waitForEvent("popup");
    const saved = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/leads") &&
        response.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Enviar pedido", exact: true })
      .click();
    const popup = await popupPromise;
    const response = await saved;
    expect(response.status()).toBe(201);
    leadId = (await response.json()).id;
    await expect(popup).toHaveURL(/^https:\/\/wa\.me\/5511999999999\?text=/);
    await expect(
      page.getByRole("link", { name: "Continuar no WhatsApp" }),
    ).toHaveAttribute("href", /^https:\/\/wa\.me\//);
    expect(decodeURIComponent(popup.url())).toContain(
      "Consolidar os relatórios",
    );
    await popup.close();
  } finally {
    if (leadId) await api.delete(`/api/admin/leads/${leadId}`);
    await api.put("/api/admin/settings", { data: settings });
    await api.dispose();
  }
});
