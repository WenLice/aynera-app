/**
 * The two tracks the public site and the early-access API already use — the backend
 * validates this field as exactly "Fluid" or "Intent", so the strings match on purpose.
 */
export type RelationshipTrack = "Fluid" | "Intent";

/** The four outcomes offered on aynera.com/track, two under each track. */
export type IntentOutcome = "PLATONIC" | "SPONTANEOUS" | "PROSPECT" | "LEGACY";

export type RelationshipPace =
  | "SLOW_CLEAR"
  | "STEADY"
  | "READY_WHEN_RIGHT";

/** Catalog city name as returned by the API (e.g. "Bangalore"); no longer a fixed union. */
export type LaunchCity = string;

export type CityStatus = "founding" | "waitlist";

export type OpeningKind = "response" | "khat";

export type GatheringStatus = "upcoming" | "interested" | "attended";
