import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { ProfileStory } from "../components/ProfileStory";
import { MOCK_PEOPLE } from "../data/mockPeople";
import { colors, elevation, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

type Props = NativeStackScreenProps<RootStackParamList, "Sample">;

/**
 * Same introduction component + palette Meet uses — so the sample sets the
 * real bar, not a differently colored preview.
 */
export function SampleScreen({ navigation }: Props) {
  const scrollRef = useResetScrollOnFocus();
  const person = MOCK_PEOPLE[0];
  const [reachedEnd, setReachedEnd] = useState(false);
  const bar = useRef(new Animated.Value(0)).current;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const progress =
      contentSize.height <= layoutMeasurement.height
        ? 1
        : contentOffset.y / (contentSize.height - layoutMeasurement.height);
    bar.setValue(Math.max(0, Math.min(1, progress)));
    if (progress > 0.9 && !reachedEnd) setReachedEnd(true);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <ProfileStory person={person} mode="meet" />

        <View style={styles.closing}>
          <AppText variant="kicker" tone="rose">
            This is the bar
          </AppText>
          <AppText variant="title" style={styles.closingTitle}>
            Five photos, one video, two real answers.
          </AppText>
          <AppText variant="body" tone="soft">
            Nothing here is clever. It's specific — a face, a room, a habit, a
            thing she'd actually say out loud. That's all anyone is asking of you.
          </AppText>
        </View>
      </ScrollView>

      <SafeAreaView edges={["top"]} style={styles.topBar} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <AppText variant="micro" tone="inverse">
            Close
          </AppText>
        </Pressable>
        <View style={styles.track}>
          <Animated.View
            style={[
              styles.fill,
              { transform: [{ scaleX: bar }] },
            ]}
          />
        </View>
      </SafeAreaView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <Button
          label="Join the founding circle"
          onPress={() => navigation.replace("ProfileSetup")}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  /** Same paper ground Meet uses while reading an introduction. */
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  scroll: { paddingBottom: 132 },
  closing: {
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.surfacePrimary,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  closingTitle: { marginBottom: spacing.xs },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  back: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.scrim55,
    borderWidth: 1,
    borderColor: colors.onDark24,
  },
  track: {
    height: 2,
    marginHorizontal: spacing.sm,
    borderRadius: 999,
    backgroundColor: colors.onDark24,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    width: "100%",
    backgroundColor: colors.accentPrimary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surfacePrimary,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    ...elevation.lg,
  },
});
