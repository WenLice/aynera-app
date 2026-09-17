import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { MOCK_PEOPLE } from "../data/mockPeople";
import type { RootStackParamList } from "../navigation/types";
import { track } from "../state/analytics";
import {
  getGathering,
  getReconnectChoice,
  setReconnectChoice,
  subscribeGatherings,
} from "../state/gatherings";
import { colors, radius, spacing } from "../theme";
import { useSyncExternalStore } from "react";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

type Props = NativeStackScreenProps<RootStackParamList, "GatheringReconnect">;

export function GatheringReconnectScreen({ navigation, route }: Props) {
  const scrollRef = useResetScrollOnFocus();
  const gatheringId = route.params.gatheringId;
  useSyncExternalStore(subscribeGatherings, () =>
    getReconnectSnapshot(gatheringId),
  );
  const gathering = getGathering(gatheringId);
  const people = gathering?.attendeeIds
    ? MOCK_PEOPLE.filter((p) => gathering.attendeeIds?.includes(p.id))
    : [];

  if (!gathering) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppText variant="title">This gathering has closed</AppText>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <AppText variant="label" tone="plum">
            ‹ Back
          </AppText>
        </Pressable>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
          <AppText variant="kicker" tone="rose">
            After {gathering.title}
          </AppText>
          <AppText variant="title">
            Anyone you'd like to cross paths with again?
          </AppText>
          <AppText variant="body" tone="soft">
            Choose privately .. nothing happens unless they choose you too
          </AppText>

          {people.length ? (
            people.map((person) => {
            const choice = getReconnectChoice(gathering.id, person.id);
            return (
              <View key={person.id} style={styles.card}>
                <AppText variant="section">{person.name}</AppText>
                <AppText variant="meta" tone="muted">
                  {person.work} .. {person.area ?? person.city}
                </AppText>
                {choice ? (
                  <>
                    <AppText variant="meta" tone="plum">
                      {choice === "meet_again" ? "Would meet again" : "Not for me"}
                    </AppText>
                    {choice === "meet_again" ? (
                      <AppText variant="body" tone="soft">
                        Noted privately .. you'll hear if they choose you too
                      </AppText>
                    ) : null}
                  </>
                ) : (
                  <View style={styles.row}>
                    <Button
                      size="sm"
                      label="Would meet again"
                      onPress={() => {
                        setReconnectChoice(gathering.id, person.id, "meet_again");
                        track("reconnect_choice_submitted", {
                          gatheringId: gathering.id,
                          personId: person.id,
                        });
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      label="Not for me"
                      onPress={() =>
                        setReconnectChoice(gathering.id, person.id, "not_for_me")
                      }
                    />
                  </View>
                )}
              </View>
            );
          })
          ) : (
            <AppText variant="body" tone="soft">
              People you sat with will appear here after a gathering
            </AppText>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getReconnectSnapshot(gatheringId: string) {
  const gathering = getGathering(gatheringId);
  const ids = gathering?.attendeeIds ?? [];
  return ids
    .map((id) => `${id}:${getReconnectChoice(gatheringId, id) ?? ""}`)
    .join("|");
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  safe: { flex: 1 },
  back: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  scroll: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxxl },
  card: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
