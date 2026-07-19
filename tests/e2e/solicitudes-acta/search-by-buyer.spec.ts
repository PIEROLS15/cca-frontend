import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  clearAssemblyRecordSearch,
} from "./helpers";

test.describe("Search assembly record by buyer", () => {
  test("filter by buyer name reduces results", async ({ page }) => {
    await goToSolicitudesActa(page);

    const countBefore = await page.getByRole("row").count();

    await searchAssemblyRecord(page, "CARLOS ARMANDO");

    const rows = page.getByRole("row");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeLessThan(countBefore);

    await clearAssemblyRecordSearch(page);
    await expect(
      page.getByPlaceholder("Buscar por código, certificado, comprador, ubicación o descripción...")
    ).toHaveValue("");
  });
});
