import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

/** Which unit the member is working in. Height is always stored in centimetres. */
type Unit = "ft" | "cm";

const HOLD_DELAY_MS = 300;

/** A centimetre step covers far more ground than an inch step, so it repeats faster. */
const REPEAT_MS: Record<Unit, number> = { ft: 110, cm: 55 };

const CM_PER_INCH = 2.54;

/**
 * Rounds the same way `formatHeight` does, so the feet-and-inches shown and the value
 * stepped can never disagree — a centimetre step is finer than that readout can show
 * (167 cm and 168 cm both read 5' 6"), which is why stepping follows the chosen unit.
 */
const toInches = (cm: number) => Math.round(cm / CM_PER_INCH);
const toCm = (inches: number) => Math.round(inches * CM_PER_INCH);

const clamp = (cm: number) => Math.min(HEIGHT_MAX_CM, Math.max(HEIGHT_MIN_CM, cm));

/** Steps in whole centimetres or whole inches. Tap to nudge, hold to run. */
export function HeightPicker({ cm, onChange }: Props) {
  const [unit, setUnit] = useState<Unit>("ft");

  // A held button reads the latest values through refs, so the timers below can be set up
  // once per press instead of being torn down by every re-render the change causes.
  const cmRef = useRef(cm);
  cmRef.current = cm;
  const unitRef = useRef(unit);
  unitRef.current = unit;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Moves one step of the current unit, so every press changes the primary readout.
   * Returns false at either end of the range, so a hold can stop itself. In feet mode a
   * value that is off the inch grid snaps onto it on the first press.
   */
  const bump = useCallback((direction: number) => {
    const current = cmRef.current;
    const next =
      unitRef.current === "cm"
        ? clamp(current + direction)
        : clamp(toCm(toInches(current) + direction));
    if (next === current) return false;
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
    (direction: number) => {
      stop();
      if (bump(direction)) selectTap();
      delayTimer.current = setTimeout(() => {
        // No haptic per repeat — a continuous buzz while holding is not feedback.
        repeatTimer.current = setInterval(() => {
          if (!bump(direction)) stop();
        }, REPEAT_MS[unitRef.current]);
      }, HOLD_DELAY_MS);
    },
    [bump, stop],
  );

  useEffect(() => stop, [stop]);

  const feet = formatHeight(cm);
  const centimetres = `${cm} cm`;

  return (
    <View style={styles.outer}>
      <View style={styles.units}>
        {(["ft", "cm"] as const).map((option) => {
          const active = unit === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option === "ft" ? "Feet and inches" : "Centimetres"}
              hitSlop={6}
              onPress={() => {
                if (active) return;
                // Leaving feet mode keeps the value as-is; entering it snaps to the inch
                // grid so the first press afterwards moves the readout.
                if (option === "ft") onChange(clamp(toCm(toInches(cm))));
                setUnit(option);
                selectTap();
              }}
              style={[styles.unit, active && styles.unitActive]}
            >
              <Text style={[styles.unitLabel, active && styles.unitLabelActive]}>
                {option === "ft" ? "ft / in" : "cm"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.wrap}>
        <Round
          label="−"
          accessibilityLabel="Shorter"
          onStart={() => start(-1)}
          onStop={stop}
        />
        <View style={styles.readout}>
          <AppText style={styles.primary}>{unit === "ft" ? feet : centimetres}</AppText>
          <Text style={styles.secondary}>{unit === "ft" ? centimetres : feet}</Text>
        </View>
        <Round
          label="+"
          accessibilityLabel="Taller"
          onStart={() => start(1)}
          onStop={stop}
        />
      </View>
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
      // The first step fires on press-in, so a plain tap still moves exactly one step.
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
  outer: { gap: spacing.base, alignItems: "center" },
  units: {
    flexDirection: "row",
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: colors.surfacePrimary,
    padding: 2,
  },
  unit: {
    paddingVertical: 6,
    paddingHorizontal: spacing.base,
    borderRadius: radius.full,
    minWidth: 62,
    alignItems: "center",
  },
  unitActive: { backgroundColor: colors.brandPrimary },
  unitLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  unitLabelActive: { color: colors.textOnPrimary },
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
  },
  readout: {
    minWidth: 140,
    alignItems: "center",
    gap: spacing.sm,
  },
  primary: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.display,
    color: colors.textPrimary,
  },
  secondary: {
    fontFamily: fonts.body,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
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
