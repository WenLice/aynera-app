import { useEffect, useRef } from "react";
import { Platform, Pressable, StyleSheet, TextInput, View } from "react-native";
import { AppText } from "./AppText";
import { colors, fonts, radius, spacing, typography } from "../theme";

const LENGTH = 6;

type Props = {
  value: string;
  onChange: (next: string) => void;
  autoFocus?: boolean;
};

/**
 * Six boxes that share one hidden input — avoids the per-box focus bugs that
 * make split OTP fields feel broken on Android.
 */
export function CodeInput({ value, onChange, autoFocus }: Props) {
  const input = useRef<TextInput>(null);
  const digits = value.slice(0, LENGTH).split("");

  useEffect(() => {
    if (!autoFocus) return;
    const t = setTimeout(() => input.current?.focus(), 320);
    return () => clearTimeout(t);
  }, [autoFocus]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Enter the six digit code"
      onPress={() => input.current?.focus()}
      style={styles.row}
    >
      {Array.from({ length: LENGTH }).map((_, i) => {
        const filled = !!digits[i];
        const active = i === digits.length;
        return (
          <View
            key={i}
            style={[styles.box, filled && styles.boxFilled, active && styles.boxActive]}
          >
            <AppText style={styles.digit}>{digits[i] ?? ""}</AppText>
          </View>
        );
      })}

      <TextInput
        ref={input}
        value={value}
        onChangeText={(raw) => onChange(raw.replace(/\D/g, "").slice(0, LENGTH))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === "android" ? "sms-otp" : "one-time-code"}
        maxLength={LENGTH}
        caretHidden
        style={styles.hidden}
      />
    </Pressable>
  );
}

export const CODE_LENGTH = LENGTH;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "center",
  },
  box: {
    flex: 1,
    maxWidth: 54,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  boxFilled: {
    backgroundColor: colors.brandSoft,
    borderColor: colors.brandPrimary,
  },
  boxActive: {
    borderColor: colors.brandPrimary,
  },
  digit: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
  },
  /** Kept on-screen but invisible; off-screen inputs lose the keyboard. */
  hidden: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0,
    color: "transparent",
  },
});
