/** Aynera design tokens — source of truth for app styling. */

/**
 * Semantic colour system.
 *
 * The balance the app aims for: warm ivory and white carry most of the
 * surface area, plum is unmistakably the brand, and terracotta appears as an
 * accent rather than a large field. Reach for the semantic name, never a raw
 * hex — near-identical warm whites are what made long sessions tiring.
 */

/* surfaces */
const backgroundPrimary = "#FBF8F6";
const surfacePrimary = "#FFFFFF";
const surfaceSecondary = "#FDFBFA";

/* brand */
const brandPrimary = "#552449";
const brandPrimaryPressed = "#421B39";
const brandSecondary = "#7B5C70";
const brandSoft = "#EFE6EC";

/* accent */
const accentPrimary = "#D98666";
const accentPrimaryPressed = "#C47457";
const accentSoft = "#F6E5DC";

/* text */
const textPrimary = "#292428";
const textSecondary = "#756D72";
const textTertiary = "#92888E";
const textOnPrimary = "#FFFFFF";

/* lines */
const borderPrimary = "#E7E0E3";
const borderStrong = "#D8CDD3";
const divider = "#EEE9EB";

/* status */
const success = "#718A79";
const danger = "#B45F5F";

export const colors = {
  backgroundPrimary,
  surfacePrimary,
  surfaceSecondary,
  /** Frosted card, only where it sits over a photo or video. */
  surfaceGlass: "rgba(255,255,255,0.92)",

  brandPrimary,
  brandPrimaryPressed,
  brandSecondary,
  brandSoft,

  accentPrimary,
  accentPrimaryPressed,
  accentSoft,

  textPrimary,
  /** Someone's own words — a touch warmer than UI text. */
  textAnswer: "#352A31",
  textSecondary,
  textTertiary,
  textOnPrimary,
  textOnAccentSoft: "#4A343D",
  textLink: brandPrimary,

  borderPrimary,
  borderStrong,
  /** Unselected chips and cards. */
  borderChip: "#E2D9DE",
  divider,

  success,
  successSoft: "#E8EFEA",
  warning: "#B88755",
  warningSoft: "#F5EDE3",
  danger,
  dangerSoft: "#F5E7E7",

  disabledBackground: "#D8CCD4",
  disabledText: "#867A82",

  /* section washes — kept extremely soft so nothing reads as a second product */
  whyIntroSoft: "#F7ECE7",
  tasteSoft: "#F3E9EE",
  tasteSoftBorder: "#E3D7DF",
  duosSoft: "#F2E9EF",
  squadsSoft: "#F8E9E1",
  threadsBackground: "#FAF8F7",
  bubbleReceived: "#F0ECEE",
  messageMeta: "#8A8186",
  /** Decorative blobs only — never content. */
  decorPeach: "#F7E7DF",
  decorMauve: "#F0E8EB",

  /**
   * Scrims over photography, and ivory laid over dark ceremonial surfaces.
   * Both are scales: pick the step, don't invent an alpha.
   */
  scrim12: "rgba(41,36,40,0.12)",
  scrim20: "rgba(41,36,40,0.2)",
  scrim30: "rgba(41,36,40,0.3)",
  scrim42: "rgba(41,36,40,0.42)",
  scrim55: "rgba(41,36,40,0.55)",
  scrim72: "rgba(41,36,40,0.72)",
  scrim90: "rgba(41,36,40,0.9)",
  /** Sheet and modal backdrop. */
  scrim: "rgba(41,36,40,0.38)",

  onDark08: "rgba(251,248,246,0.08)",
  onDark16: "rgba(251,248,246,0.16)",
  onDark24: "rgba(251,248,246,0.24)",
  onDark32: "rgba(251,248,246,0.32)",
  onDark70: "rgba(251,248,246,0.7)",
  onDark82: "rgba(251,248,246,0.82)",
  onDark92: "rgba(251,248,246,0.92)",
  /** A hairline of accent on a dark surface. */
  accentLine: "rgba(217,134,102,0.45)",
  /** The terracotta bloom behind ceremonial dark screens. */
  accentGlow: "rgba(217,134,102,0.16)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

/**
 * Controlled type scale — avoid one-off sizes that blow hierarchy.
 *
 * Usage map:
 * - xs (12): legal, timestamps
 * - sm (13): overlines, act labels, micro meta
 * - base (15): body UI
 * - md (16): buttons, strong UI
 * - lg (18): secondary titles, short emphasis
 * - xl (22): brand wordmark, section titles
 * - xxl (26): chapter / screen titles (max for multi-line forms)
 * - xxxl (30): hero names on photos only
 * - display (40): ceremonial one-shots only (match, welcome brand)
 */
/**
 * Real families, one per weight — never pair these with `fontWeight`,
 * Android renders a synthetic bold on top of an already-bold file.
 */
/**
 * Type system:
 * - Plus Jakarta Sans owns everyday product UI (Hinge-like clarity)
 * - Cormorant stays rare — Welcome brand, Match, KHAT, letter quotes
 */
export const fonts = {
  display: "CormorantGaramond_600SemiBold",
  displayRegular: "CormorantGaramond_400Regular",
  displayMedium: "CormorantGaramond_500Medium",
  displayItalic: "CormorantGaramond_400Regular_Italic",
  body: "PlusJakartaSans_400Regular",
  bodyMedium: "PlusJakartaSans_500Medium",
  bodySemi: "PlusJakartaSans_600SemiBold",
  bodyBold: "PlusJakartaSans_700Bold",
} as const;

/** Leading paired to each size in the scale — stops per-file guesswork. */
export const leading = {
  xs: 16,
  sm: 18,
  base: 21,
  md: 23,
  lg: 26,
  xl: 29,
  xxl: 33,
  xxxl: 36,
  display: 46,
} as const;

export const typography = {
  display: "serif",
  sans: "System",
  size: {
    xs: 12,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    xxxl: 30,
    display: 40,
  },
} as const;

/** One shadow language. `ceremony` is for match / KHAT moments only. */
export const elevation = {
  none: {},
  sm: {
    shadowColor: brandPrimaryPressed,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  md: {
    shadowColor: brandPrimaryPressed,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: brandPrimaryPressed,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  ceremony: {
    shadowColor: brandPrimaryPressed,
    shadowOpacity: 0.28,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
} as const;

export const brand = {
  name: "Aynera",
  tagline: "The Era of Togetherness.",
} as const;
