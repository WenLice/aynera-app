/**
 * Aynera matchmaking field layers
 * Research basis: Hinge (prompt+comment), League/Raya (admission friction),
 * Aynera MATCHMAKING-RULES (few hard filters, soft curator signals).
 */

export type FieldLayer = "create" | "prefs" | "soft" | "ops";

export const MATCHMAKING_LAYERS = {
  create: {
    title: "Create — join the cohort",
    purpose: "Trust, taste, and voice for review + Meet card",
    fields: [
      "name",
      "city",
      "lookingFor",
      "chips",
      "intent",
      "pace",
      "photos×5",
      "video×1",
      "prompts×3",
      "rhythm soft chips",
    ],
  },
  prefs: {
    title: "Preferences — hard filters",
    purpose: "Reciprocal eligibility before soft matching",
    fields: [
      "agePref range",
      "lookingFor (reciprocal)",
      "city / distance",
      "compatible intent",
      "soft dealbreaker",
    ],
  },
  soft: {
    title: "Soft signals — curator depth",
    purpose: "Prioritize intros; never a public score",
    fields: [
      "family closeness",
      "communication (later)",
      "work rhythm (later)",
      "relocation (later)",
    ],
  },
  ops: {
    title: "Ops only",
    purpose: "Never member-facing rank",
    fields: ["verification evidence", "professional review notes"],
  },
} as const;

export const AGE_PREFS = [
  { id: "22-28", label: "22 – 28" },
  { id: "26-32", label: "26 – 32" },
  { id: "30-36", label: "30 – 36" },
  { id: "34-42", label: "34 – 42" },
  { id: "open", label: "Open within reason" },
] as const;

/** Chapter map for the premium Create experience */
export const CREATE_CHAPTERS = [
  { id: "arrive", act: "Arrive", vibe: "This isn’t a form. It’s how you’ll be introduced." },
  { id: "you", act: "You", vibe: "Start with the simplest truth." },
  { id: "taste", act: "Vibe", vibe: "Pick what feels like your real life — not a résumé." },
  { id: "intent", act: "Intent", vibe: "Clarity is attractive. Ambiguity is exhausting." },
  { id: "match", act: "Match notes", vibe: "A few hard lines so introductions stay respectful." },
  { id: "presence", act: "Presence", vibe: "Show your face. Then your world. Then your voice." },
  { id: "voice", act: "Voice", vibe: "Give someone a reason to say more than hi." },
  { id: "rhythm", act: "Rhythm", vibe: "Soft signals for a human curator — not a score." },
  { id: "reveal", act: "Reveal", vibe: "This is how Aynera will read you." },
] as const;
