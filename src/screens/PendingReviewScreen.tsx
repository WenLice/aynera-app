import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getMyAdmission } from "../api/members";
import type { AdmissionState } from "../api/types";
import { getSession } from "../auth/session";
import { signOut } from "../auth/signOut";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { launchCitiesLine, useLaunchCities } from "../data/cities";
import { calm, colors, fonts, leading, motion, radius, spacing, typography } from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "PendingReview">;

/** Warm photo stage — not a flat plum wash. */
const REVIEW_HERO =
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1600&q=80";

const COPY: Record<
  "review" | "rejected" | "draft",
  { kicker: string; title: string; body: string }
> = {
  review: {
    kicker: "Under review",
    title: "We're reading you carefully.",
    body:
      "A human checks authenticity and intent before you appear in Duos — so introductions stay calm and curated.",
  },
  rejected: {
    kicker: "Not this time",
    title: "We couldn't approve your profile yet.",
    body: "You can update your introduction and send it for another read.",
  },
  draft: {
    kicker: "Almost there",
    title: "Your introduction isn't finished.",
    body: "Pick up where you left off and send it for a human read.",
  },
};

function phaseFor(state: AdmissionState | null) {
  if (state === "Rejected") return "rejected";
  if (state === "Draft") return "draft";
  return "review";
}

/**
 * The waiting room. Only an approved admission opens the app — "Check again"
 * re-reads the state, everything else leads back out.
 */
export function PendingReviewScreen({ navigation, route }: Props) {
  const reduced = useReduceMotion();
  const rise = useRef(new Animated.Value(0)).current;
  const cities = useLaunchCities();
  // Splash and Login pass the admission they just fetched; only "Check again"
  // hits the API after that.
  const seeded = route.params?.state !== undefined;
  const [state, setState] = useState<AdmissionState | null>(route.params?.state ?? null);
  const [reason, setReason] = useState<string | null>(route.params?.reason ?? null);
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const check = useCallback(async () => {
    if (!getSession()) return;
    setChecking(true);
    setNote(null);
    try {
      const admission = await getMyAdmission();
      setState(admission.state);
      setReason(admission.decisionReason);
      if (admission.state === "Approved") {
        navigation.reset({ index: 0, routes: [{ name: "Main" }] });
        return;
      }
      if (admission.state === "Draft") {
        setNote(null);
      } else {
        setNote("Still under review — we'll let you know the moment it changes.");
      }
    } catch {
      setNote("We couldn't check right now. Try again in a moment.");
    } finally {
      setChecking(false);
    }
  }, [navigation]);

  useEffect(() => {
    if (!seeded) void check();
  }, [seeded, check]);

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: calm(motion.duration.slow, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [rise, reduced]);

  const phase = phaseFor(state);
  const copy = COPY[phase];
  const promises = [
    launchCitiesLine(cities),
    "Curated Duos and Squads",
    "You'll hear when you're in",
  ];

  async function leave() {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  }

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
            {copy.kicker}
          </AppText>
          <AppText variant="title" tone="inverse" style={styles.title}>
            {copy.title}
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
            {copy.body}
          </AppText>

          {phase === "rejected" && reason ? (
            <AppText variant="meta" tone="rose" style={styles.copy}>
              {reason}
            </AppText>
          ) : null}

          {phase === "review" ? (
            <View style={styles.list}>
              {promises.map((line) => (
                <View key={line} style={styles.row}>
                  <View style={styles.dot} />
                  <AppText variant="body" tone="ink" style={styles.rowText}>
                    {line}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}

          {note ? (
            <AppText variant="meta" tone="muted" center>
              {note}
            </AppText>
          ) : null}

          <View style={styles.actions}>
            {phase === "review" ? (
              <Button
                label={checking ? "Checking…" : "Check again"}
                loading={checking}
                onPress={() => void check()}
              />
            ) : (
              <Button
                label={phase === "rejected" ? "Update and resubmit" : "Continue my introduction"}
                onPress={() => navigation.replace("ProfileSetup")}
              />
            )}
            <Button label="Back to welcome" variant="ghost" onPress={() => void leave()} />
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
