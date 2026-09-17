import { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { BrandMark } from "./BrandMark";
import { Button } from "./Button";
import { KhatIcon, RejectIcon } from "./TabIcons";
import { calm, colors, elevation, motion, radius, spacing } from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";

type Props = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Teaches the three acts using the exact marks that appear on the real
 * controls, so nothing has to be learned twice.
 */
const ACTS = [
  {
    key: "respond",
    title: "Respond",
    body: "Start from something in their introduction that genuinely caught you",
  },
  {
    key: "reject",
    title: "Pass",
    body: "If it isn't for you .. let it go and another introduction can arrive later",
  },
  {
    key: "khat",
    title: "KHAT",
    body: "A rare note for the introduction that feels meaningfully different",
  },
] as const;

export function MeetGuide({ visible, onClose }: Props) {
  const reduced = useReduceMotion();
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    rise.setValue(0);
    Animated.timing(rise, {
      toValue: 1,
      duration: calm(motion.duration.calm, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [visible, rise, reduced]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: rise,
              transform: [
                {
                  translateY: rise.interpolate({
                    inputRange: [0, 1],
                    outputRange: [18, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <BrandMark size={36} />
          <AppText variant="kicker" tone="rose" style={styles.kicker}>
            Before your first Duo
          </AppText>
          <AppText variant="title">Three ways to move</AppText>

          <View style={styles.acts}>
            {ACTS.map((act) => (
              <View key={act.key} style={styles.act}>
                <View
                  style={[
                    styles.mark,
                    act.key === "respond" && styles.markRespond,
                    act.key === "khat" && styles.markKhat,
                  ]}
                >
                  {act.key === "respond" ? <BrandMark size={28} /> : null}
                  {act.key === "reject" ? <RejectIcon size={28} /> : null}
                  {act.key === "khat" ? <KhatIcon size={28} /> : null}
                </View>
                <View style={styles.copy}>
                  <AppText variant="label" tone="plum">
                    {act.title}
                  </AppText>
                  <AppText variant="body" tone="soft">
                    {act.body}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          <Button label="Open my first Duo" onPress={onClose} />
          <AppText variant="meta" tone="muted" center>
            You'll always see the full introduction before deciding
          </AppText>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.scrim72,
  },
  card: {
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: colors.surfacePrimary,
    gap: spacing.md,
    ...elevation.ceremony,
  },
  kicker: { marginTop: spacing.xs },
  acts: {
    gap: spacing.base,
    marginVertical: spacing.sm,
  },
  act: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  mark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfacePrimary,
    overflow: "hidden",
  },
  /** Respond is just the mark — same as on the photo. */
  markRespond: {
    backgroundColor: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
  },
  markKhat: {
    backgroundColor: "#0B0710",
    borderColor: colors.accentLine,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
