/**
 * Lifestyle and belief questions. Every one is optional and every one carries
 * its own visibility switch — answering is never the same as publishing.
 */

export type LifestyleQuestion = {
  id: string;
  question: string;
  /** Short label used when the answer is published on a profile. */
  vital: string;
  hint?: string;
  options: string[];
};

export const LIFESTYLE_QUESTIONS: LifestyleQuestion[] = [
  {
    id: "drink",
    question: "Do you drink?",
    vital: "Drinks",
    options: ["Yes", "Sometimes", "No", "Prefer not to say"],
  },
  {
    id: "smoke",
    question: "Do you smoke?",
    vital: "Smokes",
    options: ["Yes", "Sometimes", "No", "Prefer not to say"],
  },
  {
    id: "diet",
    question: "How do you eat?",
    vital: "Food",
    hint: "Useful for the first meal you'd share",
    options: [
      "Vegetarian",
      "Eggetarian",
      "Non-vegetarian",
      "Vegan",
      "Jain",
      "Prefer not to say",
    ],
  },
  {
    id: "movement",
    question: "How often do you move your body?",
    vital: "Movement",
    options: [
      "Most days",
      "A few times a week",
      "Now and then",
      "Prefer not to say",
    ],
  },
];

export const BELIEF_QUESTIONS: LifestyleQuestion[] = [
  {
    id: "faith",
    question: "How does faith sit in your life?",
    vital: "Faith",
    hint: "We ask because it shapes whether two people feel like a good fit",
    options: [
      "Practising",
      "Spiritual, not ritual",
      "Culturally, not religiously",
      "Not religious",
      "Still figuring it out",
      "Prefer not to say",
    ],
  },
  {
    id: "family",
    question: "How involved is family in your decisions?",
    vital: "Family",
    options: [
      "Very involved",
      "Consulted, not deciding",
      "Mostly my call",
      "Prefer not to say",
    ],
  },
  {
    id: "children",
    question: "How do you feel about children?",
    vital: "Children",
    options: [
      "Want them",
      "Open to them",
      "Don't want them",
      "Have them already",
      "Prefer not to say",
    ],
  },
];

export const HEIGHT_MIN_CM = 137;
export const HEIGHT_MAX_CM = 213;
export const HEIGHT_DEFAULT_CM = 168;

/** 168 → 5' 6" */
export function formatHeight(cm: number) {
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return `${feet}' ${inches}"`;
}
