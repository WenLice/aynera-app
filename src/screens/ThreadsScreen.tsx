import { useEffect, useState, useSyncExternalStore } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useCallback } from "react";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { BrandMark } from "../components/BrandMark";
import { KhatIcon } from "../components/TabIcons";
import type { RootStackParamList } from "../navigation/types";
import { getKhatsSent, getKhatRemaining, subscribeKhat } from "../state/khat";
import {
  getPendingMatch,
  getThreads,
  subscribeThreads,
  type Thread,
} from "../state/threads";
import { colors, elevation, radius, spacing } from "../theme";
import { track } from "../state/analytics";
import { shortWhen } from "../utils/when";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

type Tab = "letters" | "khat";

export function ThreadsScreen() {
  const scrollRef = useResetScrollOnFocus();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const threads = useSyncExternalStore(subscribeThreads, getThreads);
  useSyncExternalStore(subscribeKhat, getKhatsSent);
  const khats = getKhatsSent();
  const remaining = getKhatRemaining();
  const [tab, setTab] = useState<Tab>("letters");

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [tab]);

  const open = (route: keyof RootStackParamList, params: object) => {
    const parent = navigation.getParent();
    const target = parent ?? navigation;
    // @ts-expect-error the tab navigator's parent is the root stack
    target.navigate(route, params);
  };

  // A match that arrived while you were elsewhere gets its ceremony the moment
  // you come back to your letters, not a badge you have to decode.
  useFocusEffect(
    useCallback(() => {
      const pending = getPendingMatch();
      if (pending) open("MatchMoment", { threadId: pending.id });
    }, [navigation]),
  );

  const unreadTotal = threads.reduce((sum, t) => sum + t.unread, 0);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppHeader meta={unreadTotal > 0 ? `${unreadTotal} waiting` : undefined} />

        <View style={styles.tabs}>
          <TabPill
            label="Letters"
            count={threads.length}
            active={tab === "letters"}
            onPress={() => setTab("letters")}
          />
          <TabPill
            label="KHAT"
            count={khats.length}
            active={tab === "khat"}
            onPress={() => setTab("khat")}
          />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {tab === "letters" ? (
            <>
              <View style={styles.intro}>
                <AppText variant="kicker" tone="rose">
                  Your conversations
                </AppText>
                <AppText variant="title" tone="plum">
                  Your conversations
                </AppText>
                <AppText variant="body" tone="soft" style={styles.introBody}>
                  Not an inbox to clear. Return when you have something real to add.
                </AppText>
              </View>

              {threads.length === 0 ? (
                <Empty
                  title="No open chapters yet"
                  body="Respond to a moment, keep a mutual introduction, or send a KHAT. Your correspondence will gather here."
                />
              ) : (
                <View style={styles.letters}>
                  {threads.map((thread) => (
                    <LetterCard
                      key={thread.id}
                      thread={thread}
                      onPress={() => {
                        track("thread_opened", { id: thread.id });
                        open("Thread", { threadId: thread.id });
                      }}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <>
              <View style={styles.intro}>
                <AppText variant="kicker" tone="rose">
                  Special letters
                </AppText>
                <AppText variant="title" tone="plum">
                  KHAT archive
                </AppText>
                <AppText variant="body" tone="soft" style={styles.introBody}>
                  {remaining} left this week. They return every Monday — spend
                  them on the introductions you'd remember anyway.
                </AppText>
              </View>

              <View style={styles.pips}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <View
                    key={i}
                    style={[styles.pip, i < remaining && styles.pipFull]}
                  />
                ))}
              </View>

              {khats.length === 0 ? (
                <Empty
                  title="Nothing sent yet"
                  body="A KHAT is the one letter that can't be mistaken for a habit. Use it rarely."
                />
              ) : (
                <View style={styles.letters}>
                  {khats.map((k) => (
                    <View key={k.id} style={styles.khatCard}>
                      <View style={styles.khatTop}>
                        <View style={styles.khatSeal}>
                          <KhatIcon size={22} />
                        </View>
                        <AppText variant="kicker" tone="rose">
                          KHAT
                        </AppText>
                        <View style={styles.grow} />
                        <AppText variant="micro" tone="muted">
                          {k.at}
                        </AppText>
                      </View>
                      <AppText variant="section" tone="ink">
                        {k.personName}
                      </AppText>
                      <AppText variant="letter" tone="soft" numberOfLines={4}>
                        {k.note}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function TabPill({
  label,
  count,
  active,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={`${label}, ${count}`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="label" tone={active ? "inverse" : "plum"}>
        {label}
      </AppText>
      {count > 0 ? (
        <AppText variant="micro" tone={active ? "inverse" : "muted"}>
          {count}
        </AppText>
      ) : null}
    </Pressable>
  );
}

function LetterCard({
  thread,
  onPress,
}: {
  thread: Thread;
  onPress: () => void;
}) {
  const last = thread.messages[thread.messages.length - 1];
  const unread = thread.unread > 0;
  const kindLabel =
    thread.kind === "khat"
      ? "KHAT correspondence"
      : thread.kind === "mutual"
        ? "Mutual chapter"
        : "Moment response";

  // Re-render the timestamp roughly as often as it can change.
  const [, tick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => tick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${thread.personName}, ${kindLabel}${unread ? ", unread" : ""}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.letterCard,
        thread.kind === "khat" && styles.letterCardKhat,
        unread && styles.letterCardUnread,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.letterTop}>
        <View style={[styles.seal, thread.kind === "khat" && styles.sealKhat]}>
          {thread.kind === "khat" ? <KhatIcon size={24} /> : <BrandMark size={22} />}
        </View>
        <View style={styles.grow}>
          <AppText variant="section" tone="ink" numberOfLines={1}>
            {thread.personName}
          </AppText>
          <AppText variant="meta" tone="muted">
            {thread.originLabel ?? kindLabel}
          </AppText>
        </View>
        <View style={styles.letterMeta}>
          <AppText variant="micro" tone="muted">
            {shortWhen(thread.updatedAt)}
          </AppText>
          {unread ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>

      <View style={styles.rule} />

      <AppText variant="micro" tone="rose" numberOfLines={1}>
        {thread.moment.title}
      </AppText>
      <AppText
        variant={unread ? "letter" : "body"}
        tone={unread ? "ink" : "soft"}
        numberOfLines={2}
      >
        {last?.from === "me" ? "You: " : ""}
        {last?.text}
      </AppText>
    </Pressable>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyCard}>
      <BrandMark size={32} />
      <AppText variant="section" tone="ink">
        {title}
      </AppText>
      <AppText variant="body" tone="muted">
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.threadsBackground },
  safe: { flex: 1 },
  grow: { flex: 1 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  tabs: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  pillActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  intro: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  introBody: { maxWidth: 330 },
  pips: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  pip: {
    width: 34,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderPrimary,
  },
  pipFull: { backgroundColor: colors.accentPrimary },
  letters: { gap: spacing.md },
  letterCard: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    ...elevation.sm,
  },
  letterCardUnread: {
    borderColor: colors.accentPrimary,
    backgroundColor: colors.surfaceSecondary,
    ...elevation.md,
  },
  letterCardKhat: {
    backgroundColor: colors.brandSoft,
  },
  letterTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  letterMeta: { alignItems: "flex-end", gap: 6 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentPrimaryPressed,
  },
  seal: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  sealKhat: {
    backgroundColor: colors.brandPrimaryPressed,
    borderWidth: 1,
    borderColor: colors.accentLine,
  },
  rule: {
    height: 1,
    backgroundColor: colors.borderPrimary,
  },
  khatCard: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  khatTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  khatSeal: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandPrimaryPressed,
  },
  emptyCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.divider,
  },
});
