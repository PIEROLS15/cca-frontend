import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { User, UserPayload, UserUpdatePayload } from "@/types/user";

const PAGE_SIZE = 100;

function buildQuery(page: number, limit: number) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return `?${params.toString()}`;
}

async function listPage(page: number) {
  return apiFetch<PaginatedApiResponse<User>>(
    `/api/users${buildQuery(page, PAGE_SIZE)}`,
  );
}

export const UsersService = {
  async listAll() {
    const firstPage = await listPage(1);

    if (firstPage.totalPages <= 1) {
      return firstPage.data;
    }

    const restPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) => listPage(index + 2)),
    );

    return firstPage.data.concat(restPages.flatMap((page) => page.data));
  },

  getById(id: number) {
    return apiFetch<User>(`/api/users/${id}`);
  },

  create(payload: UserPayload) {
    return apiFetch<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: UserUpdatePayload) {
    return apiFetch<User>(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  toggleStatus(id: number, isActive: boolean) {
    return apiFetch<User>(`/api/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/api/users/${id}`, {
      method: "DELETE",
    });
  },
};
