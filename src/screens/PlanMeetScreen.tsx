import { useState } from "react";
import { ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import type { RootStackParamList } from "../navigation/types";
import { track } from "../state/analytics";
import { saveMeetPlan } from "../state/meetPlans";
import { colors, spacing } from "../theme";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

type Props = NativeStackScreenProps<RootStackParamList, "PlanMeet">;

export function PlanMeetScreen({ navigation, route }: Props) {
  const scrollRef = useResetScrollOnFocus();
  const { threadId } = route.params;
  const [place, setPlace] = useState("");
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");
  const [trusted, setTrusted] = useState(false);

  const ready = place.trim().length > 3 && when.trim().length > 3;

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
          <AppText variant="kicker" tone="rose">
            First meet
          </AppText>
          <AppText variant="title">Plan a first meet</AppText>
          <AppText variant="body" tone="soft">
            Meet somewhere public that feels comfortable for both of you
          </AppText>

          <AppText variant="label" tone="plum">
            A public place
          </AppText>
          <Field
            value={place}
            onChangeText={setPlace}
            placeholder="Café, bookshop, park .."
          />

          <AppText variant="label" tone="plum">
            Date / time
          </AppText>
          <Field
            value={when}
            onChangeText={setWhen}
            placeholder="Sunday afternoon .."
          />

          <AppText variant="label" tone="plum">
            Optional note
          </AppText>
          <Field
            value={note}
            onChangeText={setNote}
            placeholder="Anything that helps it feel easy"
            multiline
          />

          <View style={styles.row}>
            <View style={styles.flex}>
              <AppText variant="label" tone="ink">
                Share this plan with someone you trust
              </AppText>
              <AppText variant="micro" tone="muted">
                Optional check in .. Aynera is not an emergency service
              </AppText>
            </View>
            <Switch
              value={trusted}
              onValueChange={setTrusted}
              trackColor={{ true: colors.brandPrimary, false: colors.borderStrong }}
              thumbColor={colors.textOnPrimary}
            />
          </View>

          <Button
            label="Share the plan"
            disabled={!ready}
            onPress={() => {
              saveMeetPlan({
                threadId,
                place: place.trim(),
                when: when.trim(),
                note: note.trim(),
                sharedWithTrusted: trusted,
              });
              track("meet_plan_created", { threadId });
              navigation.goBack();
            }}
          />
          <Button
            label="Not now"
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  safe: { flex: 1 },
  scroll: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.base },
  flex: { flex: 1, gap: 2 },
});
