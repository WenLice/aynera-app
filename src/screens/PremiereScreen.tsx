import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { StackActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ApiError } from "../api/client";
import { submitAdmission } from "../api/members";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { ProfileStory, type EditTarget } from "../components/ProfileStory";
import type { RootStackParamList } from "../navigation/types";
import { draftToPerson } from "../state/draftToPerson";
import { getProfileDraft, updateProfileDraft } from "../state/profileDraft";
import { isFoundingCity } from "../data/cities";
import { readProfile } from "../state/profileRead";
import { colors, fonts, radius, spacing, typography } from "../theme";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

type Props = NativeStackScreenProps<RootStackParamList, "Premiere">;

const OPENING_MS = 3000;

/** Why the submission was refused, in the app's voice. */
function sendErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";
  switch (error.code) {
    case "admission_profile_required":
      return "Your basic details haven't saved yet. Tap Edit on them and save once more.";
    case "admission_preferences_required":
      return "Who you'd like to meet hasn't saved yet. Tap Edit on it and save once more.";
    case "admission_underage":
      return "You need to be 18 to join Aynera.";
    case "admission_already_approved":
      return "You're already in. Close this and open Aynera again.";
    case "admission_account_unavailable":
      return "This account can't be sent for review. Please contact support.";
    case "network_error":
    case "request_timeout":
      return "We couldn't reach Aynera. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

export function PremiereScreen({ navigation }: Props) {
  const scrollRef = useResetScrollOnFocus();
  const draft = getProfileDraft();
  const person = useMemo(() => draftToPerson(draft), [draft]);
  const read = useMemo(() => readProfile(draft), [draft]);
  const coverUri = person?.heroPhotos[0]?.uri;

  const [opening, setOpening] = useState(true);
  /** The submission is in flight. */
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const cover = useRef(new Animated.Value(1)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  const playOpening = useCallback(() => {
    setOpening(true);
    cover.setValue(1);
    sweep.setValue(0);
    Animated.sequence([
      Animated.timing(sweep, {
        toValue: 1,
        duration: OPENING_MS,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(cover, {
        toValue: 0,
        duration: 620,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setOpening(false);
    });
  }, [cover, sweep]);

  useEffect(() => {
    playOpening();
  }, [playOpening]);

  /**
   * Hands the finished registration to a human: `Draft` → `Submitted`. Until this call the
   * member was never in anyone's review queue, however complete their profile looked.
   */
  const send = async () => {
    if (!isFoundingCity(draft.city)) {
      updateProfileDraft({ submitted: true });
      navigation.replace("Waitlist", { city: draft.city || "your city" });
      return;
    }
    setSending(true);
    setSendError(null);
    try {
      const admission = await submitAdmission();
      updateProfileDraft({ submitted: true });
      navigation.replace("PendingReview", { state: admission.state });
    } catch (error) {
      // Already with a reviewer — a double tap, or a retry after a lost response. Not a failure.
      if (error instanceof ApiError && error.code === "admission_already_submitted") {
        updateProfileDraft({ submitted: true });
        navigation.replace("PendingReview", { state: "Submitted" });
        return;
      }
      setSendError(sendErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const goEdit = (target: EditTarget) =>
    navigation.replace("ProfileSetup", { startAt: target });

  return (
    <View style={styles.root}>
      <StatusBar style={opening ? "light" : "dark"} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {person ? (
          <>
            <ProfileStory person={person} mode="self" onEdit={goEdit} />

            <View style={styles.readCard}>
              <Text style={styles.readKicker}>How Aynera reads you</Text>
              {read.lines.map((line) => (
                <View key={line.kicker} style={styles.readLine}>
                  <Text style={styles.readLabel}>{line.kicker}</Text>
                  <Text style={styles.readBody}>{line.body}</Text>
                </View>
              ))}

              {read.gaps.length ? (
                <View style={styles.gapBlock}>
                  <Text style={styles.gapTitle}>Still missing</Text>
                  <View style={styles.gapRow}>
                    {read.gaps.map((gap) => (
                      <Pressable
                        key={gap.label}
                        onPress={() => goEdit(gap.target)}
                        style={styles.gapChip}
                      >
                        <Text style={styles.gapChipText}>{gap.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Pressable onPress={playOpening} style={styles.replay}>
                <Text style={styles.replayText}>
                  Replay the first three seconds
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing to preview yet</Text>
            <Text style={styles.emptyBody}>
              Add your name, city, and a first photo and this becomes a real
              introduction.
            </Text>
          </View>
        )}
      </ScrollView>

      <SafeAreaView style={styles.topBar} edges={["top"]} pointerEvents="box-none">
        <View style={styles.topRow}>
          {navigation.canGoBack() ? (
            <Pressable onPress={() => navigation.goBack()} style={styles.chip}>
              <Text style={styles.chipText}>Back</Text>
            </Pressable>
          ) : (
            <View />
          )}
          <View style={styles.chip}>
            <Text style={styles.chipText}>Preview</Text>
          </View>
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.footer} edges={["bottom"]}>
        <Button
          label={draft.submitted ? "Looks like me" : "Send for a human read"}
          loading={sending}
          onPress={() => {
            if (draft.submitted) {
              if (navigation.canGoBack()) navigation.dispatch(StackActions.popToTop());
              else navigation.replace("Main");
              return;
            }
            void send();
          }}
        />
        {sendError ? (
          <AppText variant="meta" tone="rose" center style={styles.sendError}>
            {sendError}
          </AppText>
        ) : null}
      </SafeAreaView>

      {opening ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.cover, { opacity: cover }]}
        >
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} />
          ) : (
            <LinearGradient
              colors={[colors.brandPrimaryPressed, colors.brandPrimary, colors.accentPrimaryPressed]}
              style={StyleSheet.absoluteFill}
            />
          )}
          <LinearGradient
            colors={[colors.scrim55, colors.scrim20, colors.scrim90]}
            style={StyleSheet.absoluteFill}
          />
          <SafeAreaView style={styles.coverInner}>
            <Text style={styles.coverKicker}>The first three seconds</Text>
            <View style={styles.coverBottom}>
              <Text style={styles.coverName}>
                {person
                  ? person.age > 0
                    ? `${person.name}, ${person.age}`
                    : person.name
                  : "You"}
              </Text>
              {person?.work || person?.city ? (
                <Text style={styles.coverMeta}>
                  {[person?.work, person?.city].filter(Boolean).join(" · ")}
                </Text>
              ) : null}
              {person?.signature ? (
                <Text style={styles.coverLine}>“{person.signature}”</Text>
              ) : null}
              <View style={styles.track}>
                <Animated.View
                  style={[
                    styles.trackFill,
                    {
                      width: sweep.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text style={styles.coverHint}>
                This is all most people see before they decide.
              </Text>
            </View>
          </SafeAreaView>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  scroll: { paddingBottom: 120 },

  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.scrim42,
    borderWidth: 1,
    borderColor: colors.onDark32,
  },
  chipText: {
    color: colors.textOnPrimary,
    fontSize: typography.size.xs,
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  readCard: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.brandSoft,
    gap: spacing.lg,
  },
  readKicker: {
    color: colors.accentPrimaryPressed,
    fontSize: typography.size.sm,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  readLine: { gap: 4 },
  readLabel: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  readBody: {
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.lg,
    lineHeight: 26,
    color: colors.brandPrimary,
  },
  gapBlock: { gap: spacing.sm },
  gapTitle: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  gapRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  gapChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.accentLine,
  },
  gapChipText: {
    color: colors.accentPrimaryPressed,
    fontWeight: "700",
    fontSize: typography.size.base,
  },
  replay: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
  },
  replayText: {
    color: colors.brandPrimary,
    fontWeight: "700",
    fontSize: typography.size.base,
    textDecorationLine: "underline",
  },

  empty: { padding: spacing.xl, paddingTop: 120, gap: spacing.md },
  emptyTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
  },
  emptyBody: {
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: typography.size.base,
  },

  sendError: { marginTop: spacing.sm },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surfaceGlass,
    borderTopWidth: 1,
    borderTopColor: colors.borderPrimary,
  },

  cover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.brandPrimaryPressed,
  },
  coverInner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  coverKicker: {
    color: colors.accentPrimary,
    fontSize: typography.size.sm,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  coverBottom: { gap: spacing.sm },
  coverName: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xxxl,
    color: colors.textOnPrimary,
  },
  coverMeta: {
    fontFamily: fonts.bodyMedium,
    color: colors.onDark82,
    fontSize: typography.size.base,
  },
  coverLine: {
    fontFamily: fonts.displayRegular,
    fontSize: typography.size.xl,
    lineHeight: 28,
    color: colors.textOnPrimary,
  },
  track: {
    marginTop: spacing.base,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.onDark24,
    overflow: "hidden",
  },
  trackFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accentPrimary,
  },
  coverHint: {
    color: colors.onDark70,
    fontSize: typography.size.base,
  },
});
