const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Short relative time for list rows. Deliberately vague past a week — an exact
 * date on an old letter makes it feel abandoned.
 */
export function shortWhen(at: number, now = Date.now()) {
  const gap = Math.max(0, now - at);
  if (gap < MINUTE) return "Just now";
  if (gap < HOUR) return `${Math.floor(gap / MINUTE)}m`;
  if (gap < DAY) return `${Math.floor(gap / HOUR)}h`;
  if (gap < 7 * DAY) return `${Math.floor(gap / DAY)}d`;
  return "A while ago";
}

/** Longer form for inside a letter, where the reader has time. */
export function letterWhen(at: number, now = Date.now()) {
  const gap = Math.max(0, now - at);
  if (gap < MINUTE) return "Just now";
  if (gap < HOUR) {
    const m = Math.floor(gap / MINUTE);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (gap < DAY) {
    const h = Math.floor(gap / HOUR);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (gap < 2 * DAY) return "Yesterday";
  if (gap < 7 * DAY) return `${Math.floor(gap / DAY)} days ago`;

  return new Date(at).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}
