let seen = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function hasSeenMeetGuide() {
  return seen;
}

export function markMeetGuideSeen() {
  seen = true;
  emit();
}

export function subscribeMeetGuide(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetMeetGuide() {
  seen = false;
  emit();
}
