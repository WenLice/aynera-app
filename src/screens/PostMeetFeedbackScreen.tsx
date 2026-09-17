import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import type { RootStackParamList } from "../navigation/types";
import { track } from "../state/analytics";
import { savePostMeetFeedback } from "../state/meetPlans";
import { colors, radius, spacing } from "../theme";
import { useResetScrollOnFocus } from "../utils/useResetScrollOnFocus";

type Props = NativeStackScreenProps<RootStackParamList, "PostMeetFeedback">;

export function PostMeetFeedbackScreen({ navigation, route }: Props) {
  const scrollRef = useResetScrollOnFocus();
  const { threadId } = route.params;
  const [didMeet, setDidMeet] = useState<"yes" | "not_yet" | "">("");
  const [comfortable, setComfortable] = useState<"yes" | "off" | "">("");
  const [seeAgain, setSeeAgain] = useState<"yes" | "maybe" | "no" | "">("");
  const [reportNote, setReportNote] = useState("");

  const save = () => {
    savePostMeetFeedback({
      threadId,
      didMeet,
      comfortable,
      seeAgain,
      reportNote: reportNote.trim(),
    });
    track("post_meet_feedback_completed", { threadId });
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
          <AppText variant="kicker" tone="rose">
            Private
          </AppText>
          <AppText variant="title">How did it go?</AppText>
          <AppText variant="body" tone="soft">
            This stays between you and Aynera
          </AppText>

          <AppText variant="label" tone="plum">
            Did you meet?
          </AppText>
          <Choice
            options={[
              { id: "yes", label: "Yes" },
              { id: "not_yet", label: "Not yet" },
            ]}
            value={didMeet}
            onChange={setDidMeet}
          />

          {didMeet === "yes" ? (
            <>
              <AppText variant="label" tone="plum">
                Did you feel comfortable and respected?
              </AppText>
              <Choice
                options={[
                  { id: "yes", label: "Yes" },
                  { id: "off", label: "Something felt off" },
                ]}
                value={comfortable}
                onChange={setComfortable}
              />

              <AppText variant="label" tone="plum">
                Would you like to see them again?
              </AppText>
              <Choice
                options={[
                  { id: "yes", label: "Yes" },
                  { id: "maybe", label: "Maybe" },
                  { id: "no", label: "No" },
                ]}
                value={seeAgain}
                onChange={setSeeAgain}
              />
            </>
          ) : null}

          {comfortable === "off" ? (
            <>
              <AppText variant="label" tone="plum">
                Tell us what happened
              </AppText>
              <Field
                value={reportNote}
                onChangeText={setReportNote}
                placeholder="Only what you want to share"
                multiline
              />
              <AppText variant="meta" tone="muted">
                Reporting is always available .. write to grievance@aynera.in.
                Aynera is not an emergency service
              </AppText>
            </>
          ) : null}

          <Button
            label="Save privately"
            disabled={!didMeet}
            onPress={save}
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

function Choice<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T | "";
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.choices}>
      {options.map((opt) => {
        const on = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[styles.choice, on && styles.choiceOn]}
          >
            <AppText variant="label" tone={on ? "inverse" : "plum"}>
              {opt.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  safe: { flex: 1 },
  scroll: { padding: spacing.xl, gap: spacing.md, paddingBottom: spacing.xxxl },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfacePrimary,
  },
  choiceOn: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
});
