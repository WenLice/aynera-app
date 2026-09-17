import { useMemo, useSyncExternalStore } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { ProfileStory } from "../components/ProfileStory";
import { ChipSelect } from "../components/ChipSelect";
import { draftToPerson } from "../state/draftToPerson";
import {
  getProfileDraft,
  subscribeProfileDraft,
} from "../state/profileDraft";
import { profileCompletion } from "../state/profileCompletion";
import { readProfile, type ProfileGap } from "../state/profileRead";
import { colors, elevation, radius, spacing } from "../theme";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

export function ProfileScreen() {
  const scrollRef = useResetScrollOnFocus();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft);
  const person = useMemo(() => draftToPerson(draft), [draft]);
  const read = useMemo(() => readProfile(draft), [draft]);
  const completion = useMemo(() => profileCompletion(draft), [draft]);

  const editTo = (target: ProfileGap["target"]) =>
    navigation.navigate("ProfileSetup", { startAt: target });

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppHeader
          meta={draft.submitted ? "Under review" : "Draft"}
          rightSlot={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              hitSlop={10}
              onPress={() => navigation.navigate("Settings")}
              style={({ pressed }) => [styles.gear, pressed && styles.pressed]}
            >
              <View style={styles.gearDot} />
              <View style={styles.gearDot} />
              <View style={styles.gearDot} />
            </Pressable>
          }
        />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {person ? (
            <>
              <View style={styles.banner}>
                <AppText variant="kicker" tone="rose">
                  Your profile
                </AppText>
                <AppText variant="title" tone="ink">
                  Your profile is {completion.percent}% complete
                </AppText>
                <AppText variant="body" tone="soft">
                  Optional after the minimum .. make it richer when you want
                </AppText>
                {completion.next.length ? (
                  <View style={styles.bannerActions}>
                    {completion.next.slice(0, 3).map((item) => (
                      <Button
                        key={item.label}
                        label={item.label}
                        size="sm"
                        variant="secondary"
                        onPress={() => editTo(item.target)}
                      />
                    ))}
                    <Button
                      label="Make it richer"
                      size="sm"
                      onPress={() => editTo(completion.next[0].target)}
                    />
                  </View>
                ) : (
                  <AppText variant="meta" tone="rose">
                    Looks like me
                  </AppText>
                )}
                <View style={styles.bannerActions}>
                  <Button
                    label="Open full preview"
                    size="sm"
                    onPress={() => navigation.navigate("Premiere")}
                  />
                </View>
                <AppText variant="meta" tone="muted">
                  Focus and Together are optional later states if both of you
                  want them .. not a required journey
                </AppText>
              </View>

              {/* The read used to live only in Premiere. It belongs here, where
                  people come back to improve things. */}
              <View style={styles.readCard}>
                <AppText variant="kicker" tone="rose">
                  How Aynera reads you
                </AppText>
                {read.lines.map((line) => (
                  <View key={line.kicker} style={styles.readLine}>
                    <AppText variant="label" tone="plum">
                      {line.kicker}
                    </AppText>
                    <AppText variant="body" tone="soft">
                      {line.body}
                    </AppText>
                  </View>
                ))}

                {read.gaps.length ? (
                  <View style={styles.gaps}>
                    <AppText variant="micro" tone="muted">
                      Still open
                    </AppText>
                    <View style={styles.gapRow}>
                      {read.gaps.map((gap) => (
                        <Pressable
                          key={gap.label}
                          accessibilityRole="button"
                          accessibilityLabel={`Add ${gap.label}`}
                          onPress={() => editTo(gap.target)}
                          style={({ pressed }) => [
                            styles.gapChip,
                            pressed && styles.pressed,
                          ]}
                        >
                          <AppText variant="meta" tone="plum">
                            {gap.label}
                          </AppText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ) : (
                  <AppText variant="meta" tone="rose">
                    Nothing missing. This reads like a person.
                  </AppText>
                )}
              </View>

                {draft.chips.length ? (
                  <View style={styles.tasteBlock}>
                    <AppText variant="label" tone="plum">
                      Your Vibe
                    </AppText>
                    <AppText variant="meta" tone="muted">
                      A little context around how you live .. not a compatibility score
                    </AppText>
                    <ChipSelect
                      options={draft.chips}
                      selected={draft.chips}
                      onToggle={() => undefined}
                      interactive={false}
                    />
                  </View>
                ) : null}

              <ProfileStory
                person={person}
                mode="self"
                viewerTaste={draft.chips}
                onEdit={(target) => editTo(target)}
              />
            </>
          ) : (
            <View style={styles.empty}>
              <AppText variant="title">Your profile isn't ready</AppText>
              <AppText variant="body" tone="soft">
                Finish your profile and you'll be able to premiere exactly how
                you appear in Duos — the same screen a stranger sees.
              </AppText>
              <View style={styles.emptyAction}>
                <Button
                  label="Continue where I left off"
                  onPress={() => navigation.navigate("ProfileSetup")}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  pressed: { opacity: 0.7, transform: [{ scale: 0.985 }] },
  gear: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    backgroundColor: colors.brandSoft,
  },
  gearDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.brandPrimary,
  },
  banner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.base,
    gap: spacing.xs,
  },
  bannerActions: {
    marginTop: spacing.md,
    alignItems: "flex-start",
    gap: spacing.sm,
    flexWrap: "wrap",
    flexDirection: "row",
  },
  tasteBlock: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  readCard: {
    margin: spacing.xl,
    marginBottom: spacing.base,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.accentSoft,
    gap: spacing.md,
    ...elevation.sm,
  },
  readLine: { gap: 2 },
  gaps: { gap: spacing.sm },
  gapRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  gapChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfacePrimary,
  },
  empty: { padding: spacing.xl, gap: spacing.md },
  emptyAction: { marginTop: spacing.sm },
});
