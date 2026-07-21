import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  clearAssemblyRecordSearch,
} from "./helpers";

test.describe("Search assembly record by buyer", () => {
  test("filter by buyer name reduces results", async ({ page }) => {
    await goToSolicitudesActa(page);

    const rows = page.locator("tbody tr");
    const countBefore = await rows.count();

    const responsePromise = page.waitForResponse(
      (response) => response.request().method() === "GET" && response.url().includes("/api/assembly-record-requests")
    );
    await searchAssemblyRecord(page, "CARLOS ARMANDO");
    await responsePromise;

    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeLessThan(countBefore);

    await clearAssemblyRecordSearch(page);
    await expect(
      page.getByPlaceholder("Buscar por código, certificado, comprador, ubicación o descripción...")
    ).toHaveValue("");
  });
});
