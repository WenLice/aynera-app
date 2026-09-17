import { API_BASE_URL } from "../config/aynera";
import type { ApiResponse } from "./types";

/** A failed API call, carrying the backend's machine-readable error code. */
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly fieldErrors: Record<string, string[]> | null,
    public readonly correlationId: string | null,
  ) {
    super(code);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Bearer token, once sign-in exists. */
  accessToken?: string;
  signal?: AbortSignal;
  /** Fail instead of hanging when the API is unreachable (default 8 s). */
  timeoutMs?: number;
};

function correlationId() {
  return `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Calls the backend and unwraps the `ApiResponse<T>` envelope. Throws `ApiError`
 * for any non-success answer so screens can branch on `error.code`.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, accessToken, signal, timeoutMs = 8000 } = options;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Correlation-Id": correlationId(),
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener("abort", () => controller.abort());

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiError(
      controller.signal.aborted ? "request_timeout" : "network_error",
      0,
      null,
      null,
    );
  } finally {
    clearTimeout(timer);
  }

  let envelope: ApiResponse<T> | null = null;
  const text = await response.text();
  if (text.length > 0) {
    try {
      envelope = JSON.parse(text) as ApiResponse<T>;
    } catch {
      envelope = null;
    }
  }

  if (!response.ok || envelope?.success === false) {
    throw new ApiError(
      envelope?.errorCode ?? "request_failed",
      envelope?.statusCode ?? response.status,
      envelope?.errors ?? null,
      envelope?.correlationId ?? null,
    );
  }

  return (envelope?.data ?? undefined) as T;
}
