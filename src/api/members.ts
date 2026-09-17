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
