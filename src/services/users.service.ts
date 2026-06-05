import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { User, UserPayload, UserUpdatePayload } from "@/types/user";

export const UsersService = {
  async list({ page = 1, limit = 5, search, roleId, isActive }: { page?: number; limit?: number; search?: string; roleId?: number; isActive?: boolean } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    if (roleId !== undefined) params.set("roleId", String(roleId));
    if (isActive !== undefined) params.set("isActive", String(isActive));
    return apiFetch<PaginatedApiResponse<User>>(`/api/users?${params.toString()}`);
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
