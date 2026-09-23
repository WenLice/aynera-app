import { API_BASE_URL } from "../config/aynera";
import { clearSession, getSession, saveSession } from "../auth/session";
import type { ApiResponse, TokenPayload } from "./types";
import { handleDemoRequest } from "./demoBackend";

/** The demo branch has no server: every call is answered on this device (see demoBackend.ts). */
const DEMO = true;

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

  /** First message for a field from `validation_failed`, if the backend named one. */
  field(name: string): string | null {
    const key = Object.keys(this.fieldErrors ?? {}).find(
      (k) => k.toLowerCase() === name.toLowerCase(),
    );
    return key ? (this.fieldErrors?.[key]?.[0] ?? null) : null;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Attach the stored bearer token (default true; pass false for public endpoints). */
  auth?: boolean;
  /** On 401, refresh the session once and retry (default true). */
  retryOnUnauthorized?: boolean;
  signal?: AbortSignal;
  /** Fail instead of hanging when the API is unreachable (default 8 s). */
  timeoutMs?: number;
};

function correlationId() {
  return `app-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

let refreshInFlight: Promise<boolean> | null = null;

/** Rotates the refresh token; one refresh at a time even if several calls hit 401 together. */
async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const session = getSession();
    if (!session) return false;
    try {
      const tokens = await request<TokenPayload>("/auth/refresh", {
        method: "POST",
        body: { refreshToken: session.refreshToken },
        auth: false,
        retryOnUnauthorized: false,
      });
      await saveSession({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
      return true;
    } catch {
      await clearSession();
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

/**
 * Calls the backend and unwraps the `ApiResponse<T>` envelope. Throws `ApiError`
 * for any non-success answer so screens can branch on `error.code`.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    auth = true,
    retryOnUnauthorized = true,
    signal,
    timeoutMs = 8000,
  } = options;

  if (DEMO) return handleDemoRequest<T>(path, method, body);

  const headers: Record<string, string> = {
    Accept: "application/json",
    "X-Correlation-Id": correlationId(),
  };
  // A file upload sets its own multipart boundary; anything else is JSON.
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const session = getSession();
    if (session) headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener("abort", () => controller.abort());

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      controller.signal.aborted ? "request_timeout" : "network_error",
      0,
      null,
      null,
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 401 && auth && retryOnUnauthorized && getSession()) {
    if (await refreshSession()) {
      return request<T>(path, { ...options, retryOnUnauthorized: false });
    }
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
