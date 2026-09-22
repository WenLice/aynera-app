import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import type { RootStackParamList } from "../navigation/types";
import { gatheringKindLabel } from "../data/gatherings";
import { track } from "../state/analytics";
import {
  getGathering,
  isAttended,
  isInterested,
  markAttended,
  markInterested,
  subscribeGatherings,
} from "../state/gatherings";
import { colors, radius, spacing } from "../theme";
import { useEffect, useSyncExternalStore } from "react";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

type Props = NativeStackScreenProps<RootStackParamList, "GatheringDetail">;

export function GatheringDetailScreen({ navigation, route }: Props) {
  const scrollRef = useResetScrollOnFocus();
  const gatheringId = route.params.gatheringId;
  useSyncExternalStore(subscribeGatherings, () =>
    `${isInterested(gatheringId) ? 1 : 0}:${isAttended(gatheringId) ? 1 : 0}`,
  );
  const gathering = getGathering(route.params.gatheringId);
  const interested = gathering ? isInterested(gathering.id) : false;
  const attended = gathering ? isAttended(gathering.id) : false;

  useEffect(() => {
    if (gathering) track("vibe_gathering_viewed", { id: gathering.id });
  }, [gathering?.id]);

  if (!gathering) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppText variant="title">This gathering has closed</AppText>
        <Button label="Back" onPress={() => navigation.goBack()} />
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
            {gatheringKindLabel(gathering)}
          </AppText>
          <AppText variant="title">{gathering.title}</AppText>
          <AppText variant="letter" tone="soft" style={styles.lead}>
            {gathering.shortDescription}
          </AppText>

          <Row label="When" value={`${gathering.dateLabel} .. ${gathering.timeLabel}`} />
          <Row label="Where" value={`${gathering.area}, ${gathering.city}`} />
          <Row
            label="Group size"
            value={
              gathering.spotsLeft != null
                ? `${gathering.spotsLeft} places left`
                : gathering.groupSizeLabel
            }
          />
          {gathering.venueName ? (
            <Row label="Venue" value={gathering.venueName} />
          ) : null}

          <Block title="Vibe behind this gathering">
            <AppText variant="body" tone="soft">
              {gathering.vibeTags.join(" .. ")}
            </AppText>
          </Block>

          <Block title="What to expect">
            {gathering.expect.map((line) => (
              <AppText key={line} variant="body" tone="soft">
                {line}
              </AppText>
            ))}
          </Block>

          <Block title="Host / community">
            {gathering.hostRules.map((line) => (
              <AppText key={line} variant="body" tone="soft">
                {line}
              </AppText>
            ))}
          </Block>

          <Block title="Safety">
            {gathering.safety.map((line) => (
              <AppText key={line} variant="body" tone="soft">
                {line}
              </AppText>
            ))}
          </Block>
        </ScrollView>

        <View style={styles.footer}>
          {attended ? (
            <Button
              label="Anyone you'd like to cross paths with again?"
              onPress={() =>
                navigation.navigate("GatheringReconnect", {
                  gatheringId: gathering.id,
                })
              }
            />
          ) : interested ? (
            <>
              <Button
                label="I was there"
                onPress={() => markAttended(gathering.id)}
              />
              <AppText variant="meta" tone="muted" center>
                {gathering.cta === "request"
                  ? "Place requested .. we'll write if it opens"
                  : "Interest noted .. we'll write if a place opens"}
              </AppText>
            </>
          ) : (
            <Button
              label={
                gathering.cta === "request" ? "Request a place" : "I'm interested"
              }
              onPress={() => {
                markInterested(gathering.id);
                track("vibe_gathering_interest", { id: gathering.id });
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="kicker" tone="muted">
        {label}
      </AppText>
      <AppText variant="body" tone="ink">
        {value}
      </AppText>
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.block}>
      <AppText variant="label" tone="plum">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  safe: { flex: 1 },
  back: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  scroll: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  lead: { maxWidth: 360 },
  row: { gap: 4 },
  block: { gap: spacing.sm },
  footer: {
    padding: spacing.xl,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderPrimary,
    backgroundColor: colors.surfacePrimary,
  },
});
