import type { GatheringStatus, LaunchCity } from "../domain/types";

export type GatheringKind = "squad" | "weekend_surprise";

export type VibeGathering = {
  id: string;
  kind: GatheringKind;
  title: string;
  shortDescription: string;
  dateLabel: string;
  timeLabel: string;
  area: string;
  city: LaunchCity;
  groupSizeLabel: string;
  spotsLeft?: number;
  hostName?: string;
  venueName?: string;
  vibeTags: string[];
  reasonForUser: string[];
  expect: string[];
  hostRules: string[];
  safety: string[];
  status: GatheringStatus;
  cta: "interest" | "request";
  attendeeIds?: string[];
};

export function gatheringKindLabel(gathering: Pick<VibeGathering, "kind">) {
  return gathering.kind === "weekend_surprise"
    ? "Weekend Surprise"
    : "Squad gathering";
}

export const VIBE_GATHERINGS: VibeGathering[] = [
  {
    id: "g-market-walk",
    kind: "weekend_surprise",
    title: "Market Evening",
    shortDescription:
      "A Saturday drop for Sunday at a partner venue .. wander Gandhi Bazaar, then stay if the evening wants you",
    dateLabel: "Sunday, 6 September",
    timeLabel: "5:30 PM",
    area: "Gandhi Bazaar",
    city: "Bangalore",
    groupSizeLabel: "Small group",
    spotsLeft: 4,
    venueName: "Partner venue · Basavanagudi",
    vibeTags: ["Market evenings", "Gandhi Bazaar", "Tea person"],
    reasonForUser: ["Market mornings", "Tea person", "Walking"],
    expect: [
      "A small Sunday evening in public space",
      "Wander, talk if it happens, leave whenever you like",
      "No icebreakers, no name tags, no forced pairing",
    ],
    hostRules: [
      "Public partner venue only",
      "Respectful behaviour is expected",
      "No obligation to exchange contact details",
    ],
    safety: [
      "Reporting is always available",
      "Write to grievance@aynera.in if you need a private review",
      "Aynera is not an emergency service",
    ],
    status: "upcoming",
    cta: "interest",
    attendeeIds: ["1", "2"],
  },
  {
    id: "g-coffee-books",
    kind: "squad",
    title: "Coffee + Books",
    shortDescription:
      "A small Sunday circle for people who enjoy slow conversations, good coffee and wandering through books without rushing anywhere",
    dateLabel: "Sunday morning",
    timeLabel: "10:30",
    area: "Indiranagar",
    city: "Bangalore",
    groupSizeLabel: "Small group",
    hostName: "Community host",
    venueName: "A public café and adjoining bookshop",
    vibeTags: ["Reading", "Café hopping", "Quiet weekends"],
    reasonForUser: ["Reading", "Café hopping", "Quieter social energy"],
    expect: [
      "Arrive, get a drink, sit with two or three people at a time",
      "No icebreakers, no name tags, no forced pairing",
      "Leave whenever you like",
    ],
    hostRules: [
      "Public venue only",
      "Respectful behaviour is expected",
      "No obligation to exchange contact details",
    ],
    safety: [
      "Reporting is always available",
      "Write to grievance@aynera.in if you need a private review",
      "Aynera is not an emergency service",
    ],
    status: "upcoming",
    cta: "request",
    attendeeIds: ["1", "2", "3"],
  },
];
