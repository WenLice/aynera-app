/** Selectable chips for Create · You */

export const LOOKING_FOR = [
  "Women",
  "Men",
  "Everyone",
] as const;

export const CHIP_GROUPS = [
  {
    id: "hobby",
    title: "Hobbies",
    subtitle: "What you actually do for fun",
    options: [
      "Reading",
      "Writing",
      "Photography",
      "Cooking",
      "Baking",
      "Gardening",
      "Painting",
      "Music",
      "Singing",
      "Dance",
      "Board games",
      "Video games",
      "DIY / making",
      "Collecting",
    ],
  },
  {
    id: "lifestyle",
    title: "Lifestyle",
    subtitle: "How your days usually feel",
    options: [
      "Early riser",
      "Night owl",
      "Homebody",
      "Always outdoors",
      "City explorer",
      "Minimalist",
      "Spontaneous",
      "Planner",
      "Fitness-first",
      "Slow living",
      "Pet parent",
      "Plant parent",
    ],
  },
  {
    id: "entertainment",
    title: "Entertainment",
    subtitle: "What you watch, hear, and show up for",
    options: [
      "Movies",
      "Web series",
      "Stand-up",
      "Live music",
      "Theatre",
      "Podcasts",
      "Anime",
      "Documentaries",
      "Sports matches",
      "Museums",
      "Concerts",
      "Open mics",
    ],
  },
  {
    id: "food",
    title: "Food & drink",
    subtitle: "Shared meals matter here",
    options: [
      "Café hopping",
      "Street food",
      "Home cooking",
      "Fine dining",
      "Vegetarian",
      "Vegan-curious",
      "Tea person",
      "Coffee person",
      "Mocktails",
      "Wine occasionally",
      "Brunch rituals",
      "Baking for people",
    ],
  },
  {
    id: "movement",
    title: "Movement",
    subtitle: "How you move through the week",
    options: [
      "Gym",
      "Yoga",
      "Running",
      "Walking",
      "Cycling",
      "Swimming",
      "Hiking",
      "Badminton",
      "Football",
      "Cricket",
      "Climbing",
      "Dance fitness",
    ],
  },
  {
    id: "social",
    title: "Social rhythm",
    subtitle: "How you like to be with people",
    options: [
      "Deep 1:1s",
      "Small circles",
      "Big gatherings",
      "Quiet weekends",
      "Host dinners",
      "Travel with friends",
      "Solo recharge",
      "Community events",
      "Volunteer",
      "Work socials",
    ],
  },
  {
    id: "growth",
    title: "Growth & mind",
    subtitle: "What you’re building toward",
    options: [
      "Career craft",
      "Learning languages",
      "Spiritual practice",
      "Therapy-positive",
      "Meditation",
      "Journaling",
      "Finance literacy",
      "Side projects",
      "Mentoring",
      "Reading non-fiction",
    ],
  },
  {
    id: "cityLife",
    title: "City life",
    subtitle: "Bangalore texture",
    options: [
      "Monsoon walks",
      "Market mornings",
      "Bookstore afternoons",
      "Park picnics",
      "Rooftop evenings",
      "Road trips",
      "Temple quiet",
      "Startup energy",
      "Arts scene",
      "Neighbourhood cafés",
    ],
  },
] as const;

import type { IntentOutcome, RelationshipPace } from "../domain/types";

/** What this could become — not values, not pace. */
export const INTENT_OUTCOMES: {
  id: IntentOutcome;
  label: string;
}[] = [
  { id: "OPEN_TO_MEETING", label: "Open to meeting someone" },
  { id: "RELATIONSHIP", label: "Looking for a relationship" },
  { id: "LIFE_PARTNER", label: "Ready for a life partner" },
];

export const PACE_OPTIONS: {
  id: RelationshipPace;
  label: string;
  hint: string;
}[] = [
  {
    id: "SLOW_CLEAR",
    label: "Slow & clear",
    hint: "No rush .. clarity first",
  },
  {
    id: "STEADY",
    label: "Steady",
    hint: "Regular conversation .. real plans",
  },
  {
    id: "READY_WHEN_RIGHT",
    label: "Ready when it feels right",
    hint: "Open to momentum when it feels mutual",
  },
];

export const RHYTHM = {
  socialEnergy: ["Quiet recharge", "Balanced", "Social spark"],
  weekends: ["Home & soft plans", "Mix of both", "Out exploring"],
  family: ["Close & present", "Warm but independent", "Figuring it out"],
} as const;

/**
 * ~20 conversation doors — deep, travel, hobbies, ambition, soft life, Gen-Z spark.
 * Members pick three.
 */
export const PROFILE_PROMPTS = [
  // Deep
  { id: "know", text: "Something people should know before they meet me…" },
  { id: "soft", text: "The last thing that made me soft…" },
  { id: "value", text: "A value I won’t negotiate…" },
  { id: "care", text: "I show care by…" },
  { id: "quiet", text: "When I’m quiet, it usually means…" },
  // Travel / place
  { id: "city", text: "In my city, you’ll find me…" },
  { id: "trip", text: "A trip that changed how I see people…" },
  { id: "first", text: "Where I’d take you first…" },
  { id: "home", text: "Home, for me, smells like…" },
  // Hobbies / life texture
  { id: "weekend", text: "A weekend that feels like me…" },
  { id: "wont", text: "I won’t shut up about…" },
  { id: "ordinary", text: "A perfect ordinary evening…" },
  { id: "hobby", text: "The hobby that tells on me…" },
  // Ambition / growth
  { id: "building", text: "Right now I’m building…" },
  { id: "proud", text: "Something I’m quietly proud of…" },
  { id: "decade", text: "In ten years, I hope I’m still…" },
  // Gen-Z / playful
  { id: "delulu", text: "My most delulu dating hope…" },
  { id: "playlist", text: "The playlist that explains me…" },
  { id: "chaos", text: "My charming brand of chaos…" },
  { id: "like", text: "You’ll know I like you when…" },
] as const;

export const PHOTO_SLOTS = 5;
export const VIDEO_SLOTS = 1;
export const MIN_CHIPS = 5;
export const MAX_CHIPS = 18;
