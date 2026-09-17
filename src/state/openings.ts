import type { MomentTarget } from "../components/ProfileStory";
import type { OpeningKind } from "../domain/types";

export type IntroductionOpening = {
  personId: string;
  kind: OpeningKind;
  message: string;
  moment?: MomentTarget;
  at: number;
  accepted: boolean;
};

let openings: IntroductionOpening[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeOpenings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getOpenings() {
  return openings;
}

export function getOpening(personId: string) {
  return openings.find((o) => o.personId === personId) ?? null;
}

export function hasOpening(personId: string) {
  return !!getOpening(personId);
}

export function recordOpening(input: {
  personId: string;
  kind: OpeningKind;
  message: string;
  moment?: MomentTarget;
}): IntroductionOpening | null {
  if (hasOpening(input.personId)) return null;
  const item: IntroductionOpening = {
    ...input,
    at: Date.now(),
    accepted: false,
  };
  openings = [item, ...openings];
  emit();
  return item;
}

export function acceptOpening(personId: string) {
  openings = openings.map((o) =>
    o.personId === personId ? { ...o, accepted: true } : o,
  );
  emit();
}

export function resetOpenings() {
  openings = [];
  emit();
}
