import { MOCK_PEOPLE } from "../data/mockPeople";

let passed: string[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeCircle(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function weeklyIntroductions() {
  return MOCK_PEOPLE;
}

export function remainingIntroductions() {
  return weeklyIntroductions().filter((p) => !passed.includes(p.id));
}

export function getPassedIds() {
  return passed;
}

export function passIntroduction(id: string) {
  if (passed.includes(id)) return;
  passed = [...passed, id];
  emit();
}

export function weekPosition(id: string) {
  const list = weeklyIntroductions();
  const index = list.findIndex((p) => p.id === id);
  return {
    index: index >= 0 ? index + 1 : 1,
    total: list.length,
  };
}

export function resetCircle() {
  passed = [];
  emit();
}
