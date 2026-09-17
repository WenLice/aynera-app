import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, elevation, radius, spacing } from "../theme";
import { selectTap } from "../utils/feedback";

type Props = {
  question: string;
  hint?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onChangeVisible: (visible: boolean) => void;
};

/**
 * One optional question with its own visibility switch. Answering helps the
 * curator; publishing is a separate, deliberate choice.
 */
export function QuestionCard({
  question,
  hint,
  options,
  value,
  onChange,
  visible,
  onChangeVisible,
}: Props) {
  return (
    <View style={styles.card}>
      <AppText variant="label" tone="ink">
        {question}
      </AppText>
      {hint ? (
        <AppText variant="meta" tone="muted">
          {hint}
        </AppText>
      ) : null}

      <View style={styles.options}>
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option}
              onPress={() => {
                selectTap();
                onChange(active ? "" : option);
              }}
              style={({ pressed }) => [
                styles.pill,
                active && styles.pillOn,
                pressed && styles.pressed,
              ]}
            >
              <AppText
                variant="meta"
                tone={active ? "inverse" : "ink"}
                center
                numberOfLines={2}
                style={styles.pillText}
              >
                {option}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: visible }}
        accessibilityLabel="Show this on my profile"
        onPress={() => {
          selectTap();
          onChangeVisible(!visible);
        }}
        style={({ pressed }) => [styles.visibleRow, pressed && styles.pressed]}
      >
        <View style={[styles.box, visible && styles.boxOn]}>
          {visible ? <View style={styles.tick} /> : null}
        </View>
        <AppText variant="meta" tone={visible ? "plum" : "muted"}>
          {visible ? "Shown on your profile" : "Kept private"}
        </AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.lg,
    gap: spacing.sm,
    ...elevation.sm,
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: spacing.sm,
    columnGap: 0,
    marginTop: spacing.xs,
  },
  /** Equal boxes — same width/height across every everyday & beliefs question. */
  pill: {
    width: "48.5%",
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderChip,
    backgroundColor: colors.surfacePrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  pillOn: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  pillText: {
    textAlign: "center",
  },
  pressed: { opacity: 0.85 },
  visibleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
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
