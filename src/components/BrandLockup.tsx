import { StyleSheet, Text, View } from "react-native";
import { brand, colors, fonts, spacing, typography } from "../theme";

type Props = {
  size?: "sm" | "lg";
  showTagline?: boolean;
  light?: boolean;
};

export function BrandLockup({
  size = "lg",
  showTagline = false,
  light = false,
}: Props) {
  // Match website: Aynera in plum, tagline in rose-gold when light
  const nameColor = light ? colors.textOnPrimary : colors.brandPrimary;

  return (
    <View style={styles.wrap}>
      <Text
        style={[
          styles.name,
          size === "sm" ? styles.nameSm : styles.nameLg,
          { color: nameColor },
        ]}
      >
        {brand.name}
      </Text>
      {showTagline ? (
        <Text style={[styles.tagline, light && styles.taglineLight]}>
          {brand.tagline}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: spacing.sm,
  },
  name: {
    fontFamily: fonts.display,
    letterSpacing: 0.5,
  },
  nameSm: {
    fontSize: typography.size.xl,
  },
  nameLg: {
    fontSize: typography.size.display,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: typography.size.base,
    color: colors.textSecondary,
    textAlign: "center",
  },
  taglineLight: {
    color: colors.onDark92,
  },
});
