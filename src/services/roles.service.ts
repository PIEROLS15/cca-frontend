import { apiFetch } from "./api";
import type { PaginatedApiResponse } from "@/types/api";
import type { Role } from "@/types/user";

const PAGE_SIZE = 100;

export const RolesService = {
  async listAll() {
    const firstPage = await apiFetch<PaginatedApiResponse<Role>>(`/api/roles?page=1&limit=${PAGE_SIZE}`);

    if (firstPage.totalPages <= 1) {
      return firstPage.data;
    }

    const restPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        apiFetch<PaginatedApiResponse<Role>>(`/api/roles?page=${index + 2}&limit=${PAGE_SIZE}`),
      ),
    );

    return firstPage.data.concat(restPages.flatMap((page) => page.data));
  },
};
