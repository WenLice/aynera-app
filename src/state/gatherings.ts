import { VIBE_GATHERINGS, type VibeGathering } from "../data/gatherings";

let interested = new Set<string>();
let attended = new Set<string>();
const reconnect = new Map<string, Map<string, "meet_again" | "not_for_me">>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeGatherings(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getGatherings(): VibeGathering[] {
  return VIBE_GATHERINGS;
}

export function getGathering(id: string) {
  return VIBE_GATHERINGS.find((g) => g.id === id) ?? null;
}

export function isInterested(id: string) {
  return interested.has(id);
}

export function markInterested(id: string) {
  interested.add(id);
  emit();
}

export function isAttended(id: string) {
  return attended.has(id);
}

export function markAttended(id: string) {
  attended.add(id);
  emit();
}

export function setReconnectChoice(
  gatheringId: string,
  personId: string,
  choice: "meet_again" | "not_for_me",
) {
  const map = reconnect.get(gatheringId) ?? new Map();
  map.set(personId, choice);
  reconnect.set(gatheringId, map);
  emit();
}

export function getReconnectChoice(gatheringId: string, personId: string) {
  return reconnect.get(gatheringId)?.get(personId) ?? null;
}

export function resetGatherings() {
  interested = new Set();
  attended = new Set();
  reconnect.clear();
  emit();
}
