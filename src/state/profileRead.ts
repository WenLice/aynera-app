import type { EditTarget } from "../components/ProfileStory";
import { ageFromBirth, type ProfileDraft } from "./profileDraft";

export type ReadLine = { kicker: string; body: string };

export type ProfileGap = { target: EditTarget; label: string };

export type ProfileRead = {
  lines: ReadLine[];
  gaps: ProfileGap[];
};

const SPECIFIC = /\b(\d|street|road|café|cafe|market|gallery|sunday|monday|morning|evening|grandmother|mother|father|home)\b/i;

/**
 * How Aynera reads a draft — warmth, never a percentage.
 * Deterministic so the member sees the same read twice in a row.
 */
export function readProfile(draft: ProfileDraft): ProfileRead {
  const photos = draft.photos.filter((p) => !!p.uri);
  const captions = photos.filter((p) => p.caption.trim().length > 2);
  const answers = draft.prompts.filter((p) => p.answer.trim().length > 2);
  const longest = [...answers].sort(
    (a, b) => b.answer.trim().length - a.answer.trim().length,
  )[0];
  const avg = answers.length
    ? Math.round(
        answers.reduce((sum, p) => sum + p.answer.trim().length, 0) /
          answers.length,
      )
    : 0;

  const lines: ReadLine[] = [];

  lines.push({
    kicker: "What your photos say",
    body:
      photos.length < 5
        ? "Not much yet — five photos is where a stranger starts to trust a face."
        : captions.length >= 2
          ? "Someone who lets you into the room, not just the frame. The captions are doing real work."
          : "Clear and honest. Add a line to one of them and it stops being a photo, starts being a moment.",
  });

  lines.push({
    kicker: "What your words say",
    body:
      answers.length < 2
        ? "Still quiet. Two answers is what turns a profile into a voice."
        : avg > 90
          ? "Generous — you explain yourself. Trim one answer and the others hit harder."
          : avg < 35
            ? "Brief and a little guarded. One more sentence somewhere would let someone in."
            : "Warm and specific without over-explaining. This is the range that gets replies.",
  });

  if (longest) {
    lines.push({
      kicker: "The line doing most of the work",
      body: `“${longest.answer.trim()}”`,
    });
  }

  lines.push({
    kicker: "What a curator will notice",
    body: draft.dealbreaker.trim().length > 40
      ? "You told the truth about something before anyone asked. That reads as steadiness."
      : draft.dealbreaker.trim().length > 2
        ? "There’s an honest line here — give it one more sentence and it becomes the beat people remember."
        : answers.some((a) => SPECIFIC.test(a.answer))
          ? "Real detail, real places. That’s harder to fake than charm."
          : "It reads pleasant but general. One specific place, hour, or habit would make it yours.",
  });

  const gaps: ProfileGap[] = [];
  if (!draft.work.trim()) gaps.push({ target: "hero", label: "What you do" });
  if (!ageFromBirth(draft.birth)) gaps.push({ target: "hero", label: "Your age" });
  if (photos.length < 5) gaps.push({ target: "hero", label: "Five photos" });
  if (!draft.video.uri) gaps.push({ target: "video", label: "Intro video" });
  if (captions.length < 2) gaps.push({ target: "hero", label: "Photo captions" });
  if (answers.length < 2) gaps.push({ target: "voice", label: "Two answers" });
  if (draft.dealbreaker.trim().length < 3)
    gaps.push({ target: "story", label: "Your untold story" });

  return { lines, gaps };
}
