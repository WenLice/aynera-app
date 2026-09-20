/**
 * The two tracks the public site and the early-access API already use — the backend
 * validates this field as exactly "Fluid" or "Intent", so the strings match on purpose.
 */
export type RelationshipTrack = "Fluid" | "Intent";

/** Who a member wants to meet. Mirrors the gender options, plus a catch-all. */
export type InterestedIn = "Male" | "Female" | "ThirdGender" | "Everyone";

/**
 * The four outcomes offered on aynera.com/track, two under each track. Spelled as the API
 * spells them, so the choice travels without translation.
 */
export type IntentOutcome = "Platonic" | "Spontaneous" | "Prospect" | "Legacy";

/** Catalog city name as returned by the API (e.g. "Bangalore"); no longer a fixed union. */
export type LaunchCity = string;

export type CityStatus = "founding" | "waitlist";

export type OpeningKind = "response" | "khat";

export type GatheringStatus = "upcoming" | "interested" | "attended";
