/** Envelope every Aynera API response uses. */
export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  statusCode: number;
  errorCode: string | null;
  errors: Record<string, string[]> | null;
  correlationId: string | null;
};

/** `GET /early-access/cities/GetAll` — the shared city catalog. */
export type EarlyAccessCity = {
  id: string;
  name: string;
  wave: number;
  sortOrder: number;
  isActive: boolean;
};
