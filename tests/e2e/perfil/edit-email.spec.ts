import { expect, test } from "@playwright/test";
import { goToProfile, loginAsSeededUser, logoutUser } from "../auth/session";
import { withProfileRestore } from "./helpers";

test("edit profile email, relogin and restore it", async ({ page }) => {
  const updatedEmail = "pierodanielllanossanchez12@gmail.com";

  await withProfileRestore(page, async ({ page: profilePage, emailInput }) => {
    await emailInput.fill(updatedEmail);
    await profilePage.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(emailInput).toHaveValue(updatedEmail);

    await logoutUser(profilePage);
    await loginAsSeededUser(profilePage);
    await goToProfile(profilePage);
    await expect(profilePage.getByLabel("Correo electrónico")).toHaveValue(updatedEmail);
  });
});
