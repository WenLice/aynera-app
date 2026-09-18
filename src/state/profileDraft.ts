import type { Gender } from "../api/types";
import type { LaunchCity, RelationshipTrack } from "../domain/types";
import {
  AGE_DEFAULT_MAX,
  AGE_DEFAULT_MIN,
} from "../config/aynera";

export type PhotoSlot = {
  id: string;
  /** Short role for the slot — "Your face", "Full frame", "Your world". */
  label: string;
  /** Local asset uri once the member picks a real photo. */
  uri: string | null;
  /** The line that travels with this photo. */
  caption: string;
};

export type VideoSlot = {
  id: string;
  uri: string | null;
  caption: string;
};

export type PromptAnswer = {
  promptId: string;
  promptText: string;
  answer: string;
};

export type BirthDate = {
  day: string;
  month: string;
  year: string;
};

/** An optional answer plus whether it's published on the profile. */
export type OptionalAnswer = {
  value: string;
  visible: boolean;
};

export type IntroStyle = "initial" | "nickname";

/** The API's Gender enum, plus the empty value the draft starts with. */
export type GenderChoice = "" | Gender;

/**
 * `Other` is the API's code for third gender / transgender. "Prefer not to say" is not
 * a gender here — it is `genderIsPublic: false`, which hides the answer without taking
 * the member out of matching.
 */
export const GENDER_OPTIONS: { value: Exclude<GenderChoice, "">; label: string }[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Third Gender / Transgender" },
];

export type ProfileDraft = {
  name: string;
  /**
   * How strangers see you before a mutual match.
   * Real first name is always kept for verification and post-match.
   */
  introStyle: IntroStyle;
  /** Used when introStyle is nickname. */
  nickname: string;
  /** How the member describes themselves. Sent to the API; separate from `lookingFor`. */
  gender: GenderChoice;
  /** False is "prefer not to say" — hidden on the profile, still used for matching. */
  genderIsPublic: boolean;
  birth: BirthDate;
  city: LaunchCity | "";
  phone: string;
  phoneVerified: boolean;
  email: string;
  emailVerified: boolean;
  /** Whole centimetres; null until the member sets it. */
  heightCm: number | null;
  hometown: string;
  /** Keyed by question id from lifestyleOptions. */
  lifestyle: Record<string, OptionalAnswer>;
  beliefs: Record<string, OptionalAnswer>;
  notificationsOn: boolean;
  work: string;
  lookingFor: string;
  chips: string[];
  /**
   * Which of the two tracks the member picked. Held separately from
   * `intentOutcome` because a track is chosen first, before any outcome exists.
   */
  relationshipTrack: RelationshipTrack | "";
  /** Outcome of being here — one of the two children of `relationshipTrack`. */
  intentOutcome: string;
  paceId: string;
  ageMin: number;
  ageMax: number;
  ageFlexible: boolean;
  /** The untold story — optional, never a warning label. */
  dealbreaker: string;
  photos: PhotoSlot[];
  video: VideoSlot;
  /** Private identity check — never shown on the introduction. */
  verification: VideoSlot;
  prompts: PromptAnswer[];
  socialEnergy: string;
  weekends: string;
  family: string;
  submitted: boolean;
};

export const PHOTO_ROLES = [
  { label: "Your face", hint: "Clear, close, looking like yourself." },
  { label: "Full frame", hint: "Head to toe — honesty beats flattery." },
  { label: "Your world", hint: "A real moment from your actual life." },
  {
    label: "Something you love",
    hint: "A place, a plate, a face — something you’d bring someone into.",
  },
  {
    label: "Another side of you",
    hint: "A fifth frame — soft, playful, or just true.",
  },
] as const;

const emptyPhotos = (): PhotoSlot[] =>
  PHOTO_ROLES.map((role, i) => ({
    id: `photo-${i + 1}`,
    label: role.label,
    uri: null,
    caption: "",
  }));

/** Pads older drafts that still have four slots up to the current five. */
export function ensurePhotoSlots(photos: PhotoSlot[]): PhotoSlot[] {
  const next = [...photos];
  for (let i = 0; i < PHOTO_ROLES.length; i++) {
    const role = PHOTO_ROLES[i];
    if (next[i]) {
      next[i] = { ...next[i], label: role.label };
    } else {
      next.push({
        id: `photo-${i + 1}`,
        label: role.label,
        uri: null,
        caption: "",
      });
    }
  }
  return next.slice(0, PHOTO_ROLES.length);
}

export const emptyDraft = (): ProfileDraft => ({
  name: "",
  introStyle: "initial",
  nickname: "",
  gender: "",
  genderIsPublic: true,
  birth: { day: "", month: "", year: "" },
  city: "",
  phone: "",
  phoneVerified: false,
  email: "",
  emailVerified: false,
  heightCm: null,
  hometown: "",
  lifestyle: {},
  beliefs: {},
  notificationsOn: false,
  work: "",
  lookingFor: "",
  chips: [],
  relationshipTrack: "",
  intentOutcome: "",
  paceId: "",
  ageMin: AGE_DEFAULT_MIN,
  ageMax: AGE_DEFAULT_MAX,
  ageFlexible: false,
  dealbreaker: "",
  photos: emptyPhotos(),
  video: { id: "video-1", uri: null, caption: "" },
  verification: { id: "verify-1", uri: null, caption: "" },
  prompts: [],
  socialEnergy: "",
  weekends: "",
  family: "",
  submitted: false,
});

export function isValidPhone(phone: string | undefined) {
  return (phone ?? "").replace(/\D/g, "").length === 10;
}

export function isValidEmail(email: string | undefined) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email ?? "").trim());
}

/** First token of the real name — used after a mutual match. */
export function realFirstName(name: string | undefined) {
  const first = (name ?? "").trim().split(/\s+/)[0] ?? "";
  return first;
}

/** What strangers see on Duos before a match. */
export function publicIntroName(draft: Pick<ProfileDraft, "name" | "introStyle" | "nickname">) {
  if (draft.introStyle === "nickname") {
    const nick = draft.nickname.trim();
    if (nick.length >= 2) return nick;
  }
  const first = realFirstName(draft.name);
  if (!first) return "";
  return `${first.charAt(0).toUpperCase()}.`;
}

/** Reads an optional answer without forcing every caller to guard. */
export function optionalAnswer(
  map: Record<string, OptionalAnswer> | undefined,
  id: string,
): OptionalAnswer {
  return map?.[id] ?? { value: "", visible: true };
}

/** Only the answers a member chose to publish, ready for the vitals row. */
export function publishedVitals(
  map: Record<string, OptionalAnswer> | undefined,
  questions: { id: string; vital: string }[],
) {
  return questions
    .map((q) => ({ label: q.vital, ...optionalAnswer(map, q.id) }))
    .filter((a) => a.visible && !!a.value && a.value !== "Prefer not to say")
    .map((a) => ({ label: a.label, value: a.value }));
}

/** Age in years, or null while the date is incomplete or impossible. */
export function ageFromBirth(birth: BirthDate): number | null {
  const day = Number(birth.day);
  const month = Number(birth.month);
  const year = Number(birth.year);
  if (!day || !month || !year) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (String(year).length !== 4) return null;

  const now = new Date();
  let age = now.getFullYear() - year;
  const beforeBirthday =
    now.getMonth() + 1 < month ||
    (now.getMonth() + 1 === month && now.getDate() < day);
  if (beforeBirthday) age -= 1;
  if (age < 18 || age > 99) return null;
  return age;
}

let draft: ProfileDraft = emptyDraft();
const listeners = new Set<() => void>();

export function getProfileDraft(): ProfileDraft {
  let next = draft;
  if (next.photos.length !== PHOTO_ROLES.length) {
    next = { ...next, photos: ensurePhotoSlots(next.photos) };
  }
  if (next.introStyle == null) {
    next = { ...next, introStyle: "initial", nickname: next.nickname ?? "" };
  }
  if (next !== draft) draft = next;
  return draft;
}

export function setProfileDraft(next: ProfileDraft) {
  draft = {
    ...next,
    photos: ensurePhotoSlots(next.photos ?? emptyPhotos()),
  };
  listeners.forEach((fn) => fn());
}

export function updateProfileDraft(patch: Partial<ProfileDraft>) {
  const merged = { ...draft, ...patch };
  draft = {
    ...merged,
    photos: ensurePhotoSlots(merged.photos ?? emptyPhotos()),
  };
  listeners.forEach((fn) => fn());
}

export function resetProfileDraft() {
  draft = emptyDraft();
  listeners.forEach((fn) => fn());
}

export function subscribeProfileDraft(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
