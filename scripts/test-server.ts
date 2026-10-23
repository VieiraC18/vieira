import { spawn, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";

const env: NodeJS.ProcessEnv = {
  ...process.env,
  NODE_ENV: "development",
  DATABASE_MODE: "local",
  DATABASE_URL: "",
  LOCAL_DATABASE_PATH: resolve(".data", `e2e-${Date.now()}`),
  AUTH_SECRET: randomBytes(48).toString("base64url"),
  APP_URL: "http://127.0.0.1:3100",
  NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
  NEXT_DIST_DIR: ".next-test",
  ADMIN_NAME: "Administrador de teste",
  ADMIN_EMAIL: process.env.TEST_ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.TEST_ADMIN_PASSWORD,
  TRUST_PROXY: "0",
};
// Playwright sets FORCE_COLOR; avoid passing a contradictory inherited option.
delete env.NO_COLOR;
if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD)
  throw new Error("Execute o servidor de testes pelo Playwright.");
for (const script of ["migrate.ts", "seed.ts", "create-admin.ts"]) {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", `scripts/${script}`],
    { env, stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--webpack",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  { env, stdio: "inherit" },
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    child.kill(signal);
  });
child.on("exit", (code) => process.exit(code || 0));
