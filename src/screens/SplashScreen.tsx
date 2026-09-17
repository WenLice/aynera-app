import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { resolveStartRoute, type StartRoute } from "../auth/bootstrap";
import { AnimatedLogoMark } from "../components/AnimatedLogoMark";
import { AppText } from "../components/AppText";
import { Atmosphere } from "../components/Atmosphere";
import { calm, motion, spacing } from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

/** Beat 1 — logo halves meet on a light stage so both souls stay visible. */
export function SplashScreen({ navigation }: Props) {
  const moved = useRef(false);
  const reduced = useReduceMotion();
  const [showHint, setShowHint] = useState(false);
  const hint = useRef(new Animated.Value(0)).current;

  // Resolved while the logo animates: a stored session skips Welcome entirely.
  const start = useRef<Promise<StartRoute>>(resolveStartRoute());

  const goWelcome = useCallback(() => {
    if (moved.current) return;
    moved.current = true;
    void start.current.then((route) => {
      if (route.name === "Waitlist") navigation.replace("Waitlist", route.params);
      else navigation.replace(route.name);
    });
  }, [navigation]);

  // The hint only earns its place if the animation is still running — it used
  // to sit there from the first frame, competing with the logo.
  useEffect(() => {
    const t = setTimeout(() => setShowHint(true), 1600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showHint) return;
    Animated.timing(hint, {
      toValue: 1,
      duration: calm(motion.duration.calm, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [showHint, hint, reduced]);

  return (
    <Atmosphere tone="paper">
      <Pressable
        style={styles.fill}
        accessibilityRole="button"
        accessibilityLabel="Continue"
        onPress={goWelcome}
      >
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safe}>
          <View style={styles.center}>
            <AnimatedLogoMark size={168} onComplete={goWelcome} />
          </View>
          <Animated.View style={{ opacity: hint }}>
            <AppText variant="kicker" tone="muted" center>
              Tap to continue
            </AppText>
          </Animated.View>
        </SafeAreaView>
      </Pressable>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
