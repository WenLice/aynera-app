import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSyncExternalStore } from "react";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { KhatIcon } from "../components/TabIcons";
import { SafetySheet } from "../components/SafetySheet";
import { HeaderMenuButton } from "../components/AppHeader";
import { MOCK_PEOPLE } from "../data/mockPeople";
import {
  addReply,
  getThread,
  getThreads,
  markThreadRead,
  subscribeThreads,
  type ThreadMessage,
} from "../state/threads";
import { getMeetPlan, getPostMeetFeedback } from "../state/meetPlans";
import {
  calm,
  colors,
  elevation,
  fonts,
  motion,
  radius,
  spacing,
  typography,
} from "../theme";
import { softPulse } from "../utils/feedback";
import { useReduceMotion } from "../utils/useReduceMotion";
import { letterWhen } from "../utils/when";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Thread">;

const MIN = 12;

export function ThreadScreen({ navigation, route }: Props) {
  const { threadId } = route.params;
  useSyncExternalStore(subscribeThreads, getThreads);
  const thread = getThread(threadId);
  const reduced = useReduceMotion();
  const [text, setText] = useState("");
  const [safetyOpen, setSafetyOpen] = useState(false);
  const pin = useRef(new Animated.Value(0)).current;
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(pin, {
      toValue: 1,
      duration: calm(motion.duration.slow, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [pin, reduced]);

  // Opening a letter is reading it.
  useEffect(() => {
    markThreadRead(threadId);
  }, [threadId, thread?.messages.length]);

  /** The photo or answer this correspondence grew out of. */
  const moment = useMemo(() => {
    if (!thread) return null;
    const person = MOCK_PEOPLE.find((p) => p.id === thread.personId);
    if (!person) return null;

    const hero = person.heroPhotos.find((h) => h.id === thread.moment.blockId);
    if (hero?.uri) return { uri: hero.uri };

    const beat = person.beats.find((b) => b.id === thread.moment.blockId);
    if (beat && beat.kind === "photo" && beat.uri) return { uri: beat.uri };
    if (beat && beat.kind === "video" && beat.posterUri) {
      return { uri: beat.posterUri };
    }
    return null;
  }, [thread]);

  const toEnd = useCallback(() => {
    requestAnimationFrame(() => scroller.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(toEnd, [thread?.messages.length, toEnd]);

  if (!thread) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={styles.safe}>
          <AppText variant="title" style={styles.missing}>
            This chapter has closed.
          </AppText>
          <View style={styles.missingAction}>
            <Button label="Back to your letters" onPress={() => navigation.goBack()} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const length = text.trim().length;
  const short = length < MIN;

  const send = () => {
    if (short) return;
    softPulse();
    addReply(threadId, text.trim(), "me");
    setText("");
    toEnd();
  };

  const kindLabel =
    thread.kind === "khat"
      ? "Opened with a KHAT"
      : thread.kind === "mutual"
        ? "A shared chapter"
        : "Started from this moment";

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.top}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.circle, pressed && styles.pressed]}
          >
            <AppText variant="label" tone="plum">
              ‹
            </AppText>
          </Pressable>
          <View style={styles.identity}>
            <AppText variant="section" tone="ink" numberOfLines={1}>
              {thread.personName}
            </AppText>
            <AppText variant="micro" tone="muted">
              {thread.originLabel ?? kindLabel}
            </AppText>
          </View>
          <HeaderMenuButton onPress={() => setSafetyOpen(true)} />
        </View>

        {thread.kind === "mutual" ? (
          <Pressable
            onPress={() => navigation.navigate("PlanMeet", { threadId: thread.id })}
            style={styles.planBtn}
          >
            <AppText variant="label" tone="plum">
              Plan a first meet
            </AppText>
          </Pressable>
        ) : null}
        {getMeetPlan(thread.id) && !getPostMeetFeedback(thread.id) ? (
          <Pressable
            onPress={() =>
              navigation.navigate("PostMeetFeedback", { threadId: thread.id })
            }
            style={styles.planBtn}
          >
            <AppText variant="label" tone="plum">
              How did it go?
            </AppText>
          </Pressable>
        ) : null}

        <Animated.View
          style={[
            styles.pin,
            thread.kind === "khat" && styles.pinKhat,
            {
              opacity: pin,
              transform: [
                {
                  translateY: pin.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Showing the moment beats naming it — you can see what you replied to. */}
          {moment ? (
            <Image source={{ uri: moment.uri }} style={styles.pinThumb} />
          ) : (
            <View style={[styles.pinThumb, styles.pinThumbEmpty]}>
              <KhatIcon size={24} />
            </View>
          )}
          <View style={styles.pinCopy}>
            <AppText variant="kicker" tone="rose">
              {thread.kind === "khat" ? "KHAT" : "The moment"}
            </AppText>
            <AppText variant="body" tone="soft" numberOfLines={2}>
              {thread.moment.title}
            </AppText>
          </View>
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            ref={scroller}
            contentContainerStyle={styles.messages}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {thread.messages.map((m) => (
              <Letter key={m.id} message={m} personName={thread.personName} />
            ))}

            {thread.messages.length === 1 && thread.messages[0].from === "me" ? (
              <AppText variant="meta" tone="muted" center style={styles.waiting}>
                Sent. There's nothing to do now but let them read it.
              </AppText>
            ) : null}
          </ScrollView>

          {thread.kind === "mutual" ? (
          <View style={styles.composer}>
            <Field
              value={text}
              onChangeText={setText}
              placeholder="Write the next note…"
              multiline
              maxFontSizeMultiplier={1.4}
            />
            <View style={styles.composerFoot}>
              <AppText variant="micro" tone={short ? "muted" : "rose"}>
                {short
                  ? length === 0
                    ? "A letter, not a ping"
                    : `${MIN - length} more characters`
                  : "Ready to send"}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send letter"
                accessibilityState={{ disabled: short }}
                style={({ pressed }) => [
                  styles.send,
                  short && styles.sendOff,
                  pressed && !short && styles.pressed,
                ]}
                disabled={short}
                onPress={send}
              >
                <AppText variant="label" tone="inverse">
                  Send
                </AppText>
              </Pressable>
            </View>
          </View>
          ) : (
            <View style={styles.composer}>
              <AppText variant="meta" tone="muted" center>
                Waiting for them to respond .. a full conversation opens only when it's mutual
              </AppText>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SafetySheet
        visible={safetyOpen}
        personName={thread.personName}
        onClose={() => setSafetyOpen(false)}
        onReport={() => {}}
        onBlock={() => {
          setSafetyOpen(false);
          navigation.goBack();
        }}
      />
    </View>
  );
}

function Letter({
  message,
  personName,
}: {
  message: ThreadMessage;
  personName: string;
}) {
  if (message.from === "system") {
    return (
      <View style={styles.systemNote}>
        <AppText variant="letter" tone="plum" center>
          {message.text}
        </AppText>
      </View>
    );
  }

  const mine = message.from === "me";

  return (
    <View style={[styles.letter, mine ? styles.mine : styles.theirs]}>
      <View style={styles.letterHead}>
        <AppText variant="kicker" tone={mine ? "rose" : "plum"}>
          {mine ? "You wrote" : `${personName} wrote`}
        </AppText>
        <AppText variant="micro" style={styles.stamp}>
          {letterWhen(message.at)}
        </AppText>
      </View>
      <AppText variant="letter" tone="ink">
        {message.text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.threadsBackground },
  safe: { flex: 1 },
  flex: { flex: 1 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  identity: { flex: 1 },
  pin: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
  },
  pinKhat: {
    backgroundColor: colors.brandPrimaryPressed,
  },
  pinThumb: {
    width: 52,
    height: 62,
    borderRadius: radius.md,
    backgroundColor: colors.borderStrong,
  },
  pinThumbEmpty: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandPrimary,
  },
  pinCopy: { flex: 1, gap: 2 },
  messages: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
    paddingTop: spacing.xs,
    gap: spacing.base,
  },
  letter: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    ...elevation.sm,
  },
  letterHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  mine: {
    borderLeftWidth: 3,
    borderLeftColor: colors.brandPrimary,
    marginLeft: spacing.lg,
  },
  theirs: {
    borderLeftWidth: 3,
    borderLeftColor: colors.accentPrimaryPressed,
    marginRight: spacing.lg,
    backgroundColor: colors.bubbleReceived,
  },
  systemNote: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brandSoft,
  },
  waiting: { marginTop: spacing.sm },
  composer: {
    padding: spacing.base,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderPrimary,
    backgroundColor: colors.surfacePrimary,
  },
  composerFoot: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  send: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    minHeight: 44,
    justifyContent: "center",
  },
  sendOff: { opacity: 0.4 },
  stamp: { color: colors.messageMeta },
  missing: { margin: spacing.xl },
  missingAction: { paddingHorizontal: spacing.xl },
  planBtn: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
