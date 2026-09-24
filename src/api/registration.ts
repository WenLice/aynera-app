import { request } from "./client";
import type { MemberSettings } from "./members";
import type {
  AuthAccount,
  Gender,
  InterestedIn,
  MemberProfile,
  OtpRequested,
  OutcomeCode,
  TokenPayload,
  TrackCode,
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

/** One answer to an everyday or belief question, and whether the member publishes it. */
export type RegistrationAnswer = {
  /** The option as the app offers it. */
  option: string;
  public: boolean;
};

/**
 * One registration page's answers for `PATCH /members/me/registration`. Every field is optional:
 * send only what the page in front of the member collects, and the server merges it into what it
 * already holds. Omitted means "unchanged"; an empty string clears an optional text (nickname, work).
 */
export type RegistrationPage = {
  name?: string;
  nickname?: string;
  gender?: Gender;
  /** False hides the gender on the profile; matching still uses it. */
  genderIsPublic?: boolean;
  /** ISO date, `YYYY-MM-DD`. */
  dateOfBirth?: string;
  heightCm?: number;
  hometown?: string;
  /** A city name from the catalog. */
  city?: string;
  work?: string;
  interestedIn?: InterestedIn;
  minAge?: number;
  maxAge?: number;
  /**
   * True at the slider's ceiling — "minAge and older". Needed because an omitted `maxAge`
   * already means "unchanged"; cannot be sent together with `maxAge`.
   */
  maxAgeIsOpen?: boolean;
  ageIsFlexible?: boolean;
  track?: TrackCode;
  outcome?: OutcomeCode;
  /** Merged per question. */
  lifestyle?: Record<string, RegistrationAnswer>;
  /** Merged per question. */
  beliefs?: Record<string, RegistrationAnswer>;
  /** Replaces the whole set, so deselecting a chip sticks. */
  vibe?: string[];
  /** The full chosen list, in order; replaces what is stored. A recording is uploaded separately. */
  prompts?: PromptAnswerPage[];
  /** Empty clears it. */
  dealbreaker?: string;
  /** Keyed by question (socialEnergy, weekends, family); replaces what is stored. */
  rhythm?: Record<string, string>;
  /** The notifications page: yes or not now. */
  notificationsOn?: boolean;
};

/** What is still only in the server-side draft; a group leaves once promoted to its own table. */
export type RegistrationAnswers = {
  name: string | null;
  nickname: string | null;
  gender: Gender | null;
  genderIsPublic: boolean | null;
  dateOfBirth: string | null;
  heightCm: number | null;
  hometown: string | null;
  city: string | null;
  work: string | null;
  interestedIn: InterestedIn | null;
  minAge: number | null;
  maxAge: number | null;
  ageIsFlexible: boolean | null;
  track: TrackCode | null;
  outcome: OutcomeCode | null;
};

/** The member's matching hard filters, once promoted. Null `maxAge` is an open upper end. */
export type MemberPreferences = {
  interestedIn: InterestedIn;
  minAge: number;
  maxAge: number | null;
  ageIsFlexible: boolean;
  track: TrackCode;
  outcome: OutcomeCode;
};

export type MemberProfileAnswers = {
  lifestyle: Record<string, RegistrationAnswer>;
  beliefs: Record<string, RegistrationAnswer>;
  vibe: string[];
  prompts: PromptAnswer[];
  dealbreaker: string | null;
  rhythm: Record<string, string>;
};

export type PromptAnswerPage = {
  promptId: string;
  text?: string;
};

export type PromptAnswer = {
  promptId: string;
  text: string | null;
  /** A spoken answer is stored; its playback link comes from `voice-answers/GetAll`. */
  hasAudio: boolean;
};

/**
 * Where the member stands. The server owns the resume rule: `nextStep` is the first step still
 * outstanding (null when every server-tracked step is done), so the app never keeps its own copy.
 */
export type RegistrationProgress = {
  answers: RegistrationAnswers;
  completed: string[];
  nextStep: string | null;
  profile: MemberProfile | null;
  preferences: MemberPreferences | null;
  profileAnswers: MemberProfileAnswers | null;
  /** Notification switches, pause and field visibility — null until any was set. */
  settings: MemberSettings | null;
};

/** Everything answered so far, for prefilling and reopening the flow where it stopped. */
export function getRegistration(): Promise<RegistrationProgress> {
  return request<RegistrationProgress>("/members/me/registration");
}

/** Saves one page. The response is the updated progress, so no second read is needed. */
export function saveRegistrationPage(page: RegistrationPage): Promise<RegistrationProgress> {
  return request<RegistrationProgress>("/members/me/registration", { method: "PATCH", body: page });
}
