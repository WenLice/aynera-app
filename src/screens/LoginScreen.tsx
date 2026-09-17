import { useState } from "react";
import { StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { loginWithPassword, requestOtp, verifyOtp } from "../api/auth";
import { ApiError } from "../api/client";
import { getMyAdmission } from "../api/members";
import type { MemberAdmission, TokenPayload } from "../api/types";
import { routeFor } from "../auth/bootstrap";
import { saveSession } from "../auth/session";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { ChapterShell } from "../components/ChapterShell";
import { CodeInput, CODE_LENGTH } from "../components/CodeInput";
import { Field } from "../components/Field";
import { loadLaunchCities } from "../data/cities";
import type { RootStackParamList } from "../navigation/types";
import { spacing } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

type Step = "identifier" | "code" | "password";

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

/** Sign-in for members who already registered: a one-time code, or a password. */
export function LoginScreen({ navigation }: Props) {
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  const id = identifier.trim();
  const idValid = id.includes("@") ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id) : id.replace(/\D/g, "").length >= 10;

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
      (sent) => {
        setExpiresIn(sent.expiresInSeconds);
        setCode("");
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
      routes: [route.name === "Waitlist" ? { name: "Waitlist", params: route.params } : { name: route.name }],
    });
  }

  if (step === "code") {
    return (
      <ChapterShell
        act="Sign in"
        vibe="Enter the code we sent"
        progress={0.66}
        primaryLabel={busy ? "Checking…" : "Sign in"}
        primaryDisabled={code.length < CODE_LENGTH || busy}
        onPrimary={() => void run(() => verifyOtp(id, code), finish)}
        onBack={() => setStep("identifier")}
        secondaryLabel="Send a new code"
        onSecondary={sendCode}
      >
        <AppText variant="body" tone="soft" center>
          Sent to {id}
          {expiresIn ? ` · valid for ${Math.round(expiresIn / 60)} min` : ""}
        </AppText>
        <CodeInput value={code} onChange={setCode} autoFocus />
        {error ? (
          <AppText variant="meta" tone="rose" center>
            {error}
          </AppText>
        ) : null}
      </ChapterShell>
    );
  }

  if (step === "password") {
    return (
      <ChapterShell
        act="Sign in"
        vibe="Your password"
        progress={0.66}
        primaryLabel={busy ? "Checking…" : "Sign in"}
        primaryDisabled={password.length < 8 || busy}
        onPrimary={() => void run(() => loginWithPassword(id, password), finish)}
        onBack={() => setStep("identifier")}
        secondaryLabel="Use a code instead"
        onSecondary={sendCode}
      >
        <AppText variant="body" tone="soft" center>
          {id}
        </AppText>
        <Field
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          textContentType="password"
          autoComplete="password"
          autoFocus
        />
        {error ? (
          <AppText variant="meta" tone="rose" center>
            {error}
          </AppText>
        ) : null}
      </ChapterShell>
    );
  }

  return (
    <ChapterShell
      act="Sign in"
      vibe="Welcome back"
      progress={0.33}
      primaryLabel={busy ? "Sending…" : "Send me a code"}
      primaryDisabled={!idValid || busy}
      disabledReason={id.length > 0 && !idValid ? "Enter your mobile number or email." : undefined}
      onPrimary={sendCode}
      onBack={() => navigation.goBack()}
    >
      <Field
        placeholder="Mobile number or email"
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="username"
        autoComplete="username"
        autoFocus
      />
      <View style={styles.alt}>
        <Button
          label="I have a password"
          variant="ghost"
          size="sm"
          disabled={!idValid || busy}
          haptic={false}
          onPress={() => {
            setError(null);
            setStep("password");
          }}
        />
      </View>
      {error ? (
        <AppText variant="meta" tone="rose" center>
          {error}
        </AppText>
      ) : null}
    </ChapterShell>
  );
}

const styles = StyleSheet.create({
  alt: { alignItems: "center", marginTop: spacing.xs },
});
