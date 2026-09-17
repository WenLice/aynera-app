import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandMark } from "./BrandMark";
import { brand, colors, fonts, spacing, typography } from "../theme";

type Props = {
  meta?: string;
  /** Float over a full-bleed hero */
  overlay?: boolean;
  /** Only show the mark (cleaner on photography) */
  markOnly?: boolean;
  rightSlot?: ReactNode;
  onMarkPress?: () => void;
};

/** Shared app chrome — respects status bar; optional mark-only on hero. */
export function AppHeader({ meta, overlay, markOnly, rightSlot, onMarkPress }: Props) {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, 8) + (overlay ? 6 : 4);

  return (
    <View
      style={[
        styles.bar,
        overlay && styles.barOverlay,
        { paddingTop: topPad },
      ]}
    >
      <View style={styles.brandRow}>
        <Pressable
          disabled={!onMarkPress}
          onPress={onMarkPress}
          accessibilityRole={onMarkPress ? "button" : undefined}
          accessibilityLabel={onMarkPress ? "Back to Meet" : undefined}
          hitSlop={10}
        >
          <View style={[styles.markDisk, overlay && styles.markDiskOverlay]}>
            <BrandMark size={overlay ? 22 : 24} />
          </View>
        </Pressable>
        {!markOnly ? (
          <Text style={[styles.brand, overlay && styles.brandOverlay]}>
            {brand.name}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>
        {meta ? (
          <Text style={[styles.meta, overlay && styles.metaOverlay]}>{meta}</Text>
        ) : null}
        {rightSlot}
      </View>
    </View>
  );
}

export function HeaderMenuButton({
  onPress,
  overlay,
}: {
  onPress: () => void;
  overlay?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={[styles.menuBtn, overlay && styles.menuBtnOverlay]}
    >
      <Text style={[styles.menuDots, overlay && styles.menuDotsOverlay]}>···</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    backgroundColor: colors.surfacePrimary,
    zIndex: 10,
  },
  barOverlay: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  markDisk: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  markDiskOverlay: {
    backgroundColor: colors.scrim30,
    borderWidth: 1,
    borderColor: colors.onDark24,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: typography.size.xl,
    color: colors.brandPrimary,
    letterSpacing: 0.3,
  },
  brandOverlay: {
    color: colors.textOnPrimary,
    textShadowColor: colors.scrim42,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  brandAccent: {
    color: colors.accentPrimaryPressed,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  meta: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  metaOverlay: {
    color: colors.onDark92,
    textShadowColor: colors.scrim42,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  menuBtnOverlay: {
    backgroundColor: colors.scrim30,
  },
  menuDots: {
    color: colors.brandPrimary,
    fontSize: typography.size.md,
    fontWeight: "800",
    letterSpacing: 1,
  },
  menuDotsOverlay: {
    color: colors.textOnPrimary,
  },
});
