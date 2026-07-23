import { test, expect } from "@playwright/test";
import {
  goToSolicitudesCertificados,
  searchCertificateRequest,
  clearCertificateRequestSearch,
} from "./helpers";

test.describe("Search certificate request by DNI", () => {
  test("filter by client DNI", async ({ page }) => {
    await goToSolicitudesCertificados(page);

    await expect(page.getByRole("row")).toHaveCount(6, { timeout: 15000 });

    await searchCertificateRequest(page, "07113170");

    const rows = page.getByRole("row");
    await expect(rows.first()).toBeVisible();
    const countAfter = await rows.count();
    expect(countAfter).toBeGreaterThanOrEqual(2);
    expect(countAfter).toBeLessThanOrEqual(6);

    await clearCertificateRequestSearch(page);
    await expect(
      page.getByPlaceholder("Buscar por código o documento del cliente...")
    ).toHaveValue("");
  });
});
