import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Field } from "./Field";
import { Sheet } from "./Sheet";
import type { MomentTarget } from "./ProfileStory";
import { colors, spacing } from "../theme";

type Props = {
  visible: boolean;
  personName: string;
  moment: MomentTarget | null;
  onClose: () => void;
  onSend: (message: string) => void;
};

const MIN = 12;

export function RespondSheet({
  visible,
  personName,
  moment,
  onClose,
  onSend,
}: Props) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!visible) setMessage("");
  }, [visible]);

  const length = message.trim().length;
  const short = length < MIN;

  const send = () => {
    if (short) return;
    onSend(message.trim());
    setMessage("");
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <AppText variant="kicker" tone="rose">
        What caught you here?
      </AppText>
      <AppText variant="title" style={styles.title}>
        Reply to {personName}
      </AppText>

      {/* The moment is quoted so the first line always has something to answer. */}
      <View style={styles.quote}>
        <View style={styles.quoteRule} />
        <AppText variant="letter" tone="soft" numberOfLines={3} style={styles.quoteText}>
          {moment?.title}
        </AppText>
      </View>

      <Field
        value={message}
        onChangeText={setMessage}
        placeholder="Write from what you noticed .."
        multiline
        autoFocus
      />

      <View style={styles.meterRow}>
        <AppText variant="micro" tone={short ? "muted" : "rose"}>
          {short
            ? `A few more words .. ${MIN - length} to go`
            : "This is enough to reply to"}
        </AppText>
      </View>

      <Button label="Send this reply" disabled={short} onPress={send} />
      <Button label="Cancel" variant="ghost" haptic={false} onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.xs },
  quote: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.base,
    marginBottom: spacing.base,
  },
  quoteRule: {
    width: 3,
    borderRadius: 999,
    backgroundColor: colors.accentPrimary,
  },
  quoteText: { flex: 1 },
  meterRow: {
    paddingVertical: spacing.sm,
    minHeight: 30,
    justifyContent: "center",
  },
});
