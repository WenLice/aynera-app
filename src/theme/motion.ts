import { Easing } from "react-native";

/**
 * Shared motion vocabulary. Every animation in the app should pull its
 * duration and curve from here so the whole product moves at one tempo.
 */
export const motion = {
  duration: {
    /** Press states, chip toggles. */
    instant: 120,
    /** Small reveals, spark arrival. */
    quick: 200,
    /** Default screen and card entrances. */
    base: 300,
    /** Considered transitions — step changes, sheets. */
    calm: 440,
    /** Long reveals — letter opening. */
    slow: 640,
    /** Match, KHAT, splash. Once per journey. */
    ceremony: 900,
  },
  easing: {
    /** Things arriving on screen. */
    enter: Easing.out(Easing.cubic),
    /** Things leaving. */
    exit: Easing.in(Easing.cubic),
    /** Moving between two on-screen states. */
    move: Easing.inOut(Easing.cubic),
    /** Breathing loops. */
    breathe: Easing.inOut(Easing.sin),
    /** A little overshoot for celebratory beats. */
    bloom: Easing.bezier(0.2, 0.9, 0.2, 1),
  },
} as const;

/**
 * Collapses a duration to near-zero when the member has asked the OS for
 * less movement. Keeps the state change, drops the travel.
 */
export function calm(duration: number, reduced: boolean) {
  return reduced ? Math.min(duration, 90) : duration;
}
