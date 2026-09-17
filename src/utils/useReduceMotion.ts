import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * True when the member has asked their phone for less movement. Pair with
 * `calm()` from the theme so animations shorten instead of disappearing.
 */
export function useReduceMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((on) => {
        if (alive) setReduced(on);
      })
      .catch(() => {});

    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (on) => {
        if (alive) setReduced(on);
      },
    );

    return () => {
      alive = false;
      // RN versions differ: subscription object vs bare unsubscribe function.
      try {
        if (sub && typeof (sub as { remove?: () => void }).remove === "function") {
          (sub as { remove: () => void }).remove();
        } else if (typeof sub === "function") {
          (sub as unknown as () => void)();
        }
      } catch {
        // Never let cleanup take the screen down.
      }
    };
  }, []);

  return reduced;
}
