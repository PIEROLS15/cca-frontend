import { test, expect } from "@playwright/test";

import { clearComuneroSearch, goToComuneros, searchComunero, expectComuneroVisible } from "./helpers";

test.describe("Search comunero by name", () => {
  test("find comunero by name and clear filter", async ({ page }) => {
    await goToComuneros(page);

    await searchComunero(page, "Alex Felix");

    await expectComuneroVisible(page, "Alex Felix Arias Malasquez");

    await clearComuneroSearch(page);

    await expect(page.getByPlaceholder("Buscar por carnet, documento, teléfono o nombre...")).toHaveValue("");
  });
});
