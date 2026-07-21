import { test } from "@playwright/test";

import { expectComuneroVisible, goToComuneros, searchComunero } from "./helpers";

test.describe("Search comunero by client code", () => {
  test("find comunero by client code", async ({ page }) => {
    await goToComuneros(page);

    await searchComunero(page, "CLI-001");

    await expectComuneroVisible(page, "COMEDOR POPULAR VIRGEN DEL ROSARIO");
  });
});
