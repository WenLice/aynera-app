import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import {
  HEIGHT_MAX_CM,
  HEIGHT_MIN_CM,
  formatHeight,
} from "../data/lifestyleOptions";
import { colors, fonts, radius, spacing, typography } from "../theme";
import { selectTap } from "../utils/feedback";

type Props = {
  cm: number;
  onChange: (cm: number) => void;
};

/** How long a button must be held before it starts repeating, and how fast it then runs. */
const HOLD_DELAY_MS = 300;
const REPEAT_MS = 110;

const CM_PER_INCH = 2.54;

/**
 * The readout is feet and inches, so the buttons step in whole inches — a centimetre step is
 * finer than the display can show, and 167 cm and 168 cm both read 5' 6", which made some
 * presses look like nothing happened. Rounds the same way `formatHeight` does, so the value
 * shown and the value stepped never disagree.
 */
const toInches = (cm: number) => Math.round(cm / CM_PER_INCH);
const toCm = (inches: number) => Math.round(inches * CM_PER_INCH);

/** Steps in whole centimetres, shown in feet and inches. Tap to nudge, hold to run. */
export function HeightPicker({ cm, onChange }: Props) {
  // A held button reads the latest value through refs, so the timers below can be set up
  // once per press instead of being torn down by every re-render the change causes.
  const cmRef = useRef(cm);
  cmRef.current = cm;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Moves by whole inches. Returns false at either end of the range, so a hold can stop
   * itself. A value that is off the inch grid snaps onto it on the first press.
   */
  const bump = useCallback((deltaInches: number) => {
    const next = Math.min(
      HEIGHT_MAX_CM,
      Math.max(HEIGHT_MIN_CM, toCm(toInches(cmRef.current) + deltaInches)),
    );
    if (next === cmRef.current) return false;
    onChangeRef.current(next);
    return true;
  }, []);

  const stop = useCallback(() => {
    if (delayTimer.current) clearTimeout(delayTimer.current);
    if (repeatTimer.current) clearInterval(repeatTimer.current);
    delayTimer.current = null;
    repeatTimer.current = null;
  }, []);

  const start = useCallback(
    (delta: number) => {
      stop();
      if (bump(delta)) selectTap();
      delayTimer.current = setTimeout(() => {
        // No haptic per repeat — a continuous buzz while holding is not feedback.
        repeatTimer.current = setInterval(() => {
          if (!bump(delta)) stop();
        }, REPEAT_MS);
      }, HOLD_DELAY_MS);
    },
    [bump, stop],
  );

  useEffect(() => stop, [stop]);

  return (
    <View style={styles.wrap}>
      <Round
        label="−"
        accessibilityLabel="Shorter"
        onStart={() => start(-1)}
        onStop={stop}
      />
      <View style={styles.readout}>
        <AppText style={styles.feet}>{formatHeight(cm)}</AppText>
      </View>
      <Round
        label="+"
        accessibilityLabel="Taller"
        onStart={() => start(1)}
        onStop={stop}
      />
    </View>
  );
}

function Round({
  label,
  accessibilityLabel,
  onStart,
  onStop,
}: {
  label: string;
  accessibilityLabel: string;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      // The first step fires on press-in, so a plain tap still moves exactly one centimetre.
      onPressIn={onStart}
      onPressOut={onStop}
      // On web a pointer that leaves the button never sends press-out.
      onHoverOut={onStop}
      style={({ pressed }) => [styles.round, pressed && styles.pressed]}
    >
      <AppText style={styles.roundLabel}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  readout: {
    minWidth: 140,
    alignItems: "center",
    gap: 2,
  },
  feet: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.display,
    color: colors.textPrimary,
  },
  round: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  roundLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xl,
    color: colors.brandPrimary,
  },
});
