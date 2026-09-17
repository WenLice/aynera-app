export type MeetPlan = {
  threadId: string;
  place: string;
  when: string;
  note: string;
  sharedWithTrusted: boolean;
  createdAt: number;
};

export type PostMeetFeedback = {
  threadId: string;
  didMeet: "yes" | "not_yet" | "";
  comfortable: "yes" | "off" | "";
  seeAgain: "yes" | "maybe" | "no" | "";
  reportNote: string;
};

let plans: MeetPlan[] = [];
let feedback: PostMeetFeedback[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeMeetPlans(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getMeetPlan(threadId: string) {
  return plans.find((p) => p.threadId === threadId) ?? null;
}

export function saveMeetPlan(plan: Omit<MeetPlan, "createdAt">) {
  const item: MeetPlan = { ...plan, createdAt: Date.now() };
  plans = [item, ...plans.filter((p) => p.threadId !== plan.threadId)];
  emit();
  return item;
}

export function getPostMeetFeedback(threadId: string) {
  return feedback.find((f) => f.threadId === threadId) ?? null;
}

export function savePostMeetFeedback(item: PostMeetFeedback) {
  feedback = [item, ...feedback.filter((f) => f.threadId !== item.threadId)];
  emit();
}

export function resetMeetPlans() {
  plans = [];
  feedback = [];
  emit();
}
