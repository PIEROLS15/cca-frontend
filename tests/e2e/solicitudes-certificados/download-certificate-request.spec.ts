import { test, expect } from "@playwright/test";
import {
  goToSolicitudesCertificados,
  searchCertificateRequest,
  expectCertificateRequestVisible,
} from "./helpers";

test.describe("Download certificate request PDF", () => {
  test("PDF URL returns valid response", async ({ page }) => {
    await goToSolicitudesCertificados(page);

    await searchCertificateRequest(page, "003943");
    await expectCertificateRequestVisible(page, "003943");

    const row = page.getByRole("row").filter({ hasText: "003943" });
    await row.getByRole("button", { name: "Cambiar estado" }).locator("xpath=..").getByRole("button").nth(1).click();

    await expect(page).toHaveURL(/\/solicitudes-certificados\/\d+\/pdf/);

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
