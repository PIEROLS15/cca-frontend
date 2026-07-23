import { test, expect } from "@playwright/test";
import {
  goToSolicitudesActa,
  searchAssemblyRecord,
  expectAssemblyRecordVisible,
} from "./helpers";

test.describe("Download assembly record PDF", () => {
  test("PDF URL returns valid response", async ({ page }) => {
    await goToSolicitudesActa(page);

    await searchAssemblyRecord(page, "SOL-ACTA-000251");
    await expectAssemblyRecordVisible(page, "SOL-ACTA-000251");

    const row = page.getByRole("row").filter({ hasText: "SOL-ACTA-000251" });
    await row.getByRole("button", { name: "Ver PDF" }).click();

    await expect(page).toHaveURL(/\/solicitudes-acta\/\d+\/pdf/);

    const iframe = page.locator("iframe");
    await expect(iframe).toBeVisible({ timeout: 15000 });

    const pdfUrl = await iframe.getAttribute("src");
    expect(pdfUrl).toBeTruthy();

    const status = await page.evaluate(async (url) => {
      const res = await fetch(url, { credentials: "include" });
      return res.status;
    }, pdfUrl!);
    expect(status).toBe(200);
  });
});
