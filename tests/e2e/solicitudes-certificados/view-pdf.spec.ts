import { test, expect } from "@playwright/test";
import {
  goToSolicitudesCertificados,
  searchCertificateRequest,
  expectCertificateRequestVisible,
} from "./helpers";

test.describe("View PDF of certificate request", () => {
  test("navigate to PDF viewer from list", async ({ page }) => {
    await goToSolicitudesCertificados(page);

    await searchCertificateRequest(page, "003943");
    await expectCertificateRequestVisible(page, "003943");

    const row = page.getByRole("row").filter({ hasText: "003943" });
    await row.getByRole("button", { name: "Cambiar estado" }).locator("xpath=..").getByRole("button").nth(1).click();

    await expect(page).toHaveURL(/\/solicitudes-certificados\/\d+\/pdf/);
  });
});
