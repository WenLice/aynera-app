import { Pressable, StyleSheet } from "react-native";
import { BrandMark } from "./BrandMark";
import { colors } from "../theme";

type Props = {
  onPress: () => void;
  compact?: boolean;
};

/**
 * Respond control — just the Aynera mark on the photo, no disk behind it.
 * The hit area stays generous so the tap is easy even when the mark is small.
 */
export function RespondMark({ onPress, compact }: Props) {
  const size = compact ? 34 : 40;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Reply to this"
    >
      <BrandMark size={size} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: "center",
    justifyContent: "center",
    // Soft lift so the mark still separates from busy photos.
    shadowColor: colors.brandPrimaryPressed,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
});
