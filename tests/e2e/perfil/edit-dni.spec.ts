import { expect, test } from "@playwright/test";

import { openUserMenu } from "../auth/session";
import { withProfileFieldRestore } from "./helpers";

test("edit profile DNI, relogin and restore it", async ({ page }) => {
  await withProfileFieldRestore(page, "DNI", async ({ page: profilePage, input }) => {
    await input.fill("99999999");
    await profilePage.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(input).toHaveValue("99999999");

    await openUserMenu(profilePage);
    await profilePage.getByRole("menuitem", { name: "Cerrar sesión" }).click();

    await profilePage.goto("/login");
    await profilePage.getByLabel("Usuario").fill("pierols");
    await profilePage.getByLabel("Contraseña").fill("123456");
    await profilePage.getByRole("button", { name: "Iniciar sesión" }).click();

    await openUserMenu(profilePage);
    await profilePage.getByRole("menuitem", { name: "Mi perfil" }).click();
    await expect(profilePage.getByLabel("DNI")).toHaveValue("99999999");
  });
});
