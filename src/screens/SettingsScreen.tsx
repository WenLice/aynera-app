import { useState, useSyncExternalStore } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { CommonActions } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { Sheet } from "../components/Sheet";
import { resetKhat } from "../state/khat";
import { resetLikes } from "../state/likes";
import { resetMeetGuide } from "../state/meetGuide";
import {
  getPrivacyPreference,
  hidePeopleAvailable,
  setHideContacts,
} from "../state/privacy";
import {
  getProfileDraft,
  publishedVitals,
  resetProfileDraft,
  subscribeProfileDraft,
} from "../state/profileDraft";
import {
  BELIEF_QUESTIONS,
  LIFESTYLE_QUESTIONS,
  formatHeight,
} from "../data/lifestyleOptions";
import { resetCircle } from "../state/circle";
import { resetGatherings } from "../state/gatherings";
import { resetMeetPlans } from "../state/meetPlans";
import { resetOpenings } from "../state/openings";
import { resetPrivacy } from "../state/privacy";
import { resetThreads } from "../state/threads";
import { INTENT_OUTCOMES } from "../data/profileOptions";
import { colors, elevation, radius, spacing } from "../theme";
import { selectTap } from "../utils/feedback";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const scrollRef = useResetScrollOnFocus();
  const draft = useSyncExternalStore(subscribeProfileDraft, getProfileDraft);
  const [paused, setPaused] = useState(false);
  const [letters, setLetters] = useState(draft.notificationsOn);
  const [replies, setReplies] = useState(draft.notificationsOn);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const shown = [
    ...publishedVitals(draft.lifestyle, LIFESTYLE_QUESTIONS),
    ...publishedVitals(draft.beliefs, BELIEF_QUESTIONS),
  ];
  const everydayValue = shown.length
    ? `${shown.length} shown on your profile`
    : "Nothing shared yet";

  const startOver = () => {
    resetProfileDraft();
    resetThreads();
    resetKhat();
    resetLikes();
    resetMeetGuide();
    resetCircle();
    resetGatherings();
    resetMeetPlans();
    resetOpenings();
    resetPrivacy();
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: "Splash" }] }),
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.top}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.circle, pressed && styles.pressed]}
          >
            <AppText variant="label" tone="plum">
              ‹
            </AppText>
          </Pressable>
          <AppText variant="section" tone="ink">
            Settings
          </AppText>
          <View style={styles.spacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Group title="Your presence">
            <ToggleRow
              label="Pause my introductions"
              hint={
                paused
                  ? "You're away. Nobody new will be shown your introduction."
                  : "Step away without losing anything you've written."
              }
              value={paused}
              onChange={setPaused}
            />
          </Group>

          <Group title="What reaches you">
            <ToggleRow
              label="A new introduction is ready"
              hint="One quiet note when your next letter arrives."
              value={letters}
              onChange={setLetters}
            />
            <ToggleRow
              label="Someone wrote back"
              hint="Only for people already in your correspondence."
              value={replies}
              onChange={setReplies}
            />
          </Group>

          <Group title="Sign-in details">
            <LinkRow
              label="Phone"
              value={
                draft.phone
                  ? `+91 ${draft.phone}${draft.phoneVerified ? " · confirmed" : " · not confirmed"}`
                  : "Not set"
              }
              onPress={() => navigation.navigate("ProfileSetup", { startAt: "life" })}
            />
            <LinkRow
              label="Email"
              value={
                draft.email
                  ? `${draft.email}${draft.emailVerified ? " · confirmed" : " · not confirmed"}`
                  : "Not set"
              }
              onPress={() => navigation.navigate("ProfileSetup", { startAt: "life" })}
            />
            <AppText variant="meta" tone="muted" style={styles.trustCopy}>
              Neither ever appears on your profile, and nobody can find you by
              searching for them.
            </AppText>
          </Group>

          <Group title="Your details">
            <LinkRow
              label="City"
              value={draft.city || "Not set"}
              onPress={() => navigation.navigate("ProfileSetup", { startAt: "life" })}
            />
            <LinkRow
              label="Height and hometown"
              value={
                [
                  draft.heightCm ? formatHeight(draft.heightCm) : null,
                  draft.hometown.trim() || null,
                ]
                  .filter(Boolean)
                  .join(" · ") || "Not set"
              }
              onPress={() =>
                navigation.navigate("ProfileSetup", { startAt: "basics" })
              }
            />
            <LinkRow
              label="Your everyday"
              value={everydayValue}
              onPress={() =>
                navigation.navigate("ProfileSetup", { startAt: "everyday" })
              }
            />
            <LinkRow
              label="Age range for introductions"
              value={`${draft.ageMin}–${draft.ageMax}${draft.ageFlexible ? " · flexible" : ""}`}
              onPress={() => navigation.navigate("ProfileSetup", { startAt: "intent" })}
            />
            <LinkRow
              label="What you're here for"
              value={
                INTENT_OUTCOMES.find((i) => i.id === draft.intentOutcome)?.label ||
                "Not set"
              }
              onPress={() => navigation.navigate("ProfileSetup", { startAt: "intent" })}
            />
          </Group>

          <Group title="Privacy">
            <AppText variant="body" tone="soft">
              Hide people I know
            </AppText>
            <AppText variant="meta" tone="muted">
              Help keep your Aynera circle separate from people you'd rather not meet here
            </AppText>
            <ToggleRow
              label="Contacts"
              hint={
                hidePeopleAvailable()
                  ? "Uses a private check .. we don't upload your raw contact list"
                  : "Coming soon .. this stays off until private matching is ready"
              }
              value={hidePeopleAvailable() && getPrivacyPreference().hideContacts}
              onChange={setHideContacts}
              disabled={!hidePeopleAvailable()}
            />
            <LinkRow
              label="Specific phone numbers"
              value="Coming soon"
              onPress={() => undefined}
            />
            <LinkRow
              label="Previously blocked profiles"
              value="Coming soon"
              onPress={() => undefined}
            />
          </Group>

          <Group title="Trust">
            <AppText variant="body" tone="soft" style={styles.trustCopy}>
              Every introduction is read by a person before it reaches Duos.
              Reporting or blocking is always private, and never announced to
              the other member.
            </AppText>
            <AppText variant="meta" tone="muted" style={styles.trustCopy}>
              Write to grievance@aynera.in. Aynera is not an emergency service.
            </AppText>
          </Group>

          <Group title="Account">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              onPress={startOver}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowCopy}>
                <AppText variant="label" tone="ink">
                  Sign out
                </AppText>
                <AppText variant="meta" tone="muted">
                  Come back anytime from this phone.
                </AppText>
              </View>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete my account"
              onPress={() => {
                selectTap();
                setConfirmDelete(true);
              }}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowCopy}>
                <AppText variant="label" style={styles.danger}>
                  Delete my account
                </AppText>
                <AppText variant="meta" tone="muted">
                  Removes your introduction, letters, and photos.
                </AppText>
              </View>
            </Pressable>
          </Group>

          <AppText variant="micro" tone="muted" center style={styles.version}>
            Aynera · Bangalore first · Delhi and Mumbai next
          </AppText>
        </ScrollView>
      </SafeAreaView>

      <Sheet visible={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <AppText variant="kicker" tone="rose">
          Before you go
        </AppText>
        <AppText variant="title" style={styles.sheetTitle}>
          Delete everything?
        </AppText>
        <AppText variant="body" tone="soft" style={styles.sheetBody}>
          Your introduction, your letters, and every photo you picked will be
          removed. Anyone mid-correspondence with you will simply see the
          chapter close.
        </AppText>
        <Button
          label="Delete my account"
          onPress={() => {
            setConfirmDelete(false);
            startOver();
          }}
        />
        <Button
          label="Keep my account"
          variant="ghost"
          haptic={false}
          onPress={() => setConfirmDelete(false)}
        />
      </Sheet>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <AppText variant="kicker" tone="rose">
        {title}
      </AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <AppText variant="label" tone="ink">
          {label}
        </AppText>
        <AppText variant="meta" tone="muted">
          {hint}
        </AppText>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={(next) => {
          selectTap();
          onChange(next);
        }}
        accessibilityLabel={label}
        trackColor={{ true: colors.brandPrimary, false: colors.borderStrong }}
        thumbColor={colors.textOnPrimary}
      />
    </View>
  );
}

function LinkRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowCopy}>
        <AppText variant="label" tone="ink">
          {label}
        </AppText>
        <AppText variant="meta" tone="muted">
          {value}
        </AppText>
      </View>
      <AppText variant="label" tone="muted">
        ›
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  safe: { flex: 1 },
  pressed: { opacity: 0.75 },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSoft,
  },
  spacer: { width: 40 },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  group: { gap: spacing.sm },
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.surfacePrimary,
    paddingHorizontal: spacing.lg,
    ...elevation.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.base,
    paddingVertical: spacing.base,
  },
  rowCopy: { flex: 1, flexShrink: 1, minWidth: 0, gap: 4, paddingRight: spacing.sm },
  danger: { color: colors.danger },
  sheetTitle: { marginTop: spacing.xs },
  sheetBody: { marginBottom: spacing.md },
  version: { marginTop: spacing.sm },
  trustCopy: { paddingVertical: spacing.base },
});
