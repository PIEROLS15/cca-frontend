import { chromium, type FullConfig } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} no está definida`);
  }

  return value;
}

export default async function globalSetup(config: FullConfig) {
  const baseURL = (config.projects[0]?.use?.baseURL as string | undefined) ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:9000";
  const storageStatePath = path.resolve(process.cwd(), ".auth", "seeded-user.json");

  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.goto("/login");
  await page.getByLabel("Usuario").fill(requireEnv("E2E_USERNAME"));
  await page.getByLabel("Contraseña").fill(requireEnv("E2E_PASSWORD"));
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL(/\/$/);
  await page.getByText("Panel general").waitFor({ timeout: 30000 });

  await context.storageState({ path: storageStatePath });
  await browser.close();
}
