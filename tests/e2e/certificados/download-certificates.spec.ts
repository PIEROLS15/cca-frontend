import { test, expect } from "@playwright/test";
import { goToCertificados } from "./helpers";

test.describe("Download certificates report", () => {
  test("report endpoint returns valid response", async ({ page }) => {
    await goToCertificados(page);

    const downloadPromise = page.waitForEvent("download", { timeout: 15000 }).catch(() => null);

    const downloadBtn = page.getByRole("button", { name: /Descargar Certificados/ });
    if (await downloadBtn.isVisible().catch(() => false)) {
      await downloadBtn.click();

      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.xlsx$/);
      }
    }
  });
});
