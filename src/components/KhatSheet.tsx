import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { Field } from "./Field";
import { Sheet } from "./Sheet";
import { KhatIcon } from "./TabIcons";
import type { MomentTarget } from "./ProfileStory";
import { KHAT_MAX_CHARS, KHAT_MIN_CHARS } from "../config/aynera";
import { colors, radius, spacing } from "../theme";

type Props = {
  visible: boolean;
  personName: string;
  remaining: number;
  moment?: MomentTarget | null;
  onClose: () => void;
  onSend: (note: string) => void;
};

const MIN = KHAT_MIN_CHARS;
const MAX = KHAT_MAX_CHARS;

/** Ceremonial special letter — scarce, intentional. */
export function KhatSheet({
  visible,
  personName,
  remaining,
  moment,
  onClose,
  onSend,
}: Props) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!visible) setNote("");
  }, [visible]);

  const length = note.trim().length;
  const short = length < MIN;
  const spent = remaining < 1;
  const unattached = !moment?.title;

  const send = () => {
    if (short || spent || unattached) return;
    onSend(note.trim());
    setNote("");
  };

  return (
    <Sheet visible={visible} onClose={onClose} scroll>
      <LinearGradient
        colors={[colors.accentPrimary, colors.brandPrimary]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.hero}
      >
        <KhatIcon size={56} />
        <AppText variant="kicker" tone="rose" style={styles.heroKicker}>
          KHAT
        </AppText>
        <AppText variant="display" tone="inverse" style={styles.wordmark}>
          KHAT
        </AppText>
        <AppText variant="body" tone="inverseSoft" center style={styles.heroSub}>
          For {personName} .. if you really don't want to pass quietly
        </AppText>
        <View style={styles.counter}>
          <AppText variant="micro" tone="rose">
            {remaining} Khat available this week
          </AppText>
        </View>
      </LinearGradient>

      {moment?.title ? (
        <AppText variant="meta" tone="muted">
          Attached to .. {moment.title}
        </AppText>
      ) : (
        <AppText variant="meta" tone="muted">
          A Khat needs something from their introduction .. reply to a moment first, or write from what you noticed
        </AppText>
      )}

      <Field
        value={note}
        onChangeText={(v) => setNote(v.slice(0, MAX))}
        placeholder="Why this introduction feels different .."
        multiline
        autoFocus
      />

      <View style={styles.meterRow}>
        <AppText variant="micro" tone={short ? "muted" : "rose"}>
          {spent
            ? "Your Khat returns in a week"
            : unattached
              ? "Attach this to something from their introduction first"
              : short
                ? `A Khat needs a real note .. ${MIN - length} to go`
                : `${length}/${MAX}`}
        </AppText>
      </View>

      <Button
        label="Send KHAT"
        disabled={short || spent || unattached}
        onPress={send}
      />
      <Button label="Not now" variant="ghost" haptic={false} onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.xs,
    marginBottom: spacing.base,
  },
  heroKicker: { marginTop: spacing.sm },
  wordmark: { letterSpacing: 4 },
  heroSub: { maxWidth: 280, marginTop: spacing.xs },
  counter: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accentLine,
  },
  meterRow: {
    paddingVertical: spacing.sm,
    minHeight: 30,
    justifyContent: "center",
  },
});
