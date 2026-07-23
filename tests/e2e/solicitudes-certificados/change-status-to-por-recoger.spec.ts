import { test, expect } from "@playwright/test";
import {
  goToSolicitudesCertificados,
  searchCertificateRequest,
  expectCertificateRequestVisible,
  changeCertificateRequestStatus,
} from "./helpers";

test.describe("Change status to Por Recoger", () => {
  test("change Recepcionado to Por Recoger and restore", async ({ page }) => {
    await goToSolicitudesCertificados(page);

    await searchCertificateRequest(page, "003943");
    await expectCertificateRequestVisible(page, "003943");

    try {
      await changeCertificateRequestStatus(page, "003943", "Por Recoger");

      await searchCertificateRequest(page, "003943");
      const row = page.getByRole("row").filter({ hasText: "003943" });
      await expect(row.locator("text=Por Recoger")).toBeVisible();
    } finally {
      await changeCertificateRequestStatus(page, "003943", "Recepcionado");
    }
  });
});
