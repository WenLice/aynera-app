import { request } from "./client";
import type {
  AuthAccount,
  Gender,
  IntentOutcomeCode,
  InterestedIn,
  OtpRequested,
  TokenPayload,
} from "./types";

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

/** The basic details the API stores. A full replace — anything left out is cleared. */
export type ProfileBasics = {
  name: string;
  gender: Gender;
  /** False is "prefer not to say" — hidden on the profile, still used for matching. */
  genderIsPublic: boolean;
  /** ISO date, `YYYY-MM-DD`. */
  dateOfBirth: string;
  city: string;
  nickname?: string | null;
  heightCm?: number | null;
  hometown?: string | null;
  work?: string | null;
  religion?: string | null;
};

/**
 * Step 5 — sends the "you", "basics" and "life" answers in one go. The draft lives on the device until
 * here because `city` is required and the "life" step is the first place it is known.
 */
export function saveProfile(basics: ProfileBasics): Promise<AuthAccount> {
  return request<AuthAccount>("/members/me/profile", { method: "PUT", body: basics });
}

/** The member's matching hard filters. Private — never shown on a profile. */
export type MemberPreferences = {
  interestedIn: InterestedIn;
  minAge: number;
  maxAge: number;
  ageIsFlexible: boolean;
  intentOutcome: IntentOutcomeCode;
  /** Returned, not sent — the API derives it from the outcome. */
  relationshipTrack?: "Fluid" | "Intent";
};

/**
 * Sent once the "looking" and track steps are both answered. Required before an
 * admission can be submitted.
 */
export function savePreferences(
  preferences: Omit<MemberPreferences, "relationshipTrack">,
): Promise<MemberPreferences> {
  return request<MemberPreferences>("/preferences/me", {
    method: "PUT",
    body: preferences,
  });
}

export function getMyPreferences(): Promise<MemberPreferences | null> {
  return request<MemberPreferences | null>("/preferences/me");
}
