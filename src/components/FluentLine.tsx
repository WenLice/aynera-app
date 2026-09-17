import { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View, type TextStyle } from "react-native";
import { calm, motion } from "../theme";

type Props = {
  text: string;
  style?: TextStyle;
  /** Delay before the first word begins (ms). */
  delay?: number;
  reduced?: boolean;
  onComplete?: () => void;
};

/**
 * Website-style fluent reveal — each word lifts and fades in, one after another.
 */
export function FluentLine({
  text,
  style,
  delay = 0,
  reduced = false,
  onComplete,
}: Props) {
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean), [text]);
  const values = useRef(words.map(() => new Animated.Value(reduced ? 1 : 0))).current;

  useEffect(() => {
    if (reduced) {
      onComplete?.();
      return;
    }

    const step = Math.round(motion.duration.quick * 0.85);
    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.stagger(
        step,
        values.map((value) =>
          Animated.timing(value, {
            toValue: 1,
            duration: calm(motion.duration.calm, reduced),
            easing: motion.easing.enter,
            useNativeDriver: true,
          }),
        ),
      ),
    ]);

    anim.start(({ finished }) => {
      if (finished) onComplete?.();
    });

    return () => anim.stop();
  }, [delay, onComplete, reduced, values]);

  return (
    <View style={styles.row} accessibilityRole="header">
      {words.map((word, index) => (
        <Animated.View
          key={`${word}-${index}`}
          style={{
            opacity: values[index],
            transform: [
              {
                translateY: values[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [14, 0],
                }),
              },
            ],
          }}
        >
          <Text maxFontSizeMultiplier={1.15} style={[styles.word, style]}>
            {word}
            {index < words.length - 1 ? " " : ""}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-end",
  },
  word: {
    textAlign: "center",
  },
});
