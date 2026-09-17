export type LikedPerson = {
  personId: string;
  personName: string;
  at: string;
  mutual: boolean;
};

/** Some introductions already keep you back during this pilot. */
const MUTUAL_IDS = new Set(["1", "3"]);

/** Long enough that keeping someone back reads as their choice, not a reply. */
const MATCH_DELAY_MS = 9000;

let likes: LikedPerson[] = [];
const listeners = new Set<() => void>();
const timers = new Set<ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function getLikes() {
  return likes;
}

export function subscribeLikes(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function sendLike(input: {
  personId: string;
  personName: string;
  originLabel?: string;
}): LikedPerson {
  const mutual = MUTUAL_IDS.has(input.personId);
  const item: LikedPerson = {
    personId: input.personId,
    personName: input.personName,
    at: "Just now",
    mutual,
  };
  likes = [item, ...likes.filter((l) => l.personId !== input.personId)];
  emit();

  // Lazy require avoids a circular import with threads at module load time.
  if (mutual) {
    const timer = setTimeout(() => {
      timers.delete(timer);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { startMutualChapter } = require("./threads") as typeof import("./threads");
      const { acceptOpening } = require("./openings") as typeof import("./openings");
      acceptOpening(input.personId);
      startMutualChapter({
        personId: input.personId,
        personName: input.personName,
        originLabel: input.originLabel,
      });
    }, MATCH_DELAY_MS);
    timers.add(timer);
  }

  return item;
}

export function resetLikes() {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  likes = [];
  emit();
}
