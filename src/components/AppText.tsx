import { StyleSheet, Text, type TextProps, type TextStyle } from "react-native";
import { colors, fonts, leading, typography } from "../theme";

type Variant =
  /** Ceremonial one-shots — match, welcome brand, KHAT. */
  | "display"
  /** Screen and chapter titles — product sans, not serif. */
  | "title"
  /** Section headings inside a screen. */
  | "section"
  /** Slow-read quotes / letters — the rare serif body. */
  | "letter"
  /** Uppercase overline. */
  | "kicker"
  /** Default UI body copy. */
  | "body"
  /** Slightly stronger body for labels and names. */
  | "label"
  /** Secondary meta line. */
  | "meta"
  /** Timestamps, legal, counters. */
  | "micro";

type Tone =
  | "ink"
  | "soft"
  | "muted"
  | "plum"
  | "rose"
  | "inverse"
  | "inverseSoft";

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
  /** Centres the block — common enough to deserve a prop. */
  center?: boolean;
};

/**
 * Every piece of text in a rebuilt screen goes through here. It guarantees the
 * real brand families, leading that matches the size, and a cap on system font
 * scaling so large-text settings can't burst a card.
 */
export function AppText({
  variant = "body",
  tone = "ink",
  center,
  style,
  ...rest
}: Props) {
  return (
    <Text
      maxFontSizeMultiplier={CAPS[variant]}
      style={[
        variants[variant],
        tones[tone],
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

/**
 * Display type is already large, so it gets the least room to grow;
 * body copy gets the most because that's what people actually need bigger.
 */
const CAPS: Record<Variant, number> = {
  display: 1.15,
  title: 1.2,
  section: 1.25,
  letter: 1.4,
  kicker: 1.3,
  body: 1.5,
  label: 1.4,
  meta: 1.4,
  micro: 1.3,
};

const variants = StyleSheet.create<Record<Variant, TextStyle>>({
  display: {
    fontFamily: fonts.display,
    fontSize: typography.size.display,
    lineHeight: leading.display,
  },
  title: {
    fontFamily: fonts.bodySemi,
    fontSize: 28,
    lineHeight: 34,
  },
  section: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xl,
    lineHeight: leading.xl,
  },
  letter: {
    fontFamily: fonts.displayRegular,
    fontSize: typography.size.lg,
    lineHeight: leading.lg,
  },
  kicker: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.sm,
    lineHeight: leading.sm,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  body: {
    fontFamily: fonts.body,
    fontSize: typography.size.base,
    lineHeight: leading.base,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.md,
    lineHeight: leading.md,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: typography.size.sm,
    lineHeight: leading.sm,
  },
  micro: {
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.xs,
    lineHeight: leading.xs,
  },
});

const tones = StyleSheet.create<Record<Tone, TextStyle>>({
  ink: { color: colors.textPrimary },
  soft: { color: colors.textSecondary },
  muted: { color: colors.textTertiary },
  plum: { color: colors.brandPrimary },
  rose: { color: colors.accentPrimaryPressed },
  inverse: { color: colors.textOnPrimary },
  inverseSoft: { color: colors.onDark82 },
});

const styles = StyleSheet.create({
  center: { textAlign: "center" },
});
