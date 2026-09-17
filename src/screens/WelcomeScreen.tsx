import { useCallback, useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { launchCitiesLine, useLaunchCities } from "../data/cities";
import { WELCOME_HERO } from "../data/vibeMoments";
import {
  brand,
  calm,
  colors,
  fonts,
  leading,
  motion,
  spacing,
  typography,
} from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

/** Landing — photo first, then a calm invitation. */
export function WelcomeScreen({ navigation }: Props) {
  const reduced = useReduceMotion();
  const rise = useRef(new Animated.Value(0)).current;
  const cities = useLaunchCities();

  useEffect(() => {
    Animated.timing(rise, {
      toValue: 1,
      duration: calm(motion.duration.slow, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [rise, reduced]);

  const lift = useCallback(
    (distance: number) => ({
      opacity: rise,
      transform: [
        {
          translateY: rise.interpolate({
            inputRange: [0, 1],
            outputRange: [distance, 0],
          }),
        },
      ],
    }),
    [rise],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={{ uri: WELCOME_HERO }} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={[
          colors.scrim42,
          colors.scrim12,
          colors.onDark70,
          colors.backgroundPrimary,
        ]}
        locations={[0, 0.38, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.hero, lift(16)]}>
          <Text
            maxFontSizeMultiplier={1.15}
            style={styles.brand}
            accessibilityRole="header"
          >
            {brand.name}
          </Text>
          <Text style={styles.tagline}>{brand.tagline}</Text>
        </Animated.View>

        <Animated.View style={[styles.actions, lift(22)]}>
          <AppText variant="letter" tone="ink" center style={styles.promise}>
            A better way to meet beyond your usual circle
          </AppText>
          <Button
            label="Join the founding circle"
            onPress={() => navigation.navigate("ProfileSetup")}
          />
          <Button
            label="I already applied"
            variant="ghost"
            onPress={() => navigation.navigate("Login")}
          />
          <AppText variant="meta" tone="muted" center>
            {launchCitiesLine(cities)}
          </AppText>
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
    paddingTop: spacing.huge,
    alignItems: "center",
    gap: spacing.sm,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: typography.size.display,
    lineHeight: leading.display,
    color: colors.textOnPrimary,
    letterSpacing: 0.6,
    textShadowColor: colors.scrim20,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  tagline: {
    fontFamily: fonts.displayRegular,
    fontSize: typography.size.lg,
    lineHeight: leading.lg,
    color: colors.onDark92,
    textAlign: "center",
  },
  promise: {
    marginBottom: spacing.xs,
    maxWidth: 300,
    alignSelf: "center",
  },
  actions: {
    gap: spacing.md,
  },
});
