/**
 * Soft ceremonial feedback. expo-haptics is preferred; Vibration is the
 * fallback so a missing native module never takes the whole app down.
 */
import { Platform, Vibration } from "react-native";

let haptics: typeof import("expo-haptics") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  haptics = require("expo-haptics");
} catch {
  haptics = null;
}

/** Choosing a chip, flipping a photo, opening a sheet. */
export function selectTap() {
  if (haptics) {
    haptics.selectionAsync().catch(() => {});
    return;
  }
  if (Platform.OS === "android") Vibration.vibrate(10);
}

/** A considered confirmation — sending, saving, keeping. */
export function softPulse() {
  if (haptics) {
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Light).catch(() => {});
    return;
  }
  if (Platform.OS === "android") {
    Vibration.vibrate(18);
    return;
  }
  Vibration.vibrate(12);
}

/** Something warm landed — a KHAT sent, a letter delivered. */
export function warmPulse() {
  if (haptics) {
    haptics
      .notificationAsync(haptics.NotificationFeedbackType.Success)
      .catch(() => {});
    return;
  }
  if (Platform.OS === "android") {
    Vibration.vibrate([0, 18, 40, 28]);
    return;
  }
  Vibration.vibrate([0, 14, 40, 24]);
}

/** The one true celebration. Reserved for a mutual match. */
export function matchPulse() {
  if (haptics) {
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTimeout(() => {
      haptics
        ?.notificationAsync(haptics.NotificationFeedbackType.Success)
        .catch(() => {});
    }, 140);
    return;
  }
  warmPulse();
}

/** Letting an introduction go — low and final, never punishing. */
export function releaseThud() {
  if (haptics) {
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Rigid).catch(() => {});
    return;
  }
  if (Platform.OS === "android") Vibration.vibrate(24);
}

/** Something couldn't happen — a blocked action, a failed validation. */
export function refuse() {
  if (haptics) {
    haptics
      .notificationAsync(haptics.NotificationFeedbackType.Warning)
      .catch(() => {});
    return;
  }
  if (Platform.OS === "android") Vibration.vibrate([0, 30, 40, 30]);
}
