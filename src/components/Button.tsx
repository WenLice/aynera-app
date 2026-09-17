import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type ViewStyle,
} from "react-native";
import { colors, elevation, fonts, radius, spacing, typography } from "../theme";
import { selectTap } from "../utils/feedback";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm";

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  onDark?: boolean;
  /** Silence the tap for repeated, low-stakes presses. */
  haptic?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onDark = false,
  haptic = true,
  style,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={() => {
        if (haptic) selectTap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        size === "sm" ? styles.small : null,
        styles[variant],
        size === "sm" && variant === "ghost" ? styles.ghostSmall : null,
        onDark && variant === "secondary" ? styles.secondaryOnDark : null,
        onDark && variant === "ghost" ? styles.ghostOnDark : null,
        pressed && !isDisabled ? styles.pressed : null,
        pressed && !isDisabled && !onDark ? pressedFill[variant] : null,
        isDisabled ? (variant === "ghost" ? styles.disabledGhost : styles.disabled) : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || (onDark && variant === "secondary")
              ? colors.textOnPrimary
              : colors.brandPrimary
          }
        />
      ) : (
        <Text
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
          style={[
            styles.label,
            size === "sm" ? styles.smallLabel : null,
            styles[`${variant}Label` as const],
            onDark && variant === "secondary" ? styles.secondaryOnDarkLabel : null,
            onDark && variant === "ghost" ? styles.ghostOnDarkLabel : null,
            isDisabled ? styles.disabledLabel : null,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  small: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  ghostSmall: {
    minHeight: 40,
  },
  primary: {
    backgroundColor: colors.brandPrimary,
    ...elevation.md,
  },
  secondary: {
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  secondaryOnDark: {
    backgroundColor: colors.onDark16,
    borderWidth: 1,
    borderColor: colors.onDark32,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  ghostOnDark: {
    backgroundColor: "transparent",
  },
  /** Same press signature as chips, so every tappable thing agrees. */
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  /** Disabled still reads as a control, never as a ghost of one. */
  disabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBackground,
  },
  disabledGhost: {
    backgroundColor: "transparent",
  },
  disabledLabel: {
    color: colors.disabledText,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.md,
  },
  smallLabel: {
    fontSize: typography.size.base,
  },
  primaryLabel: {
    color: colors.textOnPrimary,
  },
  secondaryLabel: {
    color: colors.brandPrimary,
  },
  secondaryOnDarkLabel: {
    color: colors.textOnPrimary,
  },
  ghostLabel: {
    color: colors.brandPrimary,
  },
  ghostOnDarkLabel: {
    color: colors.onDark92,
  },
});

/** Press darkens the fill rather than fading it — plum stays plum. */
const pressedFill = StyleSheet.create({
  primary: { backgroundColor: colors.brandPrimaryPressed },
  secondary: { backgroundColor: colors.brandSoft },
  ghost: { backgroundColor: "transparent" },
});
