import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { VitalIcon, type VitalIconId } from "./VitalIcon";
import type { PersonProfile } from "../data/mockPeople";
import { colors, elevation, fonts, radius, spacing, typography } from "../theme";

export type VitalCell = { key: string; icon: VitalIconId; value: string };
export type VitalRow = {
  key: string;
  icon: VitalIconId;
  value: string;
  sub?: string;
};

/** Short facts — they slide sideways so the card stays one screen tall. */
const STRIP: { label: string; icon: VitalIconId }[] = [
  { label: "Open to", icon: "person" },
  { label: "Height", icon: "height" },
  { label: "Drinks", icon: "drink" },
  { label: "Smokes", icon: "smoke" },
  { label: "Food", icon: "food" },
  { label: "Movement", icon: "movement" },
];

/** Read up front. */
const FIRST_ROWS: { label: string; icon: VitalIconId }[] = [
  { label: "Faith", icon: "faith" },
  { label: "From", icon: "home" },
];

/** Held back for later in the scroll. */
const LATER_ROWS: { label: string; icon: VitalIconId }[] = [
  { label: "Family", icon: "family" },
  { label: "Children", icon: "child" },
];

/**
 * Turns a profile into the three groups the introduction reads in: a sliding
 * strip of short facts, a few rows up front, and the rest kept for later.
 */
export function readVitals(person: PersonProfile) {
  const value = (label: string) =>
    person.vitals.find((v) => v.label === label)?.value;

  const strip: VitalCell[] = [];
  if (person.age > 0) {
    strip.push({ key: "Age", icon: "age", value: String(person.age) });
  }
  const place = person.area ?? person.city;
  if (place) strip.push({ key: "Area", icon: "place", value: place });
  for (const item of STRIP) {
    const found = value(item.label);
    if (found) strip.push({ key: item.label, icon: item.icon, value: found });
  }

  const rows: VitalRow[] = [];
  if (person.work) {
    rows.push({ key: "Work", icon: "work", value: person.work });
  }
  for (const item of FIRST_ROWS) {
    const found = value(item.label);
    if (found) rows.push({ key: item.label, icon: item.icon, value: found });
  }
  if (person.intent) {
    rows.push({
      key: "Intent",
      icon: "intent",
      value: person.intent,
      sub: person.track || undefined,
    });
  }

  const later: VitalRow[] = [];
  for (const item of LATER_ROWS) {
    const found = value(item.label);
    if (found) later.push({ key: item.label, icon: item.icon, value: found });
  }

  return { strip, rows, later };
}

/** The card that sits under the opening photos. */
export function VitalsPanel({
  strip,
  rows,
  footer,
}: {
  strip: VitalCell[];
  rows: VitalRow[];
  footer?: React.ReactNode;
}) {
  if (!strip.length && !rows.length) return null;

  return (
    <View style={styles.card}>
      {strip.length ? (
        <View style={styles.stripWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.strip}
          >
            {strip.map((cell, i) => (
              <View
                key={cell.key}
                style={[styles.cell, i < strip.length - 1 && styles.cellDivide]}
              >
                <VitalIcon id={cell.icon} size={19} color={colors.brandSecondary} />
                <Text style={styles.cellValue} numberOfLines={1}>
                  {cell.value}
                </Text>
              </View>
            ))}
          </ScrollView>
          {/* Fades the last cell so it reads as "there's more sideways". */}
          <LinearGradient
            pointerEvents="none"
            colors={["rgba(255,255,255,0)", colors.surfacePrimary]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.fade}
          />
        </View>
      ) : null}

      {rows.length ? <VitalRows rows={rows} /> : null}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

/** The same rows, reusable for the set held back until later. */
export function VitalRows({ rows }: { rows: VitalRow[] }) {
  return (
    <View>
      {rows.map((row, i) => (
        <View key={row.key}>
          {i > 0 ? <View style={styles.rule} /> : null}
          <View style={styles.row}>
            <VitalIcon id={row.icon} size={21} color={colors.brandPrimary} />
            <View style={styles.rowCopy}>
              <Text style={styles.rowValue}>{row.value}</Text>
              {row.sub ? <Text style={styles.rowSub}>{row.sub}</Text> : null}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    overflow: "hidden",
    ...elevation.sm,
  },
  stripWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderPrimary,
  },
  strip: {
    alignItems: "center",
  },
  cell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  cellDivide: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.borderPrimary,
  },
  cellValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.md,
    color: colors.textPrimary,
  },
  fade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 28,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.base,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.md,
    lineHeight: typography.size.md + 6,
    color: colors.textPrimary,
  },
  rowSub: {
    fontFamily: fonts.body,
    fontSize: typography.size.base,
    lineHeight: typography.size.base + 6,
    color: colors.textTertiary,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderPrimary,
    marginHorizontal: spacing.lg,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: "flex-start",
  },
});
