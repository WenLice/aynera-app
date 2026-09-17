import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { colors } from "../theme";

type Props = {
  size?: number;
  onComplete?: () => void;
};

/**
 * Real Aynera mark: plum soul + rose soul start apart, then meet.
 */
export function AnimatedLogoMark({ size = 148, onComplete }: Props) {
  const leftX = useRef(new Animated.Value(-size * 0.42)).current;
  const rightX = useRef(new Animated.Value(size * 0.42)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const diamond = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const done = useRef(false);

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;

    Animated.sequence([
      Animated.timing(fade, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(leftX, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rightX, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(diamond, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(800),
    ]).start(({ finished }) => {
      if (!finished || done.current) return;
      done.current = true;
      onComplete?.();
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.04,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
    });

    return () => loop?.stop();
  }, [diamond, fade, leftX, onComplete, pulse, rightX]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          opacity: fade,
          transform: [{ scale: pulse }],
        },
      ]}
    >
      <View style={styles.halo} />

      <Animated.View
        style={[styles.half, { transform: [{ translateX: leftX }] }]}
      >
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Path
            fill={colors.brandPrimary}
            d="M20 12c-5.2 0-9.5 4.1-9.5 9.5 0 3.2 1.5 5.9 3.8 7.6C8.8 33.4 4 41.2 4 50.2c0 1.4.4 2.6 1.8 2.6h18.4c1.5-6.8 5.2-12.2 10.2-15.8-1.2-1.5-2-3.4-2-5.5C32.4 22.2 27 12 20 12Z"
          />
          <Circle cx="20" cy="14" r="5.2" fill={colors.brandPrimary} />
        </Svg>
      </Animated.View>

      <Animated.View
        style={[styles.half, { transform: [{ translateX: rightX }] }]}
      >
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Defs>
            <LinearGradient id="seRose" x1="18" y1="8" x2="56" y2="56">
              <Stop offset="0" stopColor="#F0C4A8" />
              <Stop offset="0.55" stopColor="#E8A88A" />
              <Stop offset="1" stopColor="#C97B5D" />
            </LinearGradient>
          </Defs>
          <Path
            fill="url(#seRose)"
            d="M44 12c5.2 0 9.5 4.1 9.5 9.5 0 3.2-1.5 5.9-3.8 7.6C55.2 33.4 60 41.2 60 50.2c0 1.4-.4 2.6-1.8 2.6H39.8c-1.5-6.8-5.2-12.2-10.2-15.8 1.2-1.5 2-3.4 2-5.5C31.6 22.2 37 12 44 12Z"
          />
          <Circle cx="44" cy="14" r="5.2" fill="url(#seRose)" />
        </Svg>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[styles.half, { opacity: diamond }]}
      >
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Path
            fill={colors.backgroundPrimary}
            d="M32 34.5 27.2 39.3 32 44.1l4.8-4.8L32 34.5Z"
          />
          <Path
            fill={colors.brandPrimary}
            fillOpacity={0.35}
            d="M32 36.8 29.2 39.6 32 42.4l2.8-2.8L32 36.8Z"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  halo: {
    position: "absolute",
    width: "82%",
    height: "82%",
    borderRadius: 999,
    backgroundColor: colors.brandSoft,
  },
  half: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
