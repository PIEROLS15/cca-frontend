import { test } from "@playwright/test";
import { loginAsSeededUser } from "./session";

test.use({ storageState: undefined });

test("login seeded user and land on dashboard", async ({ page }) => {
  await loginAsSeededUser(page);
});
