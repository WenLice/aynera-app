import { request } from "./client";
import type { OtpRequested, TokenPayload } from "./types";

/** Starts OTP sign-in for a registered member; the code goes by SMS or email. */
export function requestOtp(identifier: string): Promise<OtpRequested> {
  return request<OtpRequested>("/auth/login", {
    method: "POST",
    body: { identifier },
    auth: false,
    retryOnUnauthorized: false,
  });
}

export function verifyOtp(identifier: string, code: string): Promise<TokenPayload> {
  return request<TokenPayload>("/auth/verifysms", {
    method: "POST",
    body: { identifier, code },
    auth: false,
    retryOnUnauthorized: false,
  });
}

export function loginWithPassword(identifier: string, password: string): Promise<TokenPayload> {
  return request<TokenPayload>("/auth/password", {
    method: "POST",
    body: { identifier, password },
    auth: false,
    retryOnUnauthorized: false,
  });
}

export function logout(refreshToken: string): Promise<void> {
  return request<void>("/auth/logout", {
    method: "POST",
    body: { refreshToken },
    auth: false,
    retryOnUnauthorized: false,
  });
}
