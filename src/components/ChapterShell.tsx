import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppText } from "./AppText";
import { BrandMark } from "./BrandMark";
import { Button } from "./Button";
import { Atmosphere, type Tone as AtmosphereTone } from "./Atmosphere";
import { calm, colors, motion, radius, spacing } from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";

type Tone = "dusk" | "paper" | "rose";

type Props = {
  act: string;
  vibe: string;
  progress: number;
  tone?: Tone;
  children: ReactNode;
  primaryLabel: string;
  primaryDisabled?: boolean;
  /** Shown under the primary when it's disabled — never leave people guessing. */
  disabledReason?: string;
  /** A save that failed. Shown whether or not the primary is enabled, since retrying is the fix. */
  errorText?: string;
  onPrimary: () => void;
  onBack?: () => void;
  /** Save and leave. Present on every step of a long flow. */
  onExit?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  contentStyle?: ViewStyle;
};

const ATMOSPHERE: Record<Tone, AtmosphereTone> = {
  paper: "paper",
  rose: "rose",
  dusk: "plum",
};

export function ChapterShell({
  act,
  vibe,
  progress,
  tone = "paper",
  children,
  primaryLabel,
  primaryDisabled,
  disabledReason,
  errorText,
  onPrimary,
  onBack,
  onExit,
  secondaryLabel,
  onSecondary,
  contentStyle,
}: Props) {
  const reduced = useReduceMotion();
  const enter = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(progress)).current;
  const dark = tone === "dusk";

  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: calm(motion.duration.calm, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [act, vibe, enter, reduced]);

  // The bar used to jump between steps; now it travels.
  useEffect(() => {
    Animated.timing(bar, {
      toValue: Math.max(0, Math.min(progress, 1)),
      duration: calm(motion.duration.calm, reduced),
      easing: motion.easing.move,
      useNativeDriver: true,
    }).start();
  }, [progress, bar, reduced]);

  return (
    <Atmosphere tone={ATMOSPHERE[tone]}>
      <StatusBar style={dark ? "light" : "dark"} />

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
        >
          <View style={styles.top}>
            <View style={styles.topRow}>
              {onBack ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  hitSlop={12}
                  onPress={onBack}
                  style={({ pressed }) => [
                    styles.circle,
                    dark && styles.circleDark,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText variant="label" tone={dark ? "inverse" : "plum"}>
                    ‹
                  </AppText>
                </Pressable>
              ) : (
                <View style={styles.brandRow}>
                  <BrandMark size={22} />
                  <AppText variant="section" tone={dark ? "inverse" : "plum"}>
                    Aynera
                  </AppText>
                </View>
              )}

              {onExit ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save and finish later"
                  hitSlop={10}
                  onPress={onExit}
                  style={({ pressed }) => [
                    styles.exit,
                    dark && styles.circleDark,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText variant="micro" tone={dark ? "inverse" : "plum"}>
                    Save & close
                  </AppText>
                </Pressable>
              ) : (
                <View style={styles.spacer} />
              )}
            </View>

            <View
              style={[styles.track, dark && styles.trackDark]}
              accessibilityRole="progressbar"
              accessibilityLabel={act}
              accessibilityValue={{ now: Math.round(progress * 100), min: 0, max: 100 }}
            >
              <Animated.View
                style={[
                  styles.fill,
                  {
                    transform: [{ scaleX: bar }],
                    transformOrigin: "left center",
                  },
                ]}
              />
            </View>
          </View>

          <Animated.View
            style={[
              styles.body,
              contentStyle,
              {
                opacity: enter,
                transform: [
                  {
                    translateY: enter.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <AppText variant="title" tone={dark ? "inverse" : "ink"} style={styles.vibe} center>
              {vibe}
            </AppText>
            {children}
          </Animated.View>

          <View style={[styles.footer, dark && styles.footerDark]}>
            {errorText ? (
              <AppText variant="meta" tone="rose" center style={styles.reason}>
                {errorText}
              </AppText>
            ) : null}
            {primaryDisabled && disabledReason ? (
              <AppText
                variant="meta"
                tone={dark ? "inverseSoft" : "muted"}
                center
                style={styles.reason}
              >
                {disabledReason}
              </AppText>
            ) : null}
            <Button
              label={primaryLabel}
              disabled={primaryDisabled}
              onPress={onPrimary}
            />
            {secondaryLabel && onSecondary ? (
              <Button
                label={secondaryLabel}
                variant="ghost"
                size="sm"
                onDark={dark}
                haptic={false}
                onPress={onSecondary}
              />
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  top: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  circleDark: {
    backgroundColor: colors.onDark16,
  },
  exit: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.brandSoft,
  },
  spacer: { width: 40 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.985 }] },
  track: {
    height: 2,
    borderRadius: 999,
    backgroundColor: colors.borderPrimary,
    overflow: "hidden",
  },
  trackDark: {
    backgroundColor: colors.onDark16,
  },
  fill: {
    height: "100%",
    width: "100%",
    backgroundColor: colors.accentPrimary,
  },
  body: {
    flex: 1,
    paddingTop: spacing.lg,
    gap: spacing.base,
    minHeight: 0,
  },
  vibe: {
    maxWidth: 340,
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  footer: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  footerDark: {
    borderTopColor: colors.onDark16,
  },
  reason: { paddingBottom: spacing.xs },
});
