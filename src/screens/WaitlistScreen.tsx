import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { Atmosphere } from "../components/Atmosphere";
import type { RootStackParamList } from "../navigation/types";
import { spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Waitlist">;

export function WaitlistScreen({ navigation, route }: Props) {
  const city = route.params?.city ?? "your city";

  return (
    <Atmosphere tone="paper">
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <View style={styles.body}>
          <AppText variant="kicker" tone="rose">
            {city}
          </AppText>
          <AppText variant="title">You're on the waitlist</AppText>
          <AppText variant="body" tone="soft" style={styles.copy}>
            Aynera is opening Bangalore first. You can still look through this
            week's founding circle while {city} is next-city interest.
          </AppText>
        </View>
        <View style={styles.actions}>
          <Button
            label="Look around while you wait"
            onPress={() => navigation.replace("Main")}
          />
          <Button
            label="Back"
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeAreaView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: "space-between",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.md,
  },
  copy: { maxWidth: 340 },
  actions: { gap: spacing.sm },
});
