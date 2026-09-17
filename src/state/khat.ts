import { KHAT_PER_WINDOW, KHAT_ROLLING_DAYS } from "../config/aynera";

export type KhatSent = {
  id: string;
  personId: string;
  personName: string;
  note: string;
  momentTitle?: string;
  at: string;
  sentAt: number;
};

const WINDOW_MS = KHAT_ROLLING_DAYS * 24 * 60 * 60 * 1000;

let sent: KhatSent[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function inWindow(item: KhatSent) {
  return Date.now() - item.sentAt < WINDOW_MS;
}

export function getKhatRemaining() {
  const used = sent.filter(inWindow).length;
  return Math.max(0, KHAT_PER_WINDOW - used);
}

export function getKhatsSent() {
  return sent;
}

export function subscribeKhat(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function sendKhat(input: {
  personId: string;
  personName: string;
  note: string;
  momentTitle?: string;
}): KhatSent | null {
  if (getKhatRemaining() < 1) return null;
  const item: KhatSent = {
    id: `khat-${Date.now()}`,
    personId: input.personId,
    personName: input.personName,
    note: input.note,
    momentTitle: input.momentTitle,
    at: "Just now",
    sentAt: Date.now(),
  };
  sent = [item, ...sent];
  emit();
  return item;
}

export function resetKhat() {
  sent = [];
  emit();
}
