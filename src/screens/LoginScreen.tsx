import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { loginWithPassword, requestOtp, verifyOtp } from "../api/auth";
import { ApiError } from "../api/client";
import { getMyAdmission } from "../api/members";
import type { MemberAdmission, TokenPayload } from "../api/types";
import { routeFor } from "../auth/bootstrap";
import { saveSession } from "../auth/session";
import { AppText } from "../components/AppText";
import { Atmosphere } from "../components/Atmosphere";
import { BrandMark } from "../components/BrandMark";
import { Button } from "../components/Button";
import { CodeInput, CODE_LENGTH } from "../components/CodeInput";
import { Field } from "../components/Field";
import { loadLaunchCities } from "../data/cities";
import type { RootStackParamList } from "../navigation/types";
import { calm, colors, elevation, motion, radius, spacing } from "../theme";
import { useReduceMotion } from "../utils/useReduceMotion";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

type Step = "identifier" | "code" | "password";

const RESEND_SECONDS = 30;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";
  switch (error.code) {
    case "user_not_found":
      return "We don't have an account for that yet. Join the founding circle first.";
    case "invalid_identifier":
      return "Enter the mobile number or email you registered with.";
    case "otp_rate_limited":
      return "Too many codes requested. Please wait a few minutes.";
    case "otp_expired":
      return "That code has expired. Send a new one.";
    case "otp_invalid":
      return "That code isn't right. Check it and try again.";
    case "otp_locked":
      return "Too many wrong codes. Send a new one to continue.";
    case "password_not_set":
      return "This account has no password yet — sign in with a code instead.";
    case "password_invalid":
      return "That password isn't right.";
    case "account_locked":
      return "Too many attempts. Please try again later.";
    case "account_deactivated":
      return "This account is deactivated. Reactivation from the app is coming soon.";
    case "account_restricted":
      return "This account can't sign in right now. Please contact support.";
    case "network_error":
    case "request_timeout":
      return "We couldn't reach Aynera. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/** Masks what we echo back: 98xxxx1234 · a•••@example.com */
function maskIdentifier(id: string) {
  if (id.includes("@")) {
    const [user, domain] = id.split("@");
    return `${user.slice(0, 1)}•••@${domain}`;
  }
  const digits = id.replace(/\D/g, "");
  return `${digits.slice(0, 2)}xxxx${digits.slice(-4)}`;
}

const COPY: Record<Step, { kicker: string; title: string; line: string }> = {
  identifier: {
    kicker: "Welcome back",
    title: "Sign in to your circle.",
    line: "Your introductions are exactly where you left them.",
  },
  code: {
    kicker: "One-time code",
    title: "Enter the six digits.",
    line: "Demo: nothing is sent — any six digits sign you in.",
  },
  password: {
    kicker: "Welcome back",
    title: "Your password.",
    line: "Or switch to a one-time code — both open the same door.",
  },
};

/** Sign-in for members who already applied: a one-time code, or a password. */
export function LoginScreen({ navigation }: Props) {
  const reduced = useReduceMotion();
  const enter = useRef(new Animated.Value(0)).current;

  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  const id = identifier.trim();
  const idValid = id.includes("@") ? EMAIL.test(id) : id.replace(/\D/g, "").length >= 10;

  // Each step rises in like the Welcome screen, so the card never just pops.
  useEffect(() => {
    enter.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: calm(motion.duration.calm, reduced),
      easing: motion.easing.enter,
      useNativeDriver: true,
    }).start();
  }, [step, enter, reduced]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  async function run<T>(work: () => Promise<T>, then: (result: T) => void | Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await then(await work());
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  function sendCode() {
    void run(
      () => requestOtp(id),
      () => {
        setCode("");
        setResendIn(RESEND_SECONDS);
        setStep("code");
      },
    );
  }

  async function finish(tokens: TokenPayload) {
    await saveSession({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
    await loadLaunchCities();
    let admission: MemberAdmission | null = null;
    try {
      admission = await getMyAdmission();
    } catch {
      /* route on the account alone */
    }
    const route = routeFor(tokens.account, admission);
    navigation.reset({
      index: 0,
      routes: [
        route.name === "Waitlist" || route.name === "PendingReview"
          ? { name: route.name, params: route.params }
          : { name: route.name },
      ],
    });
  }

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  const copy = COPY[step];
  const rise = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
    ],
  };

  return (
    <Atmosphere tone="paper">
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.topRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              onPress={() =>
                step === "identifier" ? navigation.goBack() : goTo("identifier")
              }
              style={({ pressed }) => [styles.circle, pressed && styles.pressed]}
            >
              <AppText variant="label" tone="plum">
                ‹
              </AppText>
            </Pressable>
            <View style={styles.brandRow}>
              <BrandMark size={22} />
              <AppText variant="section" tone="plum">
                Aynera
              </AppText>
            </View>
            <View style={styles.spacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.hero, rise]}>
              <AppText variant="kicker" tone="rose">
                {copy.kicker}
              </AppText>
              <AppText variant="title" tone="ink">
                {copy.title}
              </AppText>
              <AppText variant="letter" tone="soft" style={styles.line}>
                {copy.line}
              </AppText>
            </Animated.View>

            <Animated.View style={[styles.card, rise]}>
              {step === "identifier" ? (
                <>
                  <AppText variant="label" tone="ink">
                    Mobile number or email
                  </AppText>
                  <Field
                    placeholder="98765 43210 or you@example.com"
                    value={identifier}
                    onChangeText={setIdentifier}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="username"
                    autoComplete="username"
                    returnKeyType="send"
                    onSubmitEditing={() => idValid && sendCode()}
                    autoFocus
                  />
                  <Button
                    label={busy ? "Sending…" : "Send me a code"}
                    loading={busy}
                    disabled={!idValid}
                    onPress={sendCode}
                  />
                  <View style={styles.orRow}>
                    <View style={styles.rule} />
                    <AppText variant="micro" tone="muted">
                      or
                    </AppText>
                    <View style={styles.rule} />
                  </View>
                  <Button
                    label="Sign in with password"
                    variant="secondary"
                    disabled={!idValid || busy}
                    haptic={false}
                    onPress={() => goTo("password")}
                  />
                </>
              ) : null}

              {step === "code" ? (
                <>
                  <AppText variant="body" tone="soft" center>
                    Sent to {maskIdentifier(id)}
                  </AppText>
                  <CodeInput value={code} onChange={setCode} autoFocus />
                  <Button
                    label={busy ? "Checking…" : "Sign in"}
                    loading={busy}
                    disabled={code.length < CODE_LENGTH}
                    onPress={() => void run(() => verifyOtp(id, code), finish)}
                  />
                  <Button
                    label={
                      resendIn > 0 ? `Send a new code in ${resendIn}s` : "Send a new code"
                    }
                    variant="ghost"
                    size="sm"
                    disabled={resendIn > 0 || busy}
                    haptic={false}
                    onPress={sendCode}
                  />
                </>
              ) : null}

              {step === "password" ? (
                <>
                  <AppText variant="body" tone="soft" center>
                    {maskIdentifier(id)}
                  </AppText>
                  <View>
                    <Field
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="password"
                      autoComplete="password"
                      returnKeyType="go"
                      onSubmitEditing={() =>
                        password.length >= 8 &&
                        void run(() => loginWithPassword(id, password), finish)
                      }
                      style={styles.passwordField}
                      autoFocus
                    />
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      hitSlop={10}
                      onPress={() => setShowPassword((v) => !v)}
                      style={styles.eye}
                    >
                      <AppText variant="micro" tone="plum">
                        {showPassword ? "Hide" : "Show"}
                      </AppText>
                    </Pressable>
                  </View>
                  <Button
                    label={busy ? "Checking…" : "Sign in"}
                    loading={busy}
                    disabled={password.length < 8}
                    onPress={() => void run(() => loginWithPassword(id, password), finish)}
                  />
                  <Button
                    label="Use a code instead"
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    haptic={false}
                    onPress={sendCode}
                  />
                </>
              ) : null}

              {error ? (
                <View style={styles.errorBox} accessibilityLiveRegion="polite">
                  <AppText variant="meta" tone="rose" center>
                    {error}
                  </AppText>
                </View>
              ) : null}
            </Animated.View>
          </ScrollView>

          <View style={styles.footer}>
            <AppText variant="meta" tone="muted" center>
              New here?
            </AppText>
            <Button
              label="Join the founding circle"
              variant="ghost"
              size="sm"
              haptic={false}
              onPress={() => navigation.replace("ProfileSetup")}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Atmosphere>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
    paddingTop: spacing.sm,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  pressed: { opacity: 0.7, transform: [{ scale: 0.985 }] },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
  hero: {
    gap: spacing.sm,
    alignItems: "center",
  },
  line: {
    maxWidth: 300,
    textAlign: "center",
  },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    ...elevation.md,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  rule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderPrimary,
  },
  passwordField: {
    paddingRight: 64,
  },
  eye: {
    position: "absolute",
    right: spacing.base,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  errorBox: {
    paddingTop: spacing.xs,
  },
  footer: {
    alignItems: "center",
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
});
