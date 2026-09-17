import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, elevation, radius, spacing } from "../theme";
import { selectTap } from "../utils/feedback";

type Props = {
  label: string;
  hint?: string;
  selected?: boolean;
  onPress: () => void;
};

/** Soft radio card — a soft plum wash when chosen, never a heavy fill. */
export function ChoiceCard({ label, hint, selected, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={hint ? `${label}. ${hint}` : label}
      onPress={() => {
        selectTap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.copy}>
        <AppText variant="label" tone={selected ? "plum" : "ink"}>
          {label}
        </AppText>
        {hint ? (
          <AppText variant="meta" tone="muted">
            {hint}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.radio, selected && styles.radioOn]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    ...elevation.sm,
  },
  selected: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandPrimary,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  copy: { flex: 1, gap: 4 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfacePrimary,
  },
  radioOn: {
    borderColor: colors.brandPrimary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandPrimary,
  },
});
