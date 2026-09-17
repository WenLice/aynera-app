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

export const AGE_MIN = 21;
export const AGE_MAX = 55;
export const AGE_DEFAULT_MIN = 24;
export const AGE_DEFAULT_MAX = 32;

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

/** Where the Welcome buttons send people. Overridable per build the same way. */
export const LINKS = {
  join: process.env.EXPO_PUBLIC_LINK_JOIN?.trim() || "https://aynera.com/early-access",
  sampleIntroduction:
    process.env.EXPO_PUBLIC_LINK_SAMPLE?.trim() || "https://aynera.com/how-it-works",
  alreadyApplied:
    process.env.EXPO_PUBLIC_LINK_APPLIED?.trim() || "https://aynera.com/early-access",
} as const;
