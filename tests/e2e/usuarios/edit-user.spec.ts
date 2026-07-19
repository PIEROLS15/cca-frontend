import { test } from "@playwright/test";

import { clearUserSearch, createUser, deactivateUserIfActive, editUser, expectUserVisible, goToUsuarios, searchUser } from "./helpers";
import type { UserPayload } from "@/types/user";

function uniquePayload(): UserPayload {
  const ts = Date.now();
  return {
    username: `testedit_${ts}`,
    password: "Test123456",
    fullName: `TESTEDIT_${ts}`,
    email: `testedit_${ts}@test.com`,
    dni: String(10000000 + Math.floor(Math.random() * 90000000)),
    roleId: 4,
    roleName: "Asistente",
  };
}

test.describe("Edit user", () => {
  test("edit user name", async ({ page }) => {
    const payload = uniquePayload();
    const editedName = `${payload.fullName}_EDITADO`;

    await goToUsuarios(page);

    try {
      await createUser(page, payload);
      await searchUser(page, payload.username);
      await expectUserVisible(page, payload.fullName);

      await editUser(page, payload.fullName, { fullName: editedName });
      await searchUser(page, payload.username);
      await expectUserVisible(page, editedName);
    } finally {
      await editUser(page, editedName, { fullName: payload.fullName }).catch(() => null);
      await deactivateUserIfActive(page, payload.fullName);
    }
  });
});
