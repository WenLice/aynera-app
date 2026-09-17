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

/** Steps in whole centimetres, shown in feet and inches. */
export function HeightPicker({ cm, onChange }: Props) {
  const step = (delta: number) => {
    const next = Math.min(HEIGHT_MAX_CM, Math.max(HEIGHT_MIN_CM, cm + delta));
    if (next === cm) return;
    selectTap();
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <Round label="−" accessibilityLabel="Shorter" onPress={() => step(-1)} />
      <View style={styles.readout}>
        <AppText style={styles.feet}>{formatHeight(cm)}</AppText>
      </View>
      <Round label="+" accessibilityLabel="Taller" onPress={() => step(1)} />
    </View>
  );
}

function Round({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      onPress={onPress}
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
