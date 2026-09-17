import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { BrandMark } from "./BrandMark";
import { calm, colors, motion } from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";

type Props = {
  size?: number;
  /** Fires once the bloom has fully opened. */
  onComplete?: () => void;
};

const RINGS = [0, 1, 2];

/**
 * The bloom itself — three rings opening out from the mark. Presentational
 * only, so the match screen owns the words and the actions.
 */
export function MatchBloom({ size = 132, onComplete }: Props) {
  const reduced = useReduceMotion();
  const core = useRef(new Animated.Value(0)).current;
  const rings = useRef(RINGS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const open = Animated.spring(core, {
      toValue: 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 140,
      mass: 0.9,
    });

    const waves = Animated.stagger(
      reduced ? 0 : 260,
      rings.map((ring) =>
        Animated.timing(ring, {
          toValue: 1,
          duration: calm(motion.duration.ceremony, reduced),
          easing: motion.easing.bloom,
          useNativeDriver: true,
        }),
      ),
    );

    Animated.parallel([open, waves]).start(({ finished }) => {
      if (finished) onComplete?.();
    });
  }, [core, rings, reduced, onComplete]);

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {rings.map((ring, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ring,
            {
              opacity: ring.interpolate({
                inputRange: [0, 0.2, 1],
                outputRange: [0, 0.55, 0],
              }),
              transform: [
                {
                  scale: ring.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 2.1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <Animated.View
        style={{
          opacity: core,
          transform: [
            {
              scale: core.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
          ],
        }}
      >
        <View style={styles.disk}>
          <BrandMark size={size * 0.4} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.accentPrimary,
  },
  disk: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.accentLine,
    backgroundColor: colors.scrim30,
    paddingHorizontal: 22,
  },
});
