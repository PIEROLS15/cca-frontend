import { test } from "@playwright/test";

import { activateUserIfInactive, createUser, deactivateUserIfActive, expectUserVisible, goToUsuarios, searchUser } from "./helpers";
import type { UserPayload } from "@/types/user";

function uniquePayload(): UserPayload {
  const ts = Date.now();
  return {
    username: `testusr_${ts}`,
    password: "Test123456",
    fullName: `TESTUSR_${ts}`,
    email: `test_${ts}@test.com`,
    dni: String(10000000 + Math.floor(Math.random() * 90000000)),
    roleId: 4,
    roleName: "Asistente",
  };
}

test.describe("Create user", () => {
  test("create a new user", async ({ page }) => {
    const payload = uniquePayload();

    await goToUsuarios(page);

    try {
      await createUser(page, payload);
      await searchUser(page, payload.username);
      await expectUserVisible(page, payload.fullName);
    } finally {
      await deactivateUserIfActive(page, payload.fullName);
    }
  });
});
