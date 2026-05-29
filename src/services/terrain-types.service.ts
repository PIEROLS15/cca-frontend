import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { TerrainType } from "@/types/terrain-type";

const PAGE_SIZE = 100;

function buildQuery(page: number, limit: number) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return `?${params.toString()}`;
}

async function listPage(page: number) {
  return apiFetch<PaginatedApiResponse<TerrainType>>(
    `/api/terrain-types${buildQuery(page, PAGE_SIZE)}`,
  );
}

export const TerrainTypesService = {
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
