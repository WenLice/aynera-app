import type { LaunchCity } from "../domain/types";
import { colors } from "../theme";

export type Vibe = readonly [string, string];

/**
 * One beat of an introduction. Order matters — the scroll alternates
 * image → voice → image so it reads like a letter, never a feed.
 */
export type StoryBeat =
  | {
      kind: "photo";
      id: string;
      label: string;
      vibe: Vibe;
      uri?: string;
      caption?: string;
    }
  | {
      kind: "video";
      id: string;
      vibe: Vibe;
      /** Real video plays inline; poster is used until one exists. */
      videoUri?: string;
      posterUri?: string;
      caption?: string;
    }
  | { kind: "answer"; id: string; prompt: string; answer: string }
  | { kind: "story"; id: string; title: string; body: string };

export type HeroPhoto = {
  id: string;
  vibe: Vibe;
  uri?: string;
  /** Replaces the signature line while this photo is the one showing. */
  caption?: string;
};

export type PersonProfile = {
  id: string;
  /** Name shown before a mutual match (initial or nickname). */
  name: string;
  /** Real first name — used after a mutual match. Falls back to name. */
  realName?: string;
  age: number;
  city: LaunchCity | "";
  area?: string;
  /** What they do — the most-read line after the name. */
  work: string;
  lookingFor: string;
  intent: string;
  pace: string;
  /** Curator note, viewer side only. */
  reason: string;
  /** Up to three plain-language reasons. */
  whyReasons?: string[];
  verified: boolean;
  /** The front of the card — tap right or left to flip between them. */
  heroPhotos: HeroPhoto[];
  /** One line in their own voice, sitting under the name. */
  signature: string;
  vitals: { label: string; value: string }[];
  taste: string[];
  rhythm: string[];
  beats: StoryBeat[];
};

const V = {
  a: [colors.brandPrimary, colors.accentPrimaryPressed] as const,
  b: [colors.brandPrimaryPressed, colors.accentPrimary] as const,
  c: [colors.brandSecondary, colors.accentPrimaryPressed] as const,
  d: [colors.brandPrimaryPressed, colors.accentPrimary] as const,
};

export const MOCK_PEOPLE: PersonProfile[] = [
  {
    id: "1",
    name: "A.",
    realName: "Ananya",
    age: 28,
    city: "Bangalore",
    area: "Indiranagar",
    work: "Product designer",
    lookingFor: "Men",
    intent: "Ready for a life partner",
    pace: "Slow & clear",
    reason: "Similar pace .. shared love of quieter weekends",
    whyReasons: [
      "Similar pace",
      "Both prefer smaller social settings",
      "Shared love of photography",
    ],
    verified: true,
    heroPhotos: [
      {
        id: "a1",
        vibe: V.a,
        uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "a2",
        vibe: V.b,
        uri: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
        caption: "I’m intentional about mornings.",
      },
    ],
    signature: "I’d rather be early to the gallery than fashionably late anywhere.",
    vitals: [
      { label: "Intent", value: "Ready for a life partner" },
      { label: "Pace", value: "Slow & clear" },
      { label: "Open to", value: "Men" },
      { label: "Height", value: "5' 4\"" },
      { label: "From", value: "Kochi" },
      { label: "Drinks", value: "Sometimes" },
      { label: "Smokes", value: "No" },
      { label: "Food", value: "Vegetarian" },
      { label: "Faith", value: "Spiritual, not ritual" },
      { label: "Children", value: "Want them" },
    ],
    taste: [
      "Reading",
      "Café hopping",
      "Photography",
      "Yoga",
      "Deep 1:1s",
      "Bookstore afternoons",
    ],
    rhythm: ["Balanced social energy", "Mix of home & exploring", "Warm but independent"],
    beats: [
      {
        kind: "answer",
        id: "a-ans1",
        prompt: "Ask me about…",
        answer: "The tiny gallery near Church Street I keep going back to.",
      },
      {
        kind: "photo",
        id: "a3",
        label: "Your world",
        vibe: V.c,
        uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
        caption: "A soft place in my week.",
      },
      {
        kind: "answer",
        id: "a-ans2",
        prompt: "I show care by…",
        answer:
          "Remembering the small thing you mentioned once, then showing up with it.",
      },
      {
        kind: "video",
        id: "a-vid",
        vibe: V.d,
        posterUri:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
        caption: "A weekend that feels like me…",
      },
      {
        kind: "answer",
        id: "a-ans3",
        prompt: "You’ll know I like you when…",
        answer: "I start protecting my quiet Sunday for you.",
      },
      {
        kind: "story",
        id: "a-story",
        title: "Something I don’t usually say first",
        body: "I get quietly serious about soft things — the first coffee of the day, light in old galleries, and people who mean what they say.",
      },
      {
        kind: "photo",
        id: "a4",
        label: "Something you love",
        vibe: V.d,
        uri: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
        caption: "The corner table that knows my order.",
      },
    ],
  },
  {
    id: "2",
    name: "K.",
    realName: "Kabir",
    age: 31,
    city: "Bangalore",
    area: "Koramangala",
    work: "Product manager",
    lookingFor: "Women",
    intent: "Open to meeting someone",
    pace: "Steady",
    reason: "Similar follow-through .. shared love of cooking",
    whyReasons: ["Similar pace", "Shared love of cooking", "Both like live music"],
    verified: true,
    heroPhotos: [
      {
        id: "k1",
        vibe: V.b,
        uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "k2",
        vibe: V.a,
        uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
        caption: "Where I’d take you first.",
      },
    ],
    signature: "I remember small things and quietly build around them.",
    vitals: [
      { label: "Intent", value: "Open to meeting someone" },
      { label: "Pace", value: "Steady" },
      { label: "Open to", value: "Women" },
      { label: "Height", value: "5' 11\"" },
      { label: "From", value: "Lucknow" },
      { label: "Drinks", value: "Sometimes" },
      { label: "Smokes", value: "No" },
      { label: "Movement", value: "Most days" },
      { label: "Faith", value: "Not religious" },
      { label: "Family", value: "Consulted, not deciding" },
    ],
    taste: ["Running", "Live music", "Cooking", "Reading non-fiction", "Host dinners"],
    rhythm: ["Social spark", "Out exploring", "Close & present"],
    beats: [
      {
        kind: "answer",
        id: "k-ans1",
        prompt: "Together looks like…",
        answer: "Weeknight walks, honest check-ins, and room to grow alone too.",
      },
      {
        kind: "photo",
        id: "k3",
        label: "Your world",
        vibe: V.c,
        uri: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80",
        caption: "Sunday, mid-run, no plans after.",
      },
      {
        kind: "answer",
        id: "k-ans2",
        prompt: "Green flags I notice…",
        answer: "People who are kind to waiters and early to things that matter.",
      },
      {
        kind: "video",
        id: "k-vid",
        vibe: V.d,
        posterUri:
          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80",
        caption: "I’m hoping to meet someone who…",
      },
      {
        kind: "answer",
        id: "k-ans3",
        prompt: "Right now I’m building…",
        answer: "A habit of saying the hard thing gently, on the same day.",
      },
      {
        kind: "story",
        id: "k-story",
        title: "Something I don’t usually say first",
        body: "I remember small things and build around them — the playlist you mentioned once, the temple quiet on a busy road, the way a plan should still feel kind.",
      },
      {
        kind: "photo",
        id: "k4",
        label: "Something you love",
        vibe: V.b,
        uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80",
        caption: "My kitchen at 8pm, everyone talking at once.",
      },
    ],
  },
  {
    id: "3",
    name: "M.",
    realName: "Meher",
    age: 27,
    city: "Bangalore",
    area: "Jayanagar",
    work: "Architect",
    lookingFor: "Everyone",
    intent: "Looking for a relationship",
    pace: "Ready when it feels right",
    reason: "Both prefer smaller social settings .. shared love of tea",
    whyReasons: [
      "Both prefer smaller social settings",
      "Shared love of tea",
      "Similar city texture",
    ],
    verified: true,
    heroPhotos: [
      {
        id: "m1",
        vibe: V.c,
        uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "m2",
        vibe: V.a,
        uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80",
        caption: "A detail I love about this place.",
      },
    ],
    signature: "I design rooms for light and people for calm.",
    vitals: [
      { label: "Intent", value: "Looking for a relationship" },
      { label: "Pace", value: "Ready when it feels right" },
      { label: "Open to", value: "Everyone" },
      { label: "Height", value: "5' 6\"" },
      { label: "From", value: "Bangalore" },
      { label: "Drinks", value: "No" },
      { label: "Smokes", value: "No" },
      { label: "Food", value: "Vegetarian" },
      { label: "Faith", value: "Spiritual, not ritual" },
      { label: "Children", value: "Open to them" },
    ],
    taste: ["Museums", "Market mornings", "Tea person", "Quiet weekends", "Journaling"],
    rhythm: ["Quiet recharge", "Home & soft plans", "Warm but independent"],
    beats: [
      {
        kind: "answer",
        id: "m-ans1",
        prompt: "I show care by…",
        answer: "Remembering the small things and making time feel unhurried.",
      },
      {
        kind: "photo",
        id: "m3",
        label: "Your world",
        vibe: V.b,
        uri: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=80",
        caption: "The window I stole an hour by.",
      },
      {
        kind: "answer",
        id: "m-ans2",
        prompt: "In my city, you’ll find me…",
        answer: "Market mornings in Gandhi Bazaar, then tea somewhere with no music.",
      },
      {
        kind: "video",
        id: "m-vid",
        vibe: V.d,
        posterUri:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
        caption: "The last thing that made me soft…",
      },
      {
        kind: "answer",
        id: "m-ans3",
        prompt: "A value I won’t negotiate…",
        answer: "Gentleness — especially when nobody’s watching.",
      },
      {
        kind: "story",
        id: "m-story",
        title: "Something I don’t usually say first",
        body: "I design rooms for light and people for calm — I want a partner who thrives in both stillness and a crowded market morning.",
      },
      {
        kind: "photo",
        id: "m4",
        label: "Something you love",
        vibe: V.d,
        uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80",
        caption: "Tea, no music, no rush.",
      },
    ],
  },
  {
    id: "4",
    name: "R.",
    realName: "Rohan",
    age: 30,
    city: "Bangalore",
    area: "HSR Layout",
    work: "Engineer",
    lookingFor: "Women",
    intent: "Looking for a relationship",
    pace: "Steady",
    reason: "Shared love of coffee .. both like long walks",
    whyReasons: ["Shared love of coffee", "Both like long walks"],
    verified: true,
    heroPhotos: [
      {
        id: "r1",
        vibe: V.d,
        uri: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: "r2",
        vibe: V.a,
        uri: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=80",
        caption: "Trail head, 6am, still smiling.",
      },
    ],
    signature: "I show up on time and stay for the hard part.",
    vitals: [
      { label: "Intent", value: "Looking for a relationship" },
      { label: "Pace", value: "Steady" },
      { label: "Open to", value: "Women" },
      { label: "Height", value: "6' 0\"" },
      { label: "From", value: "Nagpur" },
      { label: "Drinks", value: "Sometimes" },
      { label: "Smokes", value: "No" },
      { label: "Movement", value: "A few times a week" },
      { label: "Faith", value: "Culturally, not religiously" },
      { label: "Children", value: "Open to them" },
    ],
    taste: ["Hiking", "Board games", "Coffee person", "Side projects", "Park picnics"],
    rhythm: ["Balanced", "Mix of both", "Figuring it out"],
    beats: [
      {
        kind: "answer",
        id: "r-ans1",
        prompt: "A perfect ordinary evening…",
        answer: "Cooking something simple, then a walk with no phones out.",
      },
      {
        kind: "photo",
        id: "r3",
        label: "Your world",
        vibe: V.b,
        uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
        caption: "This is me when I’m most myself.",
      },
      {
        kind: "answer",
        id: "r-ans2",
        prompt: "I won’t shut up about…",
        answer: "Trails within three hours of the city, and filter coffee.",
      },
      {
        kind: "video",
        id: "r-vid",
        vibe: V.c,
        posterUri:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=900&q=80",
        caption: "Green flags I look for…",
      },
      {
        kind: "answer",
        id: "r-ans3",
        prompt: "Something I’m quietly proud of…",
        answer: "Six years of Sunday calls with my grandmother.",
      },
      {
        kind: "story",
        id: "r-story",
        title: "Something I don’t usually say first",
        body: "I’m the friend who shows up on time and stays for the hard part. Looking for someone who treats humour as warmth, not a weapon.",
      },
      {
        kind: "photo",
        id: "r4",
        label: "Something you love",
        vibe: V.c,
        uri: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
        caption: "Filter coffee, second cup, no rush.",
      },
    ],
  },
];
