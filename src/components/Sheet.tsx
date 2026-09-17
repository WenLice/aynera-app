import { useEffect, useRef, type ReactNode } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { calm, colors, motion, radius, spacing } from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";
import { selectTap } from "../utils/feedback";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Lets a tall sheet scroll instead of pushing its actions off screen. */
  scroll?: boolean;
  /** Dark sheets skip the paper background — used by the KHAT ceremony. */
  tone?: "paper" | "dusk";
};

const DISMISS_DISTANCE = 110;
const DISMISS_VELOCITY = 0.6;

/**
 * One bottom sheet for the whole app: a grabber, a drag to dismiss, and the
 * same arrival curve every time. Replaces three sheets that each moved
 * differently and could only be closed by a button.
 */
export function Sheet({
  visible,
  onClose,
  children,
  scroll = false,
  tone = "paper",
}: Props) {
  const insets = useSafeAreaInsets();
  const reduced = useReduceMotion();
  const rise = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    drag.setValue(0);
    rise.setValue(0);
    Animated.timing(rise, {
      toValue: 1,
      duration: calm(motion.duration.calm, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [visible, rise, drag, reduced]);

  const close = () => {
    Keyboard.dismiss();
    Animated.timing(rise, {
      toValue: 0,
      duration: calm(motion.duration.quick, reduced),
      easing: motion.easing.exit,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  const pan = useRef(
    PanResponder.create({
      // Only claim the gesture once it's clearly a downward drag, so text
      // inputs and buttons inside the sheet keep working.
      onMoveShouldSetPanResponder: (_e, g) =>
        g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => Keyboard.dismiss(),
      onPanResponderMove: (_e, g) => {
        if (g.dy > 0) drag.setValue(g.dy);
      },
      onPanResponderRelease: (_e, g) => {
        const shouldClose =
          g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY;
        if (shouldClose) {
          selectTap();
          Animated.timing(drag, {
            toValue: 600,
            duration: motion.duration.quick,
            easing: motion.easing.exit,
            useNativeDriver: true,
          }).start(onClose);
          return;
        }
        Animated.spring(drag, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 220,
          mass: 0.6,
        }).start();
      },
    }),
  ).current;

  const translateY = Animated.add(
    rise.interpolate({
      inputRange: [0, 1],
      outputRange: [420, 0],
      extrapolate: "clamp",
    }),
    drag,
  );

  const dark = tone === "dusk";

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: rise }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Close"
            onPress={close}
          />
        </Animated.View>

        <KeyboardAvoidingView
          style={styles.lift}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              dark && styles.sheetDusk,
              {
                paddingBottom: Math.max(insets.bottom, spacing.base),
                transform: [{ translateY }],
              },
            ]}
          >
            <View {...pan.panHandlers} style={styles.grabArea}>
              <View style={[styles.grabber, dark && styles.grabberDusk]} />
            </View>
            {scroll ? (
              <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollInner}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {children}
              </ScrollView>
            ) : (
              <View>{children}</View>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.scrim,
  },
  lift: { justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surfacePrimary,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    shadowColor: colors.brandPrimaryPressed,
    shadowOpacity: 0.28,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  sheetDusk: {
    backgroundColor: colors.brandPrimaryPressed,
  },
  grabArea: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    // Widen the grab target well past the visible bar.
    marginHorizontal: -spacing.xl,
  },
  grabber: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
  },
  grabberDusk: {
    backgroundColor: colors.onDark32,
  },
  scroll: { maxHeight: 520 },
  scrollInner: { paddingBottom: spacing.sm },
});
