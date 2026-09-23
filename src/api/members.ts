import { request } from "./client";
import type { AuthAccount, MemberAdmission } from "./types";

/** The signed-in member's account and profile. */
export function getMe(): Promise<AuthAccount> {
  return request<AuthAccount>("/members/me");
}

/** The signed-in member's admission state and computed eligibility. */
export function getMyAdmission(): Promise<MemberAdmission> {
  return request<MemberAdmission>("/admissions/me");
}

/**
 * Sends the finished registration for a human read: `Draft` (or `Rejected`) → `Submitted`.
 * The server checks the profile, preferences and minimum age are in place, and refuses a
 * second submission with 409 `admission_already_submitted`.
 */
export function submitAdmission(): Promise<MemberAdmission> {
  return request<MemberAdmission>("/admissions/me/submit", { method: "POST" });
}

/**
 * Records acceptance of one policy document at one version.
 *
 * Idempotent server-side: accepting the same version twice keeps the original timestamp, so a
 * retry after a partial failure is safe and does not overwrite when the member first agreed.
 */
export function acceptConsent(policyKind: string, version: string): Promise<MemberAdmission> {
  return request<MemberAdmission>("/admissions/me/consents", {
    method: "POST",
    body: { policyKind, version },
  });
}
