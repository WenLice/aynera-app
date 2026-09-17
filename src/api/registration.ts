import { request } from "./client";
import type { AuthAccount, OtpRequested, TokenPayload } from "./types";

/** Step 1 — SMS code to a number that has no account yet. 409 `user_already_exists` if it does. */
export function startPhoneRegistration(phone: string): Promise<OtpRequested> {
  return request<OtpRequested>("/members/register/phone", {
    method: "POST",
    body: { phone },
    auth: false,
    retryOnUnauthorized: false,
  });
}

/** Step 2 — creates the Draft member account and returns the session tokens. */
export function verifyPhoneRegistration(phone: string, code: string): Promise<TokenPayload> {
  return request<TokenPayload>("/members/register/phone/verify", {
    method: "POST",
    body: { phone, code },
    auth: false,
    retryOnUnauthorized: false,
  });
}

/** Step 3 — emailed code for the address the signed-in member wants. 409 `email_already_exists` if taken. */
export function startEmailVerification(email: string): Promise<OtpRequested> {
  return request<OtpRequested>("/members/me/email", { method: "POST", body: { email } });
}

/** Step 4 — sets and confirms the email on the account. */
export function verifyEmailCode(email: string, code: string): Promise<AuthAccount> {
  return request<AuthAccount>("/members/me/email/verify", { method: "POST", body: { email, code } });
}
