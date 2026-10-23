import { test, expect, type APIRequestContext } from "@playwright/test";
import { randomUUID } from "node:crypto";
import AxeBuilder from "@axe-core/playwright";

test.describe("Painel administrativo no navegador", () => {
  let api: APIRequestContext;
  let state: Awaited<ReturnType<APIRequestContext["storageState"]>>;
  test.beforeAll(async ({ playwright, baseURL }) => {
    api = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Origin: baseURL! },
    });
    const login = await api.post("/api/admin/login", {
      data: {
        email: process.env.TEST_ADMIN_EMAIL,
        password: process.env.TEST_ADMIN_PASSWORD,
      },
    });
    expect(login.status()).toBe(200);
    state = await api.storageState();
  });
  test.afterAll(async () => api?.dispose());

  test("Login visual, dashboard e logout", async ({ page }, testInfo) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(
      page.getByRole("heading", { name: "Bem-vindo ao workspace." }),
    ).toBeVisible();
    await page
      .getByRole("textbox", { name: "E-mail", exact: true })
      .fill(process.env.TEST_ADMIN_EMAIL!);
    await page
      .locator('input[name="password"]')
      .fill(process.env.TEST_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "Entrar no workspace" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(
      page.getByRole("heading", { name: "Visão geral", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".adm-metric")).toHaveCount(8);
    await page.screenshot({
      path: testInfo.outputPath("dashboard-dark.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Sair da conta" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("CRUD visual de serviço e edição de CMS", async ({ page }) => {
    await page.context().addCookies(state.cookies);
    const slug = `ui-${randomUUID().slice(0, 8)}`;
    const name = `Serviço temporário ${slug}`;
    const original = (await (await api.get("/api/admin/content")).json())
      .sections.hero;
    try {
      await page.goto("/admin/servicos");
      await page
        .getByRole("button", { name: "Novo serviço", exact: true })
        .first()
        .click();
      await page.getByLabel("Nome do serviço", { exact: false }).fill(name);
      await page.getByLabel("Endereço do serviço", { exact: false }).fill(slug);
      await page
        .getByLabel("Resumo", { exact: false })
        .fill(
          "Um serviço temporário criado para verificar a interface de gestão.",
        );
      await page
        .getByRole("button", { name: "Criar serviço", exact: true })
        .click();
      await expect(
        page.getByText("Alterações salvas com sucesso."),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name, exact: true }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: `Editar ${name}`, exact: true })
        .click();
      await page
        .getByLabel("Resumo", { exact: false })
        .fill("Resumo revisado pelo fluxo visual do painel administrativo.");
      await page
        .getByRole("button", { name: "Salvar alterações", exact: true })
        .click();
      await expect(
        page.getByText("Alterações salvas com sucesso."),
      ).toBeVisible();
      await page
        .getByRole("button", { name: `Excluir ${name}`, exact: true })
        .click();
      await page.getByRole("button", { name: "Excluir", exact: true }).click();
      await expect(page.getByText("Serviço excluído.")).toBeVisible();

      await page.goto("/admin/conteudo");
      await page
        .getByLabel("Título", { exact: true })
        .fill("Tecnologia que entende o processo de ponta a ponta.");
      await page
        .getByRole("button", { name: "Salvar alterações", exact: true })
        .click();
      await expect(
        page.getByText("Conteúdo salvo e disponível no site."),
      ).toBeVisible();
      await page.goto("/");
      await expect(page.locator("h1")).toHaveText(
        "Tecnologia que entende o processo de ponta a ponta.",
      );
    } finally {
      await api.put("/api/admin/content", {
        data: { key: "hero", value: original },
      });
      const rows = await (await api.get("/api/admin/services")).json();
      const leftover = rows.items.find(
        (item: { slug: string }) => item.slug === slug,
      );
      if (leftover)
        await api.delete("/api/admin/services", { data: { id: leftover.id } });
    }
  });

  test("Configurações persistem e aparecem no formulário", async ({ page }) => {
    await page.context().addCookies(state.cookies);
    const settings = (await (await api.get("/api/admin/settings")).json())
      .settings;
    try {
      await page.goto("/admin/configuracoes");
      await page
        .getByLabel("Slogan", { exact: true })
        .fill("Processos conectados. Dados organizados.");
      await page
        .getByLabel("Exibir pergunta opcional sobre investimento")
        .check();
      await page
        .getByLabel("Faixas disponíveis", { exact: false })
        .fill("Faixa de verificação\nDefinir após diagnóstico");
      await page
        .getByRole("button", { name: "Salvar alterações", exact: true })
        .click();
      await expect(
        page.getByText("Configurações salvas.", { exact: false }),
      ).toBeVisible();
      await page.reload();
      await expect(page.getByLabel("Slogan", { exact: true })).toHaveValue(
        "Processos conectados. Dados organizados.",
      );
      await expect(
        page.getByLabel("Faixas disponíveis", { exact: false }),
      ).toHaveValue("Faixa de verificação\nDefinir após diagnóstico");
      const publicSettings = await (
        await api.get("/api/public-settings")
      ).json();
      expect(publicSettings.investmentEnabled).toBe(true);
      expect(publicSettings.investmentRanges).toEqual([
        "Faixa de verificação",
        "Definir após diagnóstico",
      ]);
    } finally {
      await api.put("/api/admin/settings", { data: settings });
    }
  });

  test("Todas as telas administrativas funcionam em desktop e mobile", async ({
    page,
  }, testInfo) => {
    await page.context().addCookies(state.cookies);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of [
        "/admin",
        "/admin/leads",
        "/admin/projetos",
        "/admin/servicos",
        "/admin/conteudo",
        "/admin/analytics",
        "/admin/configuracoes",
        "/admin/usuarios",
        "/admin/sistema",
      ]) {
        await page.goto(path);
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.locator(".adm-skeleton")).toHaveCount(0);
        await expect(
          page.locator(".adm-feedback-error, .adm-error"),
        ).toHaveCount(0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${width}px ${path}`,
        ).toBe(true);
        if (path === "/admin")
          await page.screenshot({
            path: testInfo.outputPath(`admin-${width}.png`),
            fullPage: true,
          });
      }
      if (width < 1024) {
        await page.getByRole("button", { name: "Abrir navegação" }).click();
        await expect(
          page.getByRole("navigation", { name: "Navegação administrativa" }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(
          page.getByRole("button", { name: "Abrir navegação" }),
        ).toBeFocused();
      }
    }
    await page.getByRole("button", { name: "Ativar modo claro" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
    await page.screenshot({
      path: testInfo.outputPath("admin-light.png"),
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });

  test("Acessibilidade do painel nos dois temas", async ({ page }) => {
    test.setTimeout(180_000);
    await page.context().addCookies(state.cookies);
    for (const theme of ["dark", "light"]) {
      await page.addInitScript(
        (value) => localStorage.setItem("vs-theme", value),
        theme,
      );
      for (const path of [
        "/admin",
        "/admin/leads",
        "/admin/projetos",
        "/admin/servicos",
        "/admin/conteudo",
        "/admin/analytics",
        "/admin/configuracoes",
        "/admin/usuarios",
        "/admin/sistema",
      ]) {
        await page.goto(path);
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        await expect(page.locator("h1")).toBeVisible();
        await expect(page.locator(".adm-skeleton")).toHaveCount(0);
        await expect(page.locator(".adm-error")).toHaveCount(0);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(results.violations, `${theme} ${path}`).toEqual([]);
      }
    }
  });
});
