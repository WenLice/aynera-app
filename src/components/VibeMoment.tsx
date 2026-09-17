import { Image, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { colors, fonts, leading, spacing, typography } from "../theme";
import type { VibeMomentCopy } from "../data/vibeMoments";

type Props = {
  moment: VibeMomentCopy;
  onContinue: () => void;
  onBack?: () => void;
};

/** Full-bleed pause between chapters — photo first, then a quiet line. */
export function VibeMoment({ moment, onContinue, onBack }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={{ uri: moment.image }} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={[
          colors.scrim30,
          "transparent",
          colors.onDark16,
          colors.backgroundPrimary,
        ]}
        locations={[0, 0.32, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.top}>
          {onBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              onPress={onBack}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
            >
              <AppText variant="label" tone="inverse">
                ‹
              </AppText>
            </Pressable>
          ) : (
            <View style={styles.back} />
          )}
        </View>

        <View style={styles.bottom}>
          <AppText style={styles.line}>{moment.line}</AppText>
          <Button label={moment.cta} onPress={onContinue} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brandPrimaryPressed },
  safe: { flex: 1, justifyContent: "space-between" },
  top: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.scrim30,
  },
  pressed: { opacity: 0.75 },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
  },
  line: {
    fontFamily: fonts.display,
    fontSize: typography.size.xxl,
    lineHeight: leading.xxl + 4,
    color: colors.textPrimary,
    textAlign: "center",
    maxWidth: 340,
    alignSelf: "center",
  },
});
