import { createElement, useCallback, useEffect, useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { ApiError } from "../api/client";
import { completeLiveness, startLiveness, type LivenessOutcome } from "../api/liveness";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { colors, spacing } from "../theme";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Called only when the server says the member passed. */
  onPassed: (sessionId: string) => void;
};

type Phase =
  | { kind: "permission" }
  | { kind: "starting" }
  | { kind: "check"; sessionId: string; pageUrl: string }
  | { kind: "verifying" }
  | { kind: "retry"; message: string };

/** What the member is told when a check did not pass. Never blames; always offers another go. */
function retryMessage(outcome: LivenessOutcome): string {
  switch (outcome) {
    case "NotLive":
      return "We couldn't be sure it was you, live. Face the camera in even light and try again.";
    case "Expired":
      return "The check timed out. Start again when you're ready.";
    default:
      return "The check didn't finish. Try again in a moment.";
  }
}

function startError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "liveness_unavailable") return "The face check isn't available right now. Please try again later.";
    if (error.code === "network_error" || error.code === "request_timeout") return "We couldn't reach Aynera. Check your connection and try again.";
  }
  return "Something went wrong starting the check. Please try again.";
}

/**
 * The private face check. The API opens an AWS Face Liveness session and hands back a page; the
 * page runs inside the app (a WebView on phones, an iframe on the web), streams the camera straight
 * to AWS, and only says "done". The verdict then comes from the API, which asks AWS itself — so
 * nothing the page reports can make a member pass.
 */
export function LivenessCheck({ open, onClose, onPassed }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>({ kind: "starting" });
  const busy = useRef(false);

  const begin = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setPhase({ kind: "starting" });
    try {
      const start = await startLiveness();
      setPhase({ kind: "check", sessionId: start.sessionId, pageUrl: start.pageUrl });
    } catch (error) {
      setPhase({ kind: "retry", message: startError(error) });
    } finally {
      busy.current = false;
    }
  }, []);

  // The camera belongs to the app first: on phones the WebView can only use it once the app holds
  // the permission. The web asks inside the page instead.
  useEffect(() => {
    if (!open) return;
    if (Platform.OS !== "web" && permission && !permission.granted) {
      setPhase({ kind: "permission" });
      return;
    }
    if (Platform.OS === "web" || permission?.granted) void begin();
  }, [open, permission, begin]);

  const finish = useCallback(
    async (sessionId: string) => {
      setPhase({ kind: "verifying" });
      try {
        const result = await completeLiveness(sessionId);
        if (result.passed) {
          onPassed(sessionId);
          onClose();
          return;
        }
        setPhase({ kind: "retry", message: retryMessage(result.outcome) });
      } catch {
        setPhase({ kind: "retry", message: "We couldn't confirm the check. Try again in a moment." });
      }
    },
    [onClose, onPassed],
  );

  /** The page speaks only in these three words; anything else is ignored. */
  const onPageMessage = useCallback(
    (raw: string, sessionId: string) => {
      let message: { type?: string; status?: string; sessionId?: string };
      try {
        message = JSON.parse(raw);
      } catch {
        return;
      }
      if (message.type !== "liveness" || message.sessionId !== sessionId) return;
      if (message.status === "done") void finish(sessionId);
      else if (message.status === "cancelled") onClose();
      else if (message.status === "error") setPhase({ kind: "retry", message: "The camera check stopped. Try again." });
    },
    [finish, onClose],
  );

  // On the web the page runs in an iframe and talks through window messages — only trusted from
  // the page's own origin.
  useEffect(() => {
    if (Platform.OS !== "web" || phase.kind !== "check") return;
    const origin = new URL(phase.pageUrl).origin;
    const handler = (event: MessageEvent) => {
      if (event.origin !== origin || typeof event.data !== "string") return;
      onPageMessage(event.data, phase.sessionId);
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [phase, onPageMessage]);

  return (
    <Modal visible={open} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.root}>
        {phase.kind === "check" ? (
          <>
            <View style={styles.frame}>
              {Platform.OS === "web" ? (
                createElement("iframe", {
                  src: phase.pageUrl,
                  allow: "camera; microphone",
                  title: "Face check",
                  style: { border: "none", width: "100%", height: "100%" },
                })
              ) : (
                <WebView
                  source={{ uri: phase.pageUrl }}
                  onMessage={(event: WebViewMessageEvent) => onPageMessage(event.nativeEvent.data, phase.sessionId)}
                  javaScriptEnabled
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  mediaCapturePermissionGrantType="grant"
                  style={styles.frame}
                />
              )}
            </View>
            <SafeAreaView edges={["bottom"]} style={styles.footer}>
              <Pressable accessibilityRole="button" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
                <AppText variant="label" tone="soft">
                  Not now
                </AppText>
              </Pressable>
            </SafeAreaView>
          </>
        ) : (
          <SafeAreaView style={styles.center}>
            {phase.kind === "permission" ? (
              <>
                <AppText variant="title" center>
                  Your camera, for a moment
                </AppText>
                <AppText variant="body" tone="soft" center>
                  A short check that you're a real person and the one in your photos. It never appears on your profile.
                </AppText>
                <Button label="Allow camera" onPress={() => void requestPermission()} />
                <Button label="Not now" variant="ghost" haptic={false} onPress={onClose} />
              </>
            ) : phase.kind === "retry" ? (
              <>
                <AppText variant="title" center>
                  Let's try that again
                </AppText>
                <AppText variant="body" tone="soft" center>
                  {phase.message}
                </AppText>
                <Button label="Try again" onPress={() => void begin()} />
                <Button label="Not now" variant="ghost" haptic={false} onPress={onClose} />
              </>
            ) : (
              <AppText variant="body" tone="soft" center>
                {phase.kind === "verifying" ? "Checking…" : "Getting the camera ready…"}
              </AppText>
            )}
          </SafeAreaView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.backgroundPrimary },
  frame: { flex: 1 },
  center: { flex: 1, justifyContent: "center", paddingHorizontal: spacing.xl, gap: spacing.md },
  footer: { alignItems: "center", paddingVertical: spacing.sm },
  close: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  pressed: { opacity: 0.6 },
});
