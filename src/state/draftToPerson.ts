import type { PersonProfile, StoryBeat, Vibe } from "../data/mockPeople";
import {
  BELIEF_QUESTIONS,
  LIFESTYLE_QUESTIONS,
  formatHeight,
} from "../data/lifestyleOptions";
import { INTENT_OUTCOMES, PACE_OPTIONS } from "../data/profileOptions";
import {
  ageFromBirth,
  publicIntroName,
  publishedVitals,
  realFirstName,
  type ProfileDraft,
} from "./profileDraft";
import { colors } from "../theme";

const VIBES: Vibe[] = [
  [colors.brandPrimary, colors.accentPrimaryPressed],
  [colors.brandPrimaryPressed, colors.accentPrimary],
  [colors.brandSecondary, colors.accentPrimaryPressed],
];

const answered = (text: string) => text.trim().length > 2;

/**
 * Draft → the exact profile a stranger sees.
 * Every answer is used once, and empty beats are dropped rather than
 * rendered as placeholders.
 */
export function draftToPerson(draft: ProfileDraft): PersonProfile | null {
  if (!draft.name || !draft.city) return null;

  const pace = PACE_OPTIONS.find((p) => p.id === draft.paceId)?.label ?? "";
  const intent =
    INTENT_OUTCOMES.find((i) => i.id === draft.intentOutcome)?.label ?? "";
  const photos = draft.photos.filter((p) => !!p.uri);
  /** First two sit on the front of the card; the rest open as beats below. */
  const heroPhotos = photos.slice(0, 2);
  const thirdPhoto = photos[2];
  const fourthPhoto = photos[3];
  const lastPhoto = photos[4] ?? photos[3];

  const usable = draft.prompts.filter((p) => answered(p.answer));
  const [first, second, third] = usable;

  /** The hero line is the first answer; it never repeats as a beat. */
  const signature = first ? first.answer.trim() : "";

  const beats: StoryBeat[] = [];

  if (second) {
    beats.push({
      kind: "answer",
      id: second.promptId,
      prompt: second.promptText,
      answer: second.answer.trim(),
    });
  }

  if (thirdPhoto) {
    beats.push({
      kind: "photo",
      id: thirdPhoto.id,
      label: thirdPhoto.label,
      vibe: VIBES[1],
      uri: thirdPhoto.uri ?? undefined,
      caption: thirdPhoto.caption.trim() || undefined,
    });
  }

  if (draft.video.uri) {
    beats.push({
      kind: "video",
      id: draft.video.id,
      vibe: VIBES[2],
      videoUri: draft.video.uri,
      caption: draft.video.caption.trim() || undefined,
    });
  }

  if (third) {
    beats.push({
      kind: "answer",
      id: third.promptId,
      prompt: third.promptText,
      answer: third.answer.trim(),
    });
  }

  if (fourthPhoto && fourthPhoto !== lastPhoto) {
    beats.push({
      kind: "photo",
      id: fourthPhoto.id,
      label: fourthPhoto.label,
      vibe: VIBES[2],
      uri: fourthPhoto.uri ?? undefined,
      caption: fourthPhoto.caption.trim() || undefined,
    });
  }

  if (answered(draft.dealbreaker)) {
    beats.push({
      kind: "story",
      id: "untold",
      title: "Something I don’t usually say first",
      body: draft.dealbreaker.trim(),
    });
  }

  /** Closes the scroll on an image, right before the taste section. */
  if (lastPhoto) {
    beats.push({
      kind: "photo",
      id: lastPhoto.id,
      label: lastPhoto.label,
      vibe: VIBES[0],
      uri: lastPhoto.uri ?? undefined,
      caption: lastPhoto.caption.trim() || undefined,
    });
  }

  const vitals: { label: string; value: string }[] = [];
  if (intent) vitals.push({ label: "Intent", value: intent });
  if (pace) vitals.push({ label: "Pace", value: pace });
  if (draft.lookingFor) vitals.push({ label: "Open to", value: draft.lookingFor });
  if (draft.heightCm)
    vitals.push({ label: "Height", value: formatHeight(draft.heightCm) });
  if (draft.hometown.trim())
    vitals.push({ label: "From", value: draft.hometown.trim() });
  vitals.push(...publishedVitals(draft.lifestyle, LIFESTYLE_QUESTIONS));
  vitals.push(...publishedVitals(draft.beliefs, BELIEF_QUESTIONS));

  return {
    id: "self",
    name: publicIntroName(draft) || realFirstName(draft.name),
    realName: realFirstName(draft.name),
    age: ageFromBirth(draft.birth) ?? 0,
    city: draft.city,
    work: draft.work.trim(),
    lookingFor: draft.lookingFor,
    intent,
    pace,
    reason: "",
    verified: draft.submitted,
    heroPhotos: heroPhotos.map((photo, i) => ({
      id: photo.id,
      vibe: VIBES[i % VIBES.length],
      uri: photo.uri ?? undefined,
      caption: i > 0 ? photo.caption.trim() || undefined : undefined,
    })),
    signature,
    vitals,
    taste: draft.chips.slice(0, 12),
    rhythm: [draft.socialEnergy, draft.weekends, draft.family].filter(Boolean),
    beats,
  };
}
