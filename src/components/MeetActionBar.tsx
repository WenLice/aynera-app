import { Pressable, StyleSheet, Text, View } from "react-native";
import { KhatIcon, RejectIcon } from "./TabIcons";
import { colors, fonts, radius, spacing, typography } from "../theme";

type Props = {
  unlocked: boolean;
  khatRemaining: number;
  responseSent?: boolean;
  onPass: () => void;
  onKhat: () => void;
};

/** Appears only after a full read — Pass + KHAT logos only. */
export function MeetActionBar({
  unlocked,
  khatRemaining,
  responseSent,
  onPass,
  onKhat,
}: Props) {
  if (!unlocked) return null;

  if (responseSent) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.sent}>Response sent</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {/* Pass (X) — left */}
      <Pressable
        onPress={onPass}
        style={({ pressed }) => [styles.logoBtn, pressed && styles.pressed]}
        accessibilityLabel="Pass on this introduction"
      >
        <RejectIcon size={58} />
      </Pressable>

      {/* KHAT — right */}
      <Pressable
        onPress={onKhat}
        disabled={khatRemaining < 1}
        style={({ pressed }) => [
          styles.logoBtn,
          styles.khatBtn,
          khatRemaining < 1 && styles.disabled,
          pressed && styles.pressed,
        ]}
        accessibilityLabel="Send KHAT"
      >
        <KhatIcon size={58} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
  },
  logoBtn: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    backgroundColor: "transparent",
  },
  khatBtn: {
    backgroundColor: "transparent",
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
  sent: {
    fontFamily: fonts.bodySemi,
    color: colors.textTertiary,
    fontSize: typography.size.md,
  },
});
