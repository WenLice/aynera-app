import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Sheet } from "./Sheet";
import { colors, spacing } from "../theme";
import { softPulse } from "../utils/feedback";

type Props = {
  visible: boolean;
  personName: string;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
};

export function SafetySheet({
  visible,
  personName,
  onClose,
  onReport,
  onBlock,
}: Props) {
  const [choice, setChoice] = useState<"report" | "block" | null>(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!visible) {
      setChoice(null);
      setComplete(false);
    }
  }, [visible]);

  const confirm = () => {
    if (choice === "report") onReport();
    if (choice === "block") onBlock();
    softPulse();
    setComplete(true);
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <AppText variant="kicker" tone="rose">
        Safety
      </AppText>

      {complete ? (
        <>
          <AppText variant="title" style={styles.title}>
            You're taken care of.
          </AppText>
          <AppText variant="body" tone="soft" style={styles.body}>
            {choice === "block"
              ? `${personName} can no longer contact or see you.`
              : "This introduction has been set aside and sent for review."}
          </AppText>
          <Button label="Return to Meet" onPress={onClose} />
        </>
      ) : choice ? (
        <>
          <AppText variant="title" style={styles.title}>
            {choice === "block" ? `Block ${personName}?` : "Send for review?"}
          </AppText>
          <AppText variant="body" tone="soft" style={styles.body}>
            {choice === "block"
              ? "This is private and immediate. You won't see each other again."
              : "The introduction will leave your Meet queue. A safety reviewer will look carefully."}
          </AppText>
          <Button
            label={choice === "block" ? "Confirm block" : "Confirm report"}
            onPress={confirm}
          />
          <Button
            label="Go back"
            variant="ghost"
            haptic={false}
            onPress={() => setChoice(null)}
          />
        </>
      ) : (
        <>
          <AppText variant="title" style={styles.title}>
            {personName}
          </AppText>
          <AppText variant="body" tone="soft" style={styles.body}>
            You can report or block at any time. Your choice stays private.
            Write to grievance@aynera.in if you need a careful review. Aynera
            is not an emergency service.
          </AppText>

          <SafetyRow
            label="Report this introduction"
            hint="Share a concern with the safety team"
            onPress={() => setChoice("report")}
          />
          <SafetyRow
            label="Block privately"
            hint="Remove each other permanently"
            danger
            onPress={() => setChoice("block")}
          />

          <Button label="Cancel" variant="ghost" haptic={false} onPress={onClose} />
        </>
      )}
    </Sheet>
  );
}

function SafetyRow({
  label,
  hint,
  danger,
  onPress,
}: {
  label: string;
  hint: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}. ${hint}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.rowCopy}>
        <AppText variant="label" tone={danger ? "ink" : "plum"} style={danger && styles.danger}>
          {label}
        </AppText>
        <AppText variant="meta" tone="muted">
          {hint}
        </AppText>
      </View>
      <AppText variant="label" tone="muted">
        ›
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  body: { marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.borderPrimary,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowCopy: { flex: 1, gap: 2 },
  danger: { color: colors.danger },
});
