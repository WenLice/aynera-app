import {
  OPTIONAL_PROMPT_MAX,
  REQUIRED_PROMPTS,
} from "../config/aynera";
import { MIN_CHIPS, PHOTO_SLOTS } from "../data/profileOptions";
import {
  ageFromBirth,
  isValidEmail,
  isValidPhone,
  type ProfileDraft,
} from "./profileDraft";
import type { EditTarget } from "../components/ProfileStory";

export type Enrichment = {
  label: string;
  target: EditTarget;
};

export type ProfileCompletion = {
  percent: number;
  ready: boolean;
  next: Enrichment[];
};

const answeredCount = (map: ProfileDraft["lifestyle"]) =>
  Object.values(map ?? {}).filter(
    (a) => !!a.value && a.value !== "Prefer not to say",
  ).length;

export function profileCompletion(draft: ProfileDraft): ProfileCompletion {
  const photos = draft.photos.filter((p) => !!p.uri).length;
  const answers = draft.prompts.filter((p) => p.answer.trim().length > 8).length;
  const required = [
    draft.name.trim().length >= 2,
    ageFromBirth(draft.birth) != null,
    draft.city !== "",
    draft.lookingFor !== "",
    draft.intentOutcome !== "",
    draft.paceId !== "",
    draft.ageMin > 0 && draft.ageMax > draft.ageMin,
    draft.chips.length >= MIN_CHIPS,
    photos >= PHOTO_SLOTS,
    answers >= REQUIRED_PROMPTS,
    isValidPhone(draft.phone) && draft.phoneVerified,
    isValidEmail(draft.email) && draft.emailVerified,
    !!draft.verification.uri,
  ];
  const optional = [
    draft.chips.length >= MIN_CHIPS + 4,
    answers >= OPTIONAL_PROMPT_MAX,
    !!draft.video.uri,
    draft.socialEnergy !== "" && draft.weekends !== "" && draft.family !== "",
    draft.dealbreaker.trim().length > 8,
    draft.heightCm != null && draft.hometown.trim().length > 1,
    answeredCount(draft.lifestyle) >= 2,
    answeredCount(draft.beliefs) >= 1,
  ];

  const reqScore = required.filter(Boolean).length / required.length;
  const optScore = optional.filter(Boolean).length / optional.length;
  const percent = Math.round(reqScore * 70 + optScore * 30);
  const ready = required.every(Boolean);

  const next: Enrichment[] = [];
  if (draft.heightCm == null || draft.hometown.trim().length < 2)
    next.push({ label: "Add height and hometown", target: "basics" });
  if (answeredCount(draft.lifestyle) < 2)
    next.push({ label: "Fill in your everyday", target: "everyday" });
  if (draft.chips.length < MIN_CHIPS + 4)
    next.push({ label: "Add another Vibe", target: "taste" });
  if (answers < OPTIONAL_PROMPT_MAX)
    next.push({ label: "Answer one more prompt", target: "voice" });
  if (!draft.video.uri)
    next.push({ label: "Add intro video", target: "video" });
  if (!draft.socialEnergy || !draft.weekends)
    next.push({ label: "Complete Rhythm", target: "rhythm" });
  if (draft.dealbreaker.trim().length < 8)
    next.push({ label: "A little more about you", target: "story" });

  return { percent, ready, next: next.slice(0, 4) };
}
