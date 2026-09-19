/**
 * Product knobs that should stay easy to change after testing.
 * Do not scatter these numbers through screens.
 */

export const WEEKLY_INTRODUCTION_LIMIT = 4;

/** One Khat per rolling window. Khats do not accumulate. */
export const KHAT_ROLLING_DAYS = 7;
export const KHAT_PER_WINDOW = 1;
export const KHAT_MIN_CHARS = 20;
export const KHAT_MAX_CHARS = 220;

/** Soft cap on newly opened mutual conversations. Existing threads stay. */
export const MAX_ACTIVE_NEW_CONVERSATIONS = 5;

/** Ends of the age-range slider. 18 is the platform's minimum age to join. */
export const AGE_MIN = 18;
export const AGE_MAX = 45;
export const AGE_DEFAULT_MIN = 24;
export const AGE_DEFAULT_MAX = 32;

/**
 * The top of the slider means "and older", not exactly {@link AGE_MAX}.
 *
 * Without it, nobody could express interest above 45 (47 with flexibility), so members older
 * than that passed nobody's reciprocal age filter and were guaranteed zero introductions. The
 * draft keeps a plain number so the slider stays simple; the open end is expressed on the wire
 * by sending `maxAge: null`.
 */
export const isOpenUpperEnd = (maxAge: number) => maxAge >= AGE_MAX;

/** `45` → `"45+"` at the ceiling, the plain number below it. */
export const formatMaxAge = (maxAge: number) =>
  isOpenUpperEnd(maxAge) ? `${AGE_MAX}+` : `${maxAge}`;

/** What `PUT /preferences/me` should carry: null at the ceiling, otherwise the number. */
export const maxAgeForApi = (maxAge: number) => (isOpenUpperEnd(maxAge) ? null : maxAge);

export const REQUIRED_PROMPTS = 2;
export const OPTIONAL_PROMPT_MAX = 3;

export const FLAGS = {
  /** Contact hashing / hide-by-number is not live yet. UI only. */
  hidePeopleIKnow: false,
} as const;

/**
 * Backend base URL. `EXPO_PUBLIC_*` variables are inlined by Expo at build time,
 * so the deployed web build and EAS builds can point at a different API than
 * local development without a code change.
 */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_AYNERA_API_BASE_URL?.trim() || "http://localhost:5057"
).replace(/\/+$/, "");

/** Where the published policy documents live. Same override pattern as the API URL. */
export const WEB_BASE_URL = (
  process.env.EXPO_PUBLIC_AYNERA_WEB_BASE_URL?.trim() || "https://aynera.com"
).replace(/\/+$/, "");

/**
 * The documents a member accepts before their profile goes for review.
 *
 * `kind` and `version` must match `Aynera:Admission:RequiredConsentVersions` in the API's
 * appsettings — the backend stores one row per (member, kind, version) and re-gates
 * eligibility when a version moves, so a mismatch here means a member who can never become
 * eligible no matter how many times they agree.
 */
export const CONSENT_POLICIES = [
  { kind: "Terms", version: "1.0", label: "Terms of Use", path: "/terms" },
  { kind: "Privacy", version: "1.0", label: "Privacy Notice", path: "/privacy" },
  {
    kind: "CommunityGuidelines",
    version: "1.0",
    label: "Community Guidelines",
    path: "/community-guidelines",
  },
] as const;

export type ConsentPolicy = (typeof CONSENT_POLICIES)[number];

export const policyUrl = (policy: ConsentPolicy) => `${WEB_BASE_URL}${policy.path}`;