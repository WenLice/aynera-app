import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, elevation, fonts, radius, spacing, typography } from "../theme";
import { refuse, selectTap } from "../utils/feedback";

type Props = {
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
  max?: number;
  /** lg = equal vibe grid, md = compact inline chips. */
  size?: "md" | "lg";
  /** Display-only. Does not change chip styling. */
  interactive?: boolean;
};

export function ChipSelect({
  options,
  selected,
  onToggle,
  max,
  size = "md",
  interactive = true,
}: Props) {
  const large = size === "lg";
  return (
    <View style={[styles.wrap, large && styles.wrapGrid]}>
      {options.map((option) => {
        const active = selected.includes(option);
        const locked = !active && max != null && selected.length >= max;
        return (
          <Pressable
            key={option}
            accessibilityRole="checkbox"
            accessibilityLabel={option}
            accessibilityState={{
              checked: active,
              disabled: locked || !interactive,
            }}
            onPress={() => {
              if (!interactive) return;
              // A locked chip still answers, it just says no.
              if (locked) {
                refuse();
                return;
              }
              selectTap();
              onToggle(option);
            }}
            style={({ pressed }) => [
              styles.chip,
              large && styles.chipCell,
              active && styles.chipActive,
              locked && styles.chipLocked,
              pressed && !locked && styles.chipPressed,
            ]}
          >
            <Text
              maxFontSizeMultiplier={1.3}
              numberOfLines={large ? 2 : 1}
              style={[
                styles.text,
                large && styles.textCell,
                active && styles.textActive,
              ]}
            >
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  wrapGrid: {
    justifyContent: "space-between",
    rowGap: spacing.sm,
    columnGap: 0,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderChip,
    backgroundColor: colors.surfacePrimary,
  },
  /** Two equal columns — every vibe chip same width and height. */
  chipCell: {
    width: "48.5%",
    flexGrow: 0,
    flexShrink: 0,
    minHeight: 56,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfacePrimary,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
    ...elevation.sm,
  },
  chipLocked: {
    opacity: 0.4,
  },
  chipPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  text: {
    fontFamily: fonts.bodyMedium,
    color: colors.textPrimary,
    fontSize: typography.size.base,
  },
  textCell: {
    fontSize: typography.size.base,
    textAlign: "center",
    lineHeight: typography.size.base * 1.25,
  },
  textActive: {
    color: colors.textOnPrimary,
  },
});
