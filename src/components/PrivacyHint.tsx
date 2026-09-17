import { StyleSheet, Text, View } from "react-native";
import { colors, fonts, spacing, typography } from "../theme";

type Props = {
  text: string;
  kind?: "lock" | "eye";
};

export function PrivacyHint({ text, kind = "lock" }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{kind === "eye" ? "◉" : "○"}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  icon: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
  },
  text: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: typography.size.xs,
    lineHeight: 16,
    color: colors.textTertiary,
  },
});
