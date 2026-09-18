import { useCallback, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { AGE_MAX, AGE_MIN } from "../config/aynera";
import { colors, fonts, spacing, typography } from "../theme";
import { AppText } from "./AppText";

type Props = {
  minAge: number;
  maxAge: number;
  flexible: boolean;
  onChangeRange: (min: number, max: number) => void;
  onChangeFlexible: (next: boolean) => void;
};

const THUMB = 28;

export function AgeRangeSelector({
  minAge,
  maxAge,
  flexible,
  onChangeRange,
  onChangeFlexible,
}: Props) {
  const [width, setWidth] = useState(0);
  const minRef = useRef(minAge);
  const maxRef = useRef(maxAge);
  minRef.current = minAge;
  maxRef.current = maxAge;
  const range = AGE_MAX - AGE_MIN;
  const track = Math.max(width - THUMB, 1);

  const minX = ((minAge - AGE_MIN) / range) * track;
  const maxX = ((maxAge - AGE_MIN) / range) * track;

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  // Everything a gesture reads lives in a ref, so the two PanResponders below can be
  // created once. Rebuilding them mid-drag detaches the handler that owns the gesture,
  // which is why dragging a thumb used to move it a pixel and then stop dead.
  const trackRef = useRef(track);
  trackRef.current = track;
  const onChangeRef = useRef(onChangeRange);
  onChangeRef.current = onChangeRange;

  const ageAt = useCallback((x: number) => {
    const t = trackRef.current;
    const clamped = Math.min(Math.max(x, 0), t);
    return Math.round(AGE_MIN + (clamped / t) * range);
  }, []);

  const startMin = useRef(0);
  const startMax = useRef(0);

  const minResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startMin.current = minRef.current;
        },
        onPanResponderMove: (_e, g) => {
          const next = Math.min(
            ageAt(((startMin.current - AGE_MIN) / range) * trackRef.current + g.dx),
            maxRef.current - 1,
          );
          onChangeRef.current(Math.max(AGE_MIN, next), maxRef.current);
        },
      }),
    [ageAt],
  );

  const maxResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startMax.current = maxRef.current;
        },
        onPanResponderMove: (_e, g) => {
          const next = Math.max(
            ageAt(((startMax.current - AGE_MIN) / range) * trackRef.current + g.dx),
            minRef.current + 1,
          );
          onChangeRef.current(minRef.current, Math.min(AGE_MAX, next));
        },
      }),
    [ageAt],
  );

  const fillLeft = minX + THUMB / 2;
  const fillWidth = Math.max(maxX - minX, 0);

  return (
    <View style={styles.wrap}>
      <AppText variant="label" tone="plum">
        Who would you genuinely be comfortable meeting?
      </AppText>

      <View style={styles.labels}>
        <Text style={styles.age}>{minAge}</Text>
        <Text style={styles.age}>{maxAge}</Text>
      </View>

      <View
        style={styles.trackWrap}
        onLayout={onLayout}
        // Tapping the track moves the nearer thumb. The thumbs sit deeper in the tree, so
        // they win the responder when touched directly; this only catches taps that miss them.
        onStartShouldSetResponder={() => true}
        onResponderRelease={(e) => {
          const age = ageAt(e.nativeEvent.locationX - THUMB / 2);
          if (Math.abs(age - minAge) <= Math.abs(age - maxAge)) {
            onChangeRange(Math.min(Math.max(AGE_MIN, age), maxAge - 1), maxAge);
          } else {
            onChangeRange(minAge, Math.max(Math.min(AGE_MAX, age), minAge + 1));
          }
        }}
      >
        <View style={styles.track} />
        <View style={[styles.fill, { left: fillLeft, width: fillWidth }]} />
        <View
          style={[styles.thumb, { left: minX }]}
          {...minResponder.panHandlers}
          accessibilityLabel={`Minimum age ${minAge}`}
        />
        <View
          style={[styles.thumb, { left: maxX }]}
          {...maxResponder.panHandlers}
          accessibilityLabel={`Maximum age ${maxAge}`}
        />
      </View>

      <View style={styles.flexRow}>
        <View style={styles.flexCopy}>
          <AppText variant="label" tone="ink">
            Flexible by a couple of years
          </AppText>
          <AppText variant="micro" tone="muted">
            Used only for introductions
          </AppText>
        </View>
        <Switch
          value={flexible}
          onValueChange={onChangeFlexible}
          trackColor={{ true: colors.brandPrimary, false: colors.borderStrong }}
          thumbColor={colors.textOnPrimary}
          accessibilityLabel="Flexible by a couple of years"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  age: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xl,
    color: colors.brandPrimary,
  },
  trackWrap: {
    height: THUMB,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  fill: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brandPrimary,
  },
  thumb: {
    position: "absolute",
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.accentPrimaryPressed,
    borderWidth: 3,
    borderColor: colors.surfacePrimary,
    top: 0,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
  },
  flexCopy: { flex: 1, gap: 2 },
});
