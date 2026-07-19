import { test } from "@playwright/test";

import { clearUserSearch, createUser, deactivateUserIfActive, editCertLimit, expectUserVisible, goToUsuarios, searchUser } from "./helpers";
import type { UserPayload } from "@/types/user";

function uniquePayload(): UserPayload {
  const ts = Date.now();
  return {
    username: `testlimit_${ts}`,
    password: "Test123456",
    fullName: `TESTLIMIT_${ts}`,
    email: `testlimit_${ts}@test.com`,
    dni: String(10000000 + Math.floor(Math.random() * 90000000)),
    roleId: 4,
    roleName: "Asistente",
  };
}

test.describe("Edit certificate limit", () => {
  test("set certificate range for a user", async ({ page }) => {
    const payload = uniquePayload();

    await goToUsuarios(page);

    try {
      await createUser(page, payload);
      await searchUser(page, payload.username);
      await expectUserVisible(page, payload.fullName);

      await editCertLimit(page, payload.fullName, "999001", "999200");
    } finally {
      await editCertLimit(page, payload.fullName, "", "").catch(() => null);
      await deactivateUserIfActive(page, payload.fullName);
    }
  });
});
