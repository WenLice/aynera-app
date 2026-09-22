import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppHeader, HeaderMenuButton } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { KhatSheet } from "../components/KhatSheet";
import { MeetActionBar } from "../components/MeetActionBar";
import { MeetGuide } from "../components/MeetGuide";
import {
  ProfileStory,
  type MomentTarget,
} from "../components/ProfileStory";
import { RejectShatterMark } from "../components/RejectShatterMark";
import { RespondSheet } from "../components/RespondSheet";
import { SafetySheet } from "../components/SafetySheet";
import { Sheet } from "../components/Sheet";
import { VibeGatheringCard } from "../components/VibeGatheringCard";
import { isFoundingCity } from "../data/cities";
import type { PersonProfile } from "../data/mockPeople";
import type { RootStackParamList } from "../navigation/types";
import { track } from "../state/analytics";
import {
  getPassedIds,
  passIntroduction,
  remainingIntroductions,
  subscribeCircle,
  weeklyIntroductions,
} from "../state/circle";
import { canOpenNewConversation } from "../state/conversationLimit";
import {
  getGatherings,
  isInterested,
  subscribeGatherings,
} from "../state/gatherings";
import {
  getKhatRemaining,
  sendKhat,
  subscribeKhat,
} from "../state/khat";
import { sendLike } from "../state/likes";
import {
  hasSeenMeetGuide,
  markMeetGuideSeen,
  subscribeMeetGuide,
} from "../state/meetGuide";
import { hasOpening, recordOpening, subscribeOpenings } from "../state/openings";
import { getProfileDraft, subscribeProfileDraft } from "../state/profileDraft";
import { colors, fonts, radius, spacing, typography } from "../theme";
import { softPulse, warmPulse } from "../utils/feedback";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

type Phase = "letter" | "reading" | "shatter" | "khatSent";
type ViewMode = "home" | "intro";

const SHATTER_STAGE = [
  colors.divider,
  colors.borderPrimary,
  colors.borderStrong,
] as const;

export function MeetScreen() {
  const homeScrollRef = useResetScrollOnFocus();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [view, setView] = useState<ViewMode>("home");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("letter");
  const [moment, setMoment] = useState<MomentTarget | null>(null);
  const [khatOpen, setKhatOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [scrollUnlocked, setScrollUnlocked] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [logoKey, setLogoKey] = useState(0);

  useSyncExternalStore(subscribeCircle, getPassedIds);
  useSyncExternalStore(subscribeOpenings, getOpeningSnapshot);
  useSyncExternalStore(subscribeGatherings, getGatheringSnapshot);
  const khatRemaining = useSyncExternalStore(subscribeKhat, getKhatRemaining);
  const guideSeen = useSyncExternalStore(subscribeMeetGuide, hasSeenMeetGuide);
  const myDraft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft);
  const myVibe = myDraft.chips;
  const founding = isFoundingCity(myDraft.city);

  const letter = useRef(new Animated.Value(0)).current;
  const story = useRef(new Animated.Value(0)).current;
  const aside = useRef(new Animated.Value(0)).current;
  const shatterScale = useRef(new Animated.Value(1)).current;
  const rejectingIdRef = useRef<string | null>(null);

  const week = weeklyIntroductions();
  const remaining = remainingIntroductions();
  const gatherings = getGatherings();
  const weekendSurprises = gatherings.filter((g) => g.kind === "weekend_surprise");
  const squads = gatherings.filter((g) => g.kind === "squad");
  const person = week.find((p) => p.id === activeId) ?? remaining[0];

  useEffect(() => {
    track("meet_home_viewed");
  }, []);

  useEffect(() => {
    if (!guideSeen && view === "intro") setGuideOpen(true);
  }, [guideSeen, view]);

  useEffect(() => {
    if (view !== "intro" || !person) return;
    if (rejectingIdRef.current) return;

    setPhase("reading");
    setScrollUnlocked(false);
    letter.setValue(0);
    story.setValue(1);
    shatterScale.setValue(1);
    softPulse();
  }, [person?.id, view, letter, story, shatterScale]);

  const openIntro = (profile: PersonProfile) => {
    track("introduction_opened", { id: profile.id });
    setActiveId(profile.id);
    setView("intro");
  };

  const backHome = () => {
    setView("home");
    setActiveId(null);
    setPhase("reading");
  };

  const advanceFeed = () => {
    const next = remainingIntroductions()[0];
    if (next) {
      setActiveId(next.id);
      setView("intro");
      setPhase("reading");
      setScrollUnlocked(false);
      story.setValue(1);
      shatterScale.setValue(1);
    } else {
      backHome();
    }
  };

  const reject = () => {
    if (!person || !scrollUnlocked) return;
    softPulse();
    rejectingIdRef.current = person.id;
    setLogoKey((k) => k + 1);
    setPhase("shatter");
    shatterScale.setValue(1);
    Animated.parallel([
      Animated.timing(story, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(shatterScale, {
        toValue: 0.94,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const onShatterComplete = useCallback(() => {
    const id = rejectingIdRef.current;
    rejectingIdRef.current = null;
    if (id) {
      track("introduction_passed", { id });
      passIntroduction(id);
    }
    advanceFeed();
  }, []);

  const originFromMoment = (m: MomentTarget | null) =>
    m ? `Started from .. ${m.title}` : "Started from .. their introduction";

  const sendResponse = (message: string) => {
    if (!person || !moment) return;
    if (!canOpenNewConversation()) {
      setMoment(null);
      setLimitOpen(true);
      return;
    }
    if (hasOpening(person.id)) return;
    softPulse();
    recordOpening({
      personId: person.id,
      kind: "response",
      message,
      moment,
    });
    sendLike({
      personId: person.id,
      personName: person.realName ?? person.name,
      originLabel: originFromMoment(moment),
    });
    track("introduction_response_sent", { id: person.id });
    setMoment(null);
    passIntroduction(person.id);
    advanceFeed();
  };

  const confirmKhat = (note: string) => {
    if (!person || !moment) return;
    if (hasOpening(person.id)) return;
    if (!canOpenNewConversation()) {
      setKhatOpen(false);
      setLimitOpen(true);
      return;
    }
    const sent = sendKhat({
      personId: person.id,
      personName: person.realName ?? person.name,
      note,
      momentTitle: moment.title,
    });
    if (!sent) return;
    recordOpening({
      personId: person.id,
      kind: "khat",
      message: note,
      moment,
    });
    warmPulse();
    sendLike({
      personId: person.id,
      personName: person.realName ?? person.name,
      originLabel: originFromMoment(moment),
    });
    track("khat_sent", { id: person.id });
    setKhatOpen(false);
    setPhase("khatSent");
    aside.setValue(0);
    Animated.timing(aside, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        passIntroduction(person.id);
        aside.setValue(0);
        advanceFeed();
      }, 1100);
    });
  };

  const removeFromQueueQuietly = () => {
    if (!person) return;
    passIntroduction(person.id);
    advanceFeed();
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const nearEnd =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 120;
    if (nearEnd && !scrollUnlocked) setScrollUnlocked(true);
  };

  if (view === "home") {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.emptySafe} edges={["top"]}>
          <AppHeader meta="Meet" />
          <ScrollView ref={homeScrollRef} contentContainerStyle={styles.homeScroll}>
            <AppText variant="kicker" tone="rose">
              Meet
            </AppText>
            <AppText variant="title">Experiences in Bangalore</AppText>
            <AppText variant="body" tone="soft">
              Weekend Surprise and Squads live here. People live in Duos.
            </AppText>

            {!founding && myDraft.city ? (
              <View style={styles.waitBanner}>
                <AppText variant="kicker" tone="rose">
                  {myDraft.city || "Your city"}
                </AppText>
                <AppText variant="body" tone="soft">
                  Next-city interest .. Bangalore is open first. Look through the
                  founding circle in the meantime
                </AppText>
              </View>
            ) : null}

            <View style={styles.sectionGap}>
              <AppText variant="label" tone="plum">
                Duos
              </AppText>
              <Pressable
                onPress={() => remaining[0] && openIntro(remaining[0])}
                disabled={!remaining.length}
                style={({ pressed }) => [
                  styles.introCard,
                  pressed && remaining.length ? styles.pressed : null,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Open Duos"
              >
                <Text style={styles.cardKicker}>The feed</Text>
                <AppText variant="section">
                  {remaining.length ? "Open Duos" : "You've seen everyone for now"}
                </AppText>
                <AppText variant="body" tone="soft">
                  Full introductions, one person at a time
                </AppText>
                {remaining.length ? (
                  <Text style={styles.openCta}>Enter the feed</Text>
                ) : (
                  <Text style={styles.sent}>Come back when new people arrive</Text>
                )}
              </Pressable>
            </View>

            {weekendSurprises.length ? (
              <View style={styles.sectionGap}>
                <AppText variant="label" tone="plum">
                  Weekend Surprise
                </AppText>
                {weekendSurprises.map((g) => (
                  <VibeGatheringCard
                    key={g.id}
                    gathering={g}
                    interested={isInterested(g.id)}
                    onPress={() =>
                      navigation.navigate("GatheringDetail", { gatheringId: g.id })
                    }
                  />
                ))}
              </View>
            ) : null}

            {squads.length ? (
              <View style={styles.sectionGap}>
                <AppText variant="label" tone="plum">
                  Squads
                </AppText>
                {squads.map((g) => (
                  <VibeGatheringCard
                    key={g.id}
                    gathering={g}
                    interested={isInterested(g.id)}
                    onPress={() =>
                      navigation.navigate("GatheringDetail", { gatheringId: g.id })
                    }
                  />
                ))}
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>

        <MeetGuide
          visible={guideOpen}
          onClose={() => {
            markMeetGuideSeen();
            setGuideOpen(false);
          }}
        />
      </View>
    );
  }

  const showDusk = phase === "letter" || phase === "khatSent";
  const showShatterStage = phase === "shatter";
  const responded = person ? hasOpening(person.id) : false;

  return (
    <View style={styles.root}>
      <StatusBar style={phase === "reading" || showDusk ? "light" : "dark"} />

      {showDusk && (
        <LinearGradient
          colors={[
            colors.brandPrimaryPressed,
            colors.brandPrimary,
            colors.brandPrimaryPressed,
          ]}
          style={StyleSheet.absoluteFill}
        />
      )}

      {showShatterStage && (
        <LinearGradient
          colors={[...SHATTER_STAGE]}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {phase === "letter" && person && (
        <Animated.View
          style={[
            styles.letter,
            {
              opacity: letter,
              transform: [
                {
                  translateY: letter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.letterBrand}>Aynera</Text>
          <Text style={styles.letterKicker}>A Duo</Text>
          <Text style={styles.letterTitle}>{person.name}</Text>
          <Text style={styles.letterSub}>
            {[person.work, person.area ?? person.city, `${person.age}`]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          <Text style={styles.letterReason}>
            {(person.whyReasons ?? [person.reason]).slice(0, 3).join(" .. ")}
          </Text>
        </Animated.View>
      )}

      {phase === "shatter" && (
        <View style={styles.letter}>
          <RejectShatterMark
            key={logoKey}
            size={148}
            onComplete={onShatterComplete}
          />
        </View>
      )}

      {phase === "khatSent" && person && (
        <Animated.View style={[styles.letter, { opacity: aside }]}>
          <Text style={styles.letterKicker}>KHAT sent</Text>
          <Text style={styles.letterTitle}>A rare note</Text>
          <Text style={styles.letterSub}>
            {person.name} will see this if they choose to respond.
          </Text>
        </Animated.View>
      )}

      {phase === "reading" && person && (
        <View style={styles.safe}>
          <Animated.View
            style={{
              flex: 1,
              opacity: story,
              transform: [
                {
                  translateY: story.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
                { scale: shatterScale },
              ],
            }}
          >
            <SafeAreaView
              edges={[]}
              style={styles.headerSafe}
              pointerEvents="box-none"
            >
              <AppHeader
                overlay
                markOnly
                onMarkPress={backHome}
                rightSlot={
                  <HeaderMenuButton
                    overlay
                    onPress={() => setSafetyOpen(true)}
                  />
                }
              />
            </SafeAreaView>

            <ScrollView
              key={person.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scroll}
              onScroll={onScroll}
              scrollEventThrottle={16}
            >
              <ProfileStory
                person={person}
                mode="meet"
                onRespond={
                  responded
                    ? undefined
                    : (m) => setMoment(m)
                }
                viewerVibe={myVibe}
                onReviewPress={() => setReviewOpen(true)}
              />
            </ScrollView>

            <SafeAreaView edges={["bottom"]} style={styles.actionSafe}>
              <MeetActionBar
                unlocked={scrollUnlocked}
                khatRemaining={khatRemaining}
                responseSent={responded}
                onPass={reject}
                onKhat={() => {
                  if (responded) return;
                  setKhatOpen(true);
                }}
              />
            </SafeAreaView>
          </Animated.View>
        </View>
      )}

      {person ? (
        <>
          <RespondSheet
            visible={!!moment && !khatOpen}
            personName={person.name}
            moment={moment}
            onClose={() => setMoment(null)}
            onSend={sendResponse}
          />

          <KhatSheet
            visible={khatOpen}
            personName={person.name}
            remaining={khatRemaining}
            moment={moment}
            onClose={() => setKhatOpen(false)}
            onSend={confirmKhat}
          />

          <SafetySheet
            visible={safetyOpen}
            personName={person.name}
            onClose={() => setSafetyOpen(false)}
            onReport={removeFromQueueQuietly}
            onBlock={removeFromQueueQuietly}
          />
        </>
      ) : null}

      <MeetGuide
        visible={guideOpen}
        onClose={() => {
          markMeetGuideSeen();
          setGuideOpen(false);
        }}
      />

      <Sheet visible={reviewOpen} onClose={() => setReviewOpen(false)}>
        <AppText variant="kicker" tone="rose">
          Profile reviewed
        </AppText>
        <AppText variant="title">What this means</AppText>
        <AppText variant="body" tone="soft">
          Aynera checks specific identity and profile signals before access ..
          review can increase confidence but cannot guarantee another person's
          behaviour
        </AppText>
        <Button label="Close" variant="ghost" onPress={() => setReviewOpen(false)} />
      </Sheet>

      {limitOpen ? (
        <View style={styles.limitWrap} pointerEvents="box-none">
          <Pressable style={styles.limitCard} onPress={() => setLimitOpen(false)}>
            <AppText variant="section">A few conversations deserve your attention first</AppText>
            <AppText variant="body" tone="soft">
              Finish what you started .. your circle will still be here
            </AppText>
            <Button label="Back to Threads" onPress={() => {
              setLimitOpen(false);
              navigation.navigate("Threads" as never);
            }} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function getOpeningSnapshot() {
  return remainingIntroductions()
    .map((p) => `${p.id}:${hasOpening(p.id) ? "1" : "0"}`)
    .join("|");
}

function getGatheringSnapshot() {
  return getGatherings()
    .map((g) => `${g.id}:${isInterested(g.id) ? "1" : "0"}`)
    .join("|");
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  safe: { flex: 1 },
  homeScroll: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  introCard: {
    backgroundColor: colors.duosSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  waitBanner: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  pressed: { opacity: 0.92 },
  cardKicker: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xs,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.accentPrimaryPressed,
  },
  introRow: { flexDirection: "row", gap: spacing.md, alignItems: "center" },
  avatar: {
    width: 56,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.borderPrimary,
  },
  introCopy: { flex: 1, gap: 2 },
  whyKicker: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xs,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  openCta: {
    fontFamily: fonts.bodySemi,
    color: colors.brandPrimary,
    marginTop: spacing.xs,
  },
  sent: {
    fontFamily: fonts.bodySemi,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  sectionGap: { gap: spacing.md, marginTop: spacing.md },
  focusNote: { marginTop: spacing.lg, maxWidth: 320 },
  emptyCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  letter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  letterBrand: {
    fontFamily: fonts.display,
    fontSize: typography.size.xl,
    color: colors.textOnPrimary,
    marginBottom: spacing.lg,
  },
  letterKicker: {
    color: colors.accentPrimary,
    fontSize: typography.size.sm,
    fontFamily: fonts.bodySemi,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  letterTitle: {
    fontFamily: fonts.display,
    fontSize: typography.size.display,
    color: colors.textOnPrimary,
    textAlign: "center",
  },
  letterSub: {
    color: colors.onDark70,
    fontSize: typography.size.base,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  letterReason: {
    marginTop: spacing.lg,
    textAlign: "center",
    color: colors.onDark92,
    lineHeight: 22,
    fontSize: typography.size.base,
    maxWidth: 300,
  },
  scroll: { paddingBottom: spacing.xxxl + spacing.xl },
  headerSafe: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  actionSafe: {
    backgroundColor: "transparent",
  },
  emptySafe: { flex: 1 },
  emptyBodyWrap: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    gap: spacing.md,
  },
  limitWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.scrim42,
  },
  limitCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
});
