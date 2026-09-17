import { type ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme";

export type Tone = "paper" | "rose" | "dusk" | "plum";

type Props = {
  tone?: Tone;
  children?: ReactNode;
  style?: ViewStyle;
};

/**
 * The one place the Aynera atmosphere is defined — gradient plus two drifting
 * orbs. Every screen that had its own copy of this now shares these values, so
 * the background stops shifting as you move through the app.
 */
const GRADIENTS: Record<Tone, readonly [string, string, ...string[]]> = {
  paper: [colors.surfacePrimary, colors.surfaceSecondary, colors.backgroundPrimary],
  rose: [colors.surfaceSecondary, colors.decorPeach, colors.decorMauve],
  dusk: [colors.brandPrimaryPressed, colors.brandPrimary, colors.brandPrimaryPressed],
  plum: [colors.brandPrimary, colors.brandPrimaryPressed, colors.brandPrimary],
};

export function Atmosphere({ tone = "paper", children, style }: Props) {
  const dark = tone === "dusk" || tone === "plum";

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[...GRADIENTS[tone]]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {dark ? (
        <>
          <View style={[styles.orb, styles.orbGlow]} />
          <View style={[styles.orb, styles.orbHaze]} />
        </>
      ) : (
        <>
          <View style={[styles.orb, styles.orbRose]} />
          <View style={[styles.orb, styles.orbPlum]} />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: colors.backgroundPrimary,
  },
  orb: {
    position: "absolute",
    borderRadius: 9999,
  },
  orbRose: {
    width: 280,
    height: 280,
    top: -80,
    right: -90,
    backgroundColor: colors.decorPeach,
  },
  orbPlum: {
    width: 220,
    height: 220,
    bottom: 120,
    left: -100,
    backgroundColor: colors.decorMauve,
  },
  orbGlow: {
    width: 300,
    height: 300,
    top: 80,
    left: "15%",
    backgroundColor: colors.accentGlow,
  },
  orbHaze: {
    width: 240,
    height: 240,
    bottom: -50,
    right: -70,
    backgroundColor: colors.onDark08,
  },
});
