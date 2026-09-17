/** Lifestyle frames for create-profile pauses — connection, not stock dating. */

export type VibeMomentId = "arrive" | "connect" | "glimpse";

export type VibeMomentCopy = {
  id: VibeMomentId;
  image: string;
  line: string;
  cta: string;
};

export const VIBE_MOMENTS: Record<VibeMomentId, VibeMomentCopy> = {
  arrive: {
    id: "arrive",
    image:
      "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1400&q=80",
    line: "You don't need to get it perfect.\nWe'll guide you as you go.",
    cta: "Continue",
  },
  connect: {
    id: "connect",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1400&q=80",
    line: "These next details can help\nothers connect with you.",
    cta: "Continue",
  },
  glimpse: {
    id: "glimpse",
    image:
      "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1400&q=80",
    line: "Your profile is a glimpse of you.",
    cta: "Continue",
  },
};

export const WELCOME_HERO =
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=80";
