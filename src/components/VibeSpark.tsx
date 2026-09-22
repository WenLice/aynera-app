import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { splitSpark } from "../data/vibeSparks";
import { colors, fonts, spacing, typography } from "../theme";

type Props = {
  /** Chip that was tapped — shown as the overline. */
  chip: string;
  spark: string;
  /** Bump on every tap so the next spark arrives as a new message. */
  sparkKey: number;
  /** Optional milestone line ("You’re starting to sound specific."). */
  note?: string;
  onDismiss: () => void;
};

const EXIT_MS = 190;
const DWELL_MS = 2000;
/** Far enough that the bubble is fully clear of either edge. */
const OFFSCREEN = Math.round(Dimensions.get("window").width * 0.85);

type Side = "right" | "left";
type Card = {
  chip: string;
  emoji: string;
  body: string;
  /** Side the bubble entered from, exits toward, and is anchored to. */
  side: Side;
};

/**
 * Vibe sparks arrive like messages: they slide in from one edge and leave
 * the same way before the next one lands, alternating sides as they go.
 */
export function VibeSpark({ chip, spark, sparkKey, note, onDismiss }: Props) {
  const [card, setCard] = useState<Card | null>(null);
  /** 0 = seated, 1 = offscreen on the card's own side. */
  const slide = useRef(new Animated.Value(1)).current;
  const dwell = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shownKey = useRef(-1);
  /**
   * Arrivals so far this mount. Even = right, odd = left, so the first
   * spark of the screen comes from the right and it resets when the
   * vibe step unmounts.
   */
  const arrivals = useRef(0);

  useEffect(() => {
    if (spark && sparkKey === shownKey.current) return;

    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }

    const exit = () =>
      Animated.timing(slide, {
        toValue: 1,
        duration: EXIT_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });

    if (!spark) {
      shownKey.current = -1;
      if (!card) return;
      exit().start(({ finished }) => {
        if (finished) setCard(null);
      });
      return;
    }

    const parts = splitSpark(spark);
    const arrive = () => {
      const side: Side = arrivals.current % 2 === 0 ? "right" : "left";
      arrivals.current += 1;
      shownKey.current = sparkKey;
      setCard({ chip, ...parts, side });
      slide.setValue(1);
      dwell.setValue(0);
      Animated.parallel([
        Animated.spring(slide, {
          toValue: 0,
          friction: 8,
          tension: 62,
          useNativeDriver: true,
        }),
        Animated.timing(dwell, {
          toValue: 1,
          duration: DWELL_MS,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ]).start();
      timer.current = setTimeout(onDismiss, DWELL_MS);
    };

    if (card) {
      exit().start(({ finished }) => {
        if (finished) arrive();
      });
      return;
    }
    arrive();
    // card is read but must not retrigger: a re-show only comes from a new sparkKey.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sparkKey, spark, chip, dwell, slide, onDismiss]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  /** Finger down: hold the countdown wherever it is. */
  const hold = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    dwell.stopAnimation();
  };

  if (!card) return null;

  const fromRight = card.side === "right";

  return (
    <View
      style={[styles.wrap, fromRight ? styles.wrapRight : styles.wrapLeft]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.bubble,
          fromRight ? styles.shadowRight : styles.shadowLeft,
          {
            opacity: slide.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
            transform: [
              {
                translateX: slide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, fromRight ? OFFSCREEN : -OFFSCREEN],
                }),
              },
              {
                scale: slide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.98],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          onPressIn={hold}
          onPressOut={onDismiss}
          style={[styles.press, fromRight ? styles.tailRight : styles.tailLeft]}
        >
          <LinearGradient
            colors={[colors.surfacePrimary, colors.surfaceSecondary]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={[styles.inner, fromRight ? styles.tailRight : styles.tailLeft]}
          >
            <View style={styles.head}>
              <View style={styles.emojiRing}>
                <Text style={styles.emoji}>{card.emoji}</Text>
              </View>
              <Text style={styles.chip}>{card.chip}</Text>
            </View>

            <Text style={styles.body}>{card.body}</Text>
            {note ? <Text style={styles.note}>{note}</Text> : null}

            <View style={styles.track}>
              <Animated.View
                style={[
                  styles.fill,
                  {
                    width: dwell.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["100%", "0%"],
                    }),
                  },
                ]}
              />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    paddingBottom: spacing.xs,
    zIndex: 30,
  },
  /** Anchored to the edge it arrived from, like a message thread. */
  wrapRight: {
    alignItems: "flex-end",
  },
  wrapLeft: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    shadowColor: colors.brandPrimaryPressed,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 10,
  },
  shadowRight: {
    shadowOffset: { width: -4, height: 10 },
  },
  shadowLeft: {
    shadowOffset: { width: 4, height: 10 },
  },
  press: {
    borderRadius: 22,
    overflow: "hidden",
  },
  /** The tight corner is the tail, so it sits on the anchored side. */
  tailRight: {
    borderBottomRightRadius: 6,
  },
  tailLeft: {
    borderBottomLeftRadius: 6,
  },
  inner: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.accentLine,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  emojiRing: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.accentLine,
  },
  emoji: {
    fontSize: 16,
  },
  chip: {
    flex: 1,
    color: colors.accentPrimaryPressed,
    fontSize: typography.size.xs,
    fontWeight: "700",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  body: {
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.md,
    lineHeight: 23,
    color: colors.brandPrimary,
  },
  note: {
    fontFamily: fonts.body,
    color: colors.textTertiary,
    fontSize: typography.size.sm,
    fontStyle: "italic",
  },
  track: {
    marginTop: 2,
    height: 2,
    width: 48,
    borderRadius: 2,
    backgroundColor: colors.brandSoft,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.accentPrimaryPressed,
  },
});
