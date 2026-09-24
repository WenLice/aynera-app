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

/**
 * How Aynera treats the member: what reaches them, whether they are taking a break, and which
 * profile fields show. Notification switches are null until answered; a field missing from
 * `visibility` is shown.
 */
export type MemberSettings = {
  notifyIntroductions: boolean | null;
  notifyReplies: boolean | null;
  notifyWeekendSurprise: boolean | null;
  introductionsPaused: boolean;
  pausedAtUtc: string | null;
  visibility: Record<string, boolean>;
};

/** A partial change: omitted fields keep their value, and `visibility` merges per field. */
export type MemberSettingsChange = Partial<
  Pick<MemberSettings, "notifyIntroductions" | "notifyReplies" | "notifyWeekendSurprise" | "introductionsPaused">
> & { visibility?: Record<string, boolean> };

export function getMySettings(): Promise<MemberSettings> {
  return request<MemberSettings>("/members/me/settings");
}

export function updateMySettings(change: MemberSettingsChange): Promise<MemberSettings> {
  return request<MemberSettings>("/members/me/settings", { method: "PATCH", body: change });
}
