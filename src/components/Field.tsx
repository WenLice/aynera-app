import { Platform, StyleSheet, TextInput, type TextInputProps } from "react-native";
import { colors, fonts, radius, spacing, typography } from "../theme";

type Variant = "box" | "line" | "compact";

type Props = TextInputProps & {
  variant?: Variant;
};

/**
 * Typed text must stay visible on every Android/iOS theme.
 * Custom serif fonts plus lineHeight often clip or wash out input text.
 */
export function Field({
  style,
  variant = "box",
  placeholderTextColor,
  multiline,
  ...rest
}: Props) {
  return (
    <TextInput
      {...rest}
      multiline={multiline}
      placeholderTextColor={placeholderTextColor ?? colors.textTertiary}
      selectionColor={colors.brandPrimary}
      cursorColor={colors.brandPrimary}
      underlineColorAndroid="transparent"
      keyboardAppearance="light"
      textAlignVertical={multiline ? "top" : rest.textAlignVertical}
      style={[
        styles.base,
        variant === "box" && styles.box,
        variant === "line" && styles.line,
        variant === "compact" && styles.compact,
        multiline && styles.multiline,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
    backgroundColor: colors.surfacePrimary,
    fontFamily: fonts.body,
    fontSize: typography.size.md,
    includeFontPadding: false,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === "android" ? 14 : 12,
  },
  box: {
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    borderRadius: radius.xl,
    minHeight: 56,
  },
  line: {
    minHeight: 56,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderStrong,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    fontSize: typography.size.xl,
  },
  compact: {
    minHeight: 52,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderStrong,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    fontSize: typography.size.xl,
    textAlign: "center",
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top",
  },
});
