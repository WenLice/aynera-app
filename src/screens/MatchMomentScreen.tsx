import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { MatchBloom } from "../components/MatchBloom";
import { clearMatchPending, getThread } from "../state/threads";
import { calm, colors, motion, spacing } from "../theme";
import { matchPulse } from "../utils/feedback";
import { useReduceMotion } from "../utils/useReduceMotion";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "MatchMoment">;

/**
 * The payoff the app was missing. One screen, one ceremony, one action —
 * deliberately quieter than a confetti burst, because the promise here is
 * that a match is rare rather than loud.
 */
export function MatchMomentScreen({ navigation, route }: Props) {
  const { threadId } = route.params;
  const thread = getThread(threadId);
  const reduced = useReduceMotion();
  const [opened, setOpened] = useState(false);
  const words = useRef(new Animated.Value(0)).current;
  const actions = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    matchPulse();
    clearMatchPending(threadId);
  }, [threadId]);

  useEffect(() => {
    if (!opened) return;
    Animated.stagger(reduced ? 0 : 160, [
      Animated.timing(words, {
        toValue: 1,
        duration: calm(motion.duration.calm, reduced),
        easing: motion.easing.enter,
        useNativeDriver: true,
      }),
      Animated.timing(actions, {
        toValue: 1,
        duration: calm(motion.duration.calm, reduced),
        easing: motion.easing.enter,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opened, words, actions, reduced]);

  const name = thread?.personName ?? "them";

  const lift = (value: Animated.Value) => ({
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  });

  const leave = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.replace("Main");
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.brandPrimaryPressed, colors.brandPrimary, colors.accentPrimaryPressed]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <View style={styles.stage}>
          <MatchBloom size={140} onComplete={() => setOpened(true)} />

          <Animated.View style={[styles.words, lift(words)]}>
            <AppText variant="kicker" tone="rose" center>
              A mutual introduction
            </AppText>
            <AppText variant="display" tone="inverse" center style={styles.names}>
              You & {name}
            </AppText>
            <AppText variant="letter" tone="inverseSoft" center style={styles.body}>
              You both chose to keep this one. Nothing expires, nothing is
              queued — take your time and write something only they could
              answer.
            </AppText>
          </Animated.View>
        </View>

        <Animated.View
          style={[styles.actions, lift(actions)]}
          pointerEvents={opened ? "auto" : "none"}
        >
          <Button
            label="Write the first letter"
            onPress={() => navigation.replace("Thread", { threadId })}
          />
          <Button label="Not right now" variant="ghost" onDark onPress={leave} />
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
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  words: { gap: spacing.sm, alignItems: "center" },
  names: { marginTop: spacing.xs },
  body: { maxWidth: 320, marginTop: spacing.sm },
  actions: { gap: spacing.sm },
});
