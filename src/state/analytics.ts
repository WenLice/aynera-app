/** Lightweight event log. No extra analytics library. */

export type AnalyticsEvent =
  | "meet_home_viewed"
  | "introduction_opened"
  | "introduction_passed"
  | "introduction_response_sent"
  | "khat_sent"
  | "taste_gathering_viewed"
  | "taste_gathering_interest"
  | "thread_opened"
  | "meet_plan_created"
  | "post_meet_feedback_completed"
  | "reconnect_choice_submitted";

type Payload = Record<string, string | number | boolean | undefined>;

const events: { name: AnalyticsEvent; at: number; payload?: Payload }[] = [];

export function track(name: AnalyticsEvent, payload?: Payload) {
  events.push({ name, at: Date.now(), payload });
}

export function getAnalyticsEvents() {
  return events;
}
