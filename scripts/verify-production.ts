import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

// Read-only smoke check against an already running production build.
const origin = new URL(process.env.PREVIEW_URL || "http://127.0.0.1:3200")
  .origin;

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    const response = await page.goto(origin);
    expect(response?.status()).toBe(200);
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response?.headers()["x-frame-options"]).toBe("DENY");
    await expect(page.locator("h1")).toBeVisible();
    await page.waitForFunction(
      () => Boolean(navigator.serviceWorker.controller),
      null,
      { timeout: 30_000 },
    );
    const manifest = await (
      await context.request.get(`${origin}/manifest.webmanifest`)
    ).json();
    expect(manifest.name).toContain("VIEIRA SYSTEMS");
    expect(
      manifest.icons.some(
        (icon: { purpose?: string }) => icon.purpose === "maskable",
      ),
    ).toBe(true);
    const sw = await context.request.get(`${origin}/sw.js`);
    expect(sw.headers()["cache-control"]).toContain("no-store");
    await page.goto(`${origin}/admin/login`);
    const api = await page.evaluate(async () => {
      const response = await fetch("/api/public-settings");
      return {
        status: response.status,
        cacheControl: response.headers.get("cache-control"),
      };
    });
    expect(api.status).toBe(200);
    expect(api.cacheControl).toContain("no-store");
    await page.goto(origin);
    const cachedPaths = await page.evaluate(async () => {
      const paths: string[] = [];
      for (const name of await caches.keys()) {
        for (const request of await (await caches.open(name)).keys())
          paths.push(new URL(request.url).pathname);
      }
      return paths.sort();
    });
    expect(cachedPaths).toEqual(["/icons/vs-192.png", "/offline.html"]);
    await context.setOffline(true);
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Vamos reconectar." }),
    ).toBeVisible();
    expect(
      await page
        .locator("img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth === 192,
        ),
    ).toBe(true);
    const offlineApiAvailable = await page.evaluate(async () => {
      try {
        await fetch("/api/public-settings");
        return true;
      } catch {
        return false;
      }
    });
    expect(offlineApiAvailable).toBe(false);
    await mkdir(".review", { recursive: true });
    await page.screenshot({ path: ".review/offline.png", fullPage: true });
    await context.setOffline(false);
    await page.goto(origin);
    await expect(page.locator("h1")).not.toContainText("Vamos reconectar.");
    expect(errors).toEqual([]);
    const report = {
      origin,
      checkedAt: new Date().toISOString(),
      status: "passed",
      cachedPaths,
      checks: [
        "security headers",
        "manifest and maskable icon",
        "service worker",
        "private responses not cached",
        "offline page and logo",
        "offline APIs unavailable",
        "online recovery",
        "no browser exceptions",
      ],
    };
    await writeFile(".review/production.json", JSON.stringify(report, null, 2));
    console.log(
      "Produção: headers, manifest, service worker, privacidade do cache, página e logo offline, recuperação e JavaScript passaram.",
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
