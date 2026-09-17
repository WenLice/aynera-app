import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { calm, colors, fonts, leading, motion, radius, spacing, typography } from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PendingReview">;

const PROMISES = [
  "Bangalore first .. Delhi and Mumbai next",
  "Curated Duos and Squads",
  "You'll hear when you're in",
];

/** Warm photo stage — not a flat plum wash. */
const REVIEW_HERO =
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=80";

export function PendingReviewScreen({ navigation }: Props) {
  const reduced = useReduceMotion();
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: calm(motion.duration.slow, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [rise, reduced]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={{ uri: REVIEW_HERO }} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={[
          colors.scrim42,
          colors.scrim12,
          colors.onDark70,
          colors.brandPrimaryPressed,
        ]}
        locations={[0, 0.28, 0.58, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: rise,
              transform: [
                {
                  translateY: rise.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <AppText style={styles.brand}>Aynera</AppText>
          <AppText variant="kicker" tone="rose" style={styles.kicker}>
            Under review
          </AppText>
          <AppText variant="title" tone="inverse" style={styles.title}>
            We're reading you carefully.
          </AppText>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            {
              opacity: rise,
              transform: [
                {
                  translateY: rise.interpolate({
                    inputRange: [0, 1],
                    outputRange: [22, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <AppText variant="body" tone="soft" style={styles.copy}>
            A human checks authenticity and intent before you appear in Duos —
            so introductions stay calm and curated.
          </AppText>

          <View style={styles.list}>
            {PROMISES.map((line) => (
              <View key={line} style={styles.row}>
                <View style={styles.dot} />
                <AppText variant="body" tone="ink" style={styles.rowText}>
                  {line}
                </AppText>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <Button
              label="Look around while you wait"
              onPress={() => navigation.replace("Main")}
            />
            <Button
              label="Back to welcome"
              variant="ghost"
              onPress={() => navigation.replace("Splash")}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brandPrimaryPressed },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
  },
  hero: {
    paddingTop: spacing.xxxl,
    gap: spacing.sm,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: typography.size.xxl,
    lineHeight: leading.xxl,
    color: colors.textOnPrimary,
  },
  kicker: { marginTop: spacing.xs },
  title: { marginTop: spacing.xs, maxWidth: 320 },
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  copy: { maxWidth: 340 },
  list: { gap: spacing.md, marginTop: spacing.xs },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  rowText: { flex: 1 },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginTop: 8,
    backgroundColor: colors.accentPrimary,
  },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
