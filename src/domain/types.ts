export type IntentOutcome = "OPEN_TO_MEETING" | "RELATIONSHIP" | "LIFE_PARTNER";

export type RelationshipPace =
  | "SLOW_CLEAR"
  | "STEADY"
  | "READY_WHEN_RIGHT";

/** Catalog city name as returned by the API (e.g. "Bangalore"); no longer a fixed union. */
export type LaunchCity = string;

export type CityStatus = "founding" | "waitlist";

export type OpeningKind = "response" | "khat";

export type GatheringStatus = "upcoming" | "interested" | "attended";
