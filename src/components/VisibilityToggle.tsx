import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, radius, spacing } from "../theme";
import { selectTap } from "../utils/feedback";

type Props = {
  visible: boolean;
  onChange: (visible: boolean) => void;
  /** Overrides the default "Shown on your profile" / "Kept private" wording. */
  shownLabel?: string;
  hiddenLabel?: string;
  accessibilityLabel?: string;
};

/**
 * Answering and publishing are separate, deliberate choices — this is the second one.
 * Used by the optional everyday questions and by the gender step, where turning it off
 * is what "prefer not to say" means: hidden on the profile, still used for matching.
 */
export function VisibilityToggle({
  visible,
  onChange,
  shownLabel = "Shown on your profile",
  hiddenLabel = "Kept private",
  accessibilityLabel = "Show this on my profile",
}: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: visible }}
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        selectTap();
        onChange(!visible);
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.box, visible && styles.boxOn]}>
        {visible ? <View style={styles.tick} /> : null}
      </View>
      <AppText variant="meta" tone={visible ? "plum" : "muted"}>
        {visible ? shownLabel : hiddenLabel}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pressed: { opacity: 0.85 },
  box: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  boxOn: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandPrimary,
  },
  tick: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: colors.textOnPrimary,
  },
});
