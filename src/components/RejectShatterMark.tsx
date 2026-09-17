import { useEffect, useMemo, useRef } from "react";
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

type Shard = {
  id: string;
  side: "plum" | "rose";
  dx: number;
  dy: number;
  spin: string;
  scale: number;
  size: number;
};

/** Tiny butterfly wing — born from the two souls, then flies away. */
function ButterflyWing({
  color,
  size,
  rose,
  uid,
}: {
  color: string;
  size: number;
  rose?: boolean;
  uid: string;
}) {
  const gradId = `bf-${uid}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {rose ? (
        <Defs>
          <LinearGradient id={gradId} x1="4" y1="4" x2="36" y2="36">
            <Stop offset="0" stopColor="#F0C4A8" />
            <Stop offset="0.55" stopColor="#E8A88A" />
            <Stop offset="1" stopColor="#C97B5D" />
          </LinearGradient>
        </Defs>
      ) : null}
      <Path
        fill={rose ? `url(#${gradId})` : color}
        d="M20 20c-2.2-6.5-8.8-10.2-13.2-8.4C2.8 13.2 3.4 19 7.2 22.4 10.4 25.2 15.2 26 20 24.2c4.8 1.8 9.6 1 12.8-1.8 3.8-3.4 4.4-9.2.4-10.8C28.8 9.8 22.2 13.5 20 20Z"
      />
      <Circle cx="20" cy="20" r="2.2" fill={rose ? colors.accentPrimaryPressed : colors.brandPrimaryPressed} />
    </Svg>
  );
}

const SHARDS: Omit<Shard, "id">[] = [
  { side: "plum", dx: -118, dy: -96, spin: "-48deg", scale: 0.9, size: 34 },
  { side: "plum", dx: -142, dy: -18, spin: "-72deg", scale: 0.75, size: 28 },
  { side: "plum", dx: -98, dy: 88, spin: "36deg", scale: 0.85, size: 32 },
  { side: "plum", dx: -54, dy: -128, spin: "-24deg", scale: 0.65, size: 24 },
  { side: "plum", dx: -160, dy: 48, spin: "58deg", scale: 0.7, size: 26 },
  { side: "plum", dx: -28, dy: 118, spin: "-64deg", scale: 0.6, size: 22 },
  { side: "rose", dx: 122, dy: -88, spin: "52deg", scale: 0.9, size: 34 },
  { side: "rose", dx: 148, dy: 8, spin: "68deg", scale: 0.78, size: 28 },
  { side: "rose", dx: 96, dy: 96, spin: "-42deg", scale: 0.85, size: 32 },
  { side: "rose", dx: 58, dy: -132, spin: "28deg", scale: 0.62, size: 24 },
  { side: "rose", dx: 168, dy: -42, spin: "-56deg", scale: 0.72, size: 26 },
  { side: "rose", dx: 36, dy: 124, spin: "74deg", scale: 0.58, size: 22 },
  { side: "plum", dx: -78, dy: -48, spin: "18deg", scale: 0.5, size: 18 },
  { side: "rose", dx: 84, dy: -36, spin: "-22deg", scale: 0.5, size: 18 },
];

/**
 * Reject beat: united mark releases many butterflies from both souls,
 * then clears so the next introduction can open immediately.
 */
export function RejectShatterMark({ size = 160, onComplete }: Props) {
  const coreFade = useRef(new Animated.Value(1)).current;
  const coreScale = useRef(new Animated.Value(1)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  const shards = useMemo(
    () => SHARDS.map((s, i) => ({ ...s, id: `s${i}` })),
    [],
  );

  useEffect(() => {
    done.current = false;
    coreFade.setValue(1);
    coreScale.setValue(1);
    progress.setValue(0);

    Animated.parallel([
      Animated.timing(coreFade, {
        toValue: 0,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(coreScale, {
        toValue: 0.82,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(progress, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished || done.current) return;
      done.current = true;
      onComplete?.();
    });
  }, [coreFade, coreScale, onComplete, progress]);

  return (
    <View style={[styles.wrap, { width: size * 2.4, height: size * 2.4 }]}>
      <Animated.View
        style={[
          styles.core,
          {
            width: size,
            height: size,
            opacity: coreFade,
            transform: [{ scale: coreScale }],
          },
        ]}
      >
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Path
            fill={colors.brandPrimary}
            d="M20 12c-5.2 0-9.5 4.1-9.5 9.5 0 3.2 1.5 5.9 3.8 7.6C8.8 33.4 4 41.2 4 50.2c0 1.4.4 2.6 1.8 2.6h18.4c1.5-6.8 5.2-12.2 10.2-15.8-1.2-1.5-2-3.4-2-5.5C32.4 22.2 27 12 20 12Z"
          />
          <Circle cx="20" cy="14" r="5.2" fill={colors.brandPrimary} />
          <Defs>
            <LinearGradient id="rejRose" x1="18" y1="8" x2="56" y2="56">
              <Stop offset="0" stopColor="#F0C4A8" />
              <Stop offset="0.55" stopColor="#E8A88A" />
              <Stop offset="1" stopColor="#C97B5D" />
            </LinearGradient>
          </Defs>
          <Path
            fill="url(#rejRose)"
            d="M44 12c5.2 0 9.5 4.1 9.5 9.5 0 3.2-1.5 5.9-3.8 7.6C55.2 33.4 60 41.2 60 50.2c0 1.4-.4 2.6-1.8 2.6H39.8c-1.5-6.8-5.2-12.2-10.2-15.8 1.2-1.5 2-3.4 2-5.5C31.6 22.2 37 12 44 12Z"
          />
          <Circle cx="44" cy="14" r="5.2" fill="url(#rejRose)" />
          <Path
            fill={colors.backgroundPrimary}
            d="M32 34.5 27.2 39.3 32 44.1l4.8-4.8L32 34.5Z"
          />
        </Svg>
      </Animated.View>

      {shards.map((shard) => {
        const originX = shard.side === "plum" ? -size * 0.12 : size * 0.12;
        const opacity = progress.interpolate({
          inputRange: [0, 0.12, 0.75, 1],
          outputRange: [0, 1, 1, 0],
        });
        const tx = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [originX, originX + shard.dx],
        });
        const ty = progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, shard.dy],
        });
        const rot = progress.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", shard.spin],
        });
        const sc = progress.interpolate({
          inputRange: [0, 0.35, 1],
          outputRange: [0.35, shard.scale, shard.scale * 0.7],
        });

        return (
          <Animated.View
            key={shard.id}
            pointerEvents="none"
            style={[
              styles.shard,
              {
                opacity,
                transform: [
                  { translateX: tx },
                  { translateY: ty },
                  { rotate: rot },
                  { scale: sc },
                ],
              },
            ]}
          >
            <ButterflyWing
              uid={shard.id}
              color={colors.brandPrimary}
              size={shard.size}
              rose={shard.side === "rose"}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  core: {
    alignItems: "center",
    justifyContent: "center",
  },
  shard: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
