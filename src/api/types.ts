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
 * The genders a member can state, by the API's names. `ThirdGender` is shown as
 * "Third Gender / Transgender". Whether it appears on the profile is `genderIsPublic`.
 */
export type Gender = "Male" | "Female" | "ThirdGender";

/** Who the member wants to meet. `Everyone` is all three genders. */
export type InterestedIn = "Male" | "Female" | "ThirdGender" | "Everyone";

/** The API's `RelationshipTrack` — the first half of the intent step. */
export type TrackCode = "Fluid" | "Intent";

/**
 * The API's `RelationshipOutcome` — the child of a track. Platonic and Spontaneous belong to
 * Fluid, Prospect and Legacy to Intent; sending a pair that disagrees is refused.
 */
export type OutcomeCode = "Platonic" | "Spontaneous" | "Prospect" | "Legacy";

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

/** `POST /auth/otp/request` result — OTP was sent; `retryAfterSeconds` is set when rate limited. */
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
