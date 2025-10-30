export class WebResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: string;
  pagination?: Pagination;
}

export class Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}
