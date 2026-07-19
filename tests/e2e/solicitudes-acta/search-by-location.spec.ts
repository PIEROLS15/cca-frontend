import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  clearAssemblyRecordSearch,
} from "./helpers";

test.describe("Search assembly record by location", () => {
  test("filter by sector/location", async ({ page }) => {
    await goToSolicitudesActa(page);

    await expect(page.getByRole("row")).toHaveCount(6, { timeout: 15000 });

    await searchAssemblyRecord(page, "SANTA ROSA PRADERAS");

    const rows = page.getByRole("row");
    await expect(rows.first()).toBeVisible();
    const countAfter = await rows.count();
    expect(countAfter).toBeGreaterThanOrEqual(2);
    expect(countAfter).toBeLessThanOrEqual(6);

    await clearAssemblyRecordSearch(page);
    await expect(
      page.getByPlaceholder("Buscar por código, certificado, comprador, ubicación o descripción...")
    ).toHaveValue("");
  });
});
