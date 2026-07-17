import { expect, test } from "@playwright/test";

import { loginWithCredentials, logoutUser } from "../auth/session";
import { withProfileFieldRestore } from "./helpers";

test("edit profile username, relogin and restore it", async ({ page }) => {
  let currentUsername = "pierols";

  await withProfileFieldRestore(page, "Nombre de usuario", async ({ page: profilePage, input }) => {
    currentUsername = "pierols_updated";

    await input.fill(currentUsername);
    await profilePage.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(profilePage.getByText("Perfil actualizado")).toBeVisible({ timeout: 10000 });
    await expect(input).toHaveValue(currentUsername);

    await logoutUser(profilePage);
    await loginWithCredentials(profilePage, currentUsername, "123456");

    await profilePage.goto("/perfil");
    await expect(profilePage.getByRole("heading", { name: "Mi perfil" })).toBeVisible();
    await expect(profilePage.getByLabel("Nombre de usuario")).toHaveValue(currentUsername);
  }, {
    login: async (profilePage) => {
      await loginWithCredentials(profilePage, currentUsername, "123456");
    },
  });
});
