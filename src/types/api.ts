export interface PaginatedApiResponse<T> {
  message: string;
  error: boolean;
  status: number;
  data: T[];
  total: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}
