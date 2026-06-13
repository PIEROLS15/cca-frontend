import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { TerrainType } from "@/types/terrain-type";

export const TerrainTypesService = {
  async list({ page = 1, limit = 5, search }: { page?: number; limit?: number; search?: string } = {}) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return apiFetch<PaginatedApiResponse<TerrainType>>(`/api/terrain-types?${params.toString()}`);
  },

  create(name: string) {
    return apiFetch<TerrainType>("/api/terrain-types", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  update(id: number, name: string) {
    return apiFetch<TerrainType>(`/api/terrain-types/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  },

  remove(id: number) {
    return apiFetch<void>(`/api/terrain-types/${id}`, {
      method: "DELETE",
    });
  },
};
