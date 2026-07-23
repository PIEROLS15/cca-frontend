import { expect, test } from "@playwright/test";

import { withProfileFieldRestore } from "./helpers";

test("edit profile full name, relogin and restore it", async ({ page }) => {
    await withProfileFieldRestore(page, "Nombre completo", async ({ page: profilePage, input }) => {
      await input.fill("Piero Test Updated");
      await profilePage.getByRole("button", { name: "Guardar cambios" }).click();
      await expect(profilePage.getByText("Perfil actualizado")).toBeVisible({ timeout: 10000 });
      await expect(input).toHaveValue("Piero Test Updated");

      await profilePage.goto("/perfil");
      await expect(profilePage.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
      await expect(profilePage.getByLabel("Nombre completo")).toHaveValue("Piero Test Updated");
  });
});
