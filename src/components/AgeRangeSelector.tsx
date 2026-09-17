import { useMemo, useRef, useState } from "react";
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

  const ageAt = (x: number) => {
    const clamped = Math.min(Math.max(x, 0), track);
    return Math.round(AGE_MIN + (clamped / track) * range);
  };

  const startMin = useRef(0);
  const startMax = useRef(0);

  const minResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startMin.current = minRef.current;
        },
        onPanResponderMove: (_e, g) => {
          const next = Math.min(
            ageAt(((startMin.current - AGE_MIN) / range) * track + g.dx),
            maxRef.current - 1,
          );
          onChangeRange(Math.max(AGE_MIN, next), maxRef.current);
        },
      }),
    [track, range, onChangeRange],
  );

  const maxResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startMax.current = maxRef.current;
        },
        onPanResponderMove: (_e, g) => {
          const next = Math.max(
            ageAt(((startMax.current - AGE_MIN) / range) * track + g.dx),
            minRef.current + 1,
          );
          onChangeRange(minRef.current, Math.min(AGE_MAX, next));
        },
      }),
    [track, range, onChangeRange],
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

      <View style={styles.trackWrap} onLayout={onLayout}>
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
