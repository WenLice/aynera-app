import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, radius, spacing } from "../theme";
import { selectTap } from "../utils/feedback";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  accessibilityLabel?: string;
};

/** A tick box with a label beside it. */
export function CheckboxRow({ checked, onChange, label, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={() => {
        selectTap();
        onChange(!checked);
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked ? <View style={styles.tick} /> : null}
      </View>
      <AppText variant="meta" tone={checked ? "plum" : "muted"}>
        {label}
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
