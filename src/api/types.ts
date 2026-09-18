/** Envelope every Aynera API response uses. */
export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  statusCode: number;
  errorCode: string | null;
  errors: Record<string, string[]> | null;
  correlationId: string | null;
};

/**
 * The API's `Gender` enum, by name. `Other` is its code for third gender / transgender;
 * `PreferNotToSay` is an explicit decline, deliberately distinct from it.
 */
export type Gender = "Male" | "Female" | "Other" | "PreferNotToSay";

/** Who the member wants to meet. `Everyone` is all three genders. */
export type InterestedIn = "Male" | "Female" | "Other" | "Everyone";

/** The API's IntentOutcome. The app's own ids are upper-case; these are the wire values. */
export type IntentOutcomeCode = "Platonic" | "Spontaneous" | "Prospect" | "Legacy";

/** `GET /early-access/cities/GetAll` — the shared city catalog. */
export type EarlyAccessCity = {
  id: string;
  name: string;
  wave: number;
  sortOrder: number;
  isActive: boolean;
};

/** `POST /early-access/register` body. */
export type JoinEarlyAccessRequest = {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  interest: "Aynera" | "Aynera Professionals";
  intent: "Fluid" | "Intent";
  meetPreference: "Duos" | "Squads" | "Both";
  isAdult: boolean;
  marketingConsent: boolean;
};

/** `POST /early-access/register` result. `created` is false when the email was already on the list. */
export type EarlyAccessSignup = {
  id: string;
  email: string;
  city: string;
  interest: string;
  created: boolean;
};

export type MemberProfile = {
  /** The member's own name — a first name or a full name, their choice. */
  name: string;
  gender: string;
  genderIsPublic: boolean;
  dateOfBirth: string;
  city: string;
  cityId: string;
  /** What strangers see before a mutual match; null means the first letter of `name`. */
  nickname: string | null;
  heightCm: number | null;
  hometown: string | null;
  work: string | null;
  religion: string | null;
};

export type AuthAccount = {
  id: string;
  phone: string | null;
  phoneConfirmed: boolean;
  email: string | null;
  emailConfirmed: boolean;
  accountKind: "Member" | "Admin";
  isActive: boolean;
  isDeleted: boolean;
  isSuperAdmin: boolean;
  isRestricted: boolean;
  roles: string[];
  profile: MemberProfile | null;
};

export type TokenPayload = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  account: AuthAccount;
};

/** `POST /auth/login` result — OTP was sent; `retryAfterSeconds` is set when rate limited. */
export type OtpRequested = {
  expiresInSeconds: number;
  retryAfterSeconds: number | null;
};

export type AdmissionState = "Draft" | "Submitted" | "InReview" | "Approved" | "Rejected";

export type MemberAdmission = {
  userId: string;
  state: AdmissionState;
  submittedAtUtc: string | null;
  decidedAtUtc: string | null;
  decisionReason: string | null;
  reviewNote: string | null;
  eligibility: {
    isEligible: boolean;
    admissionState: AdmissionState;
    unmetRequirements: string[];
  };
};
