import { FLAGS } from "../config/aynera";

export type PrivacyPreference = {
  hideContacts: boolean;
  hiddenNumbers: string[];
};

let prefs: PrivacyPreference = {
  hideContacts: false,
  hiddenNumbers: [],
};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribePrivacy(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPrivacyPreference() {
  return prefs;
}

export function setHideContacts(next: boolean) {
  if (!FLAGS.hidePeopleIKnow) return;
  prefs = { ...prefs, hideContacts: next };
  emit();
}

export function hidePeopleAvailable() {
  return FLAGS.hidePeopleIKnow;
}

export function resetPrivacy() {
  prefs = { hideContacts: false, hiddenNumbers: [] };
  emit();
}
