import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  gatheringKindLabel,
  type TasteGathering,
} from "../data/gatherings";
import { colors, fonts, radius, spacing, typography } from "../theme";
import { AppText } from "./AppText";

type Props = {
  gathering: TasteGathering;
  interested?: boolean;
  onPress?: () => void;
};

export function TasteGatheringCard({
  gathering,
  interested,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={gathering.title}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Text style={styles.kicker}>{gatheringKindLabel(gathering)}</Text>
      <AppText variant="section" tone="ink">
        {gathering.title}
      </AppText>
      <AppText variant="meta" tone="soft">
        {gathering.dateLabel} .. {gathering.timeLabel} · {gathering.area}
      </AppText>
      <AppText variant="meta" tone="muted">
        {gathering.spotsLeft != null
          ? `${gathering.spotsLeft} places left`
          : gathering.groupSizeLabel}
      </AppText>

      {gathering.reasonForUser.length ? (
        <View style={styles.why}>
          <Text style={styles.whyKicker}>Why you're seeing this</Text>
          <AppText variant="body" tone="soft">
            {gathering.reasonForUser.join("\n")}
          </AppText>
        </View>
      ) : null}

      <Pressable
        onPress={onPress}
        disabled={interested}
        style={({ pressed }) => [
          styles.cta,
          interested && styles.ctaDone,
          pressed && !interested && styles.pressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          interested
            ? "Interest noted"
            : gathering.cta === "request"
              ? "Request a place"
              : "I'm interested"
        }
      >
        <Text style={[styles.ctaText, interested && styles.ctaTextDone]}>
          {interested
            ? gathering.cta === "request"
              ? "Place requested"
              : "Interest noted"
            : gathering.cta === "request"
              ? "Request a place"
              : "I'm interested"}
        </Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.squadsSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  pressed: { opacity: 0.92 },
  kicker: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xs,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.accentPrimaryPressed,
  },
  why: {
    marginTop: spacing.xs,
    gap: 4,
  },
  whyKicker: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textTertiary,
  },
  cta: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  ctaDone: {
    backgroundColor: colors.brandSoft,
  },
  ctaText: {
    fontFamily: fonts.bodySemi,
    color: colors.textOnPrimary,
    fontSize: typography.size.md,
  },
  ctaTextDone: {
    color: colors.brandPrimary,
  },
});
