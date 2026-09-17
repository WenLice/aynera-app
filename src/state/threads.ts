import type { MomentTarget } from "../components/ProfileStory";

export type ThreadMessage = {
  id: string;
  from: "me" | "them" | "system";
  text: string;
  /** Epoch millis — formatted at render so "just now" stops being a lie. */
  at: number;
};

export type Thread = {
  id: string;
  personId: string;
  personName: string;
  moment: MomentTarget;
  kind: "moment" | "mutual" | "khat";
  originLabel?: string;
  messages: ThreadMessage[];
  /** Their unread replies, from this member's point of view. */
  unread: number;
  /** True until the match ceremony has been shown once. */
  matchPending?: boolean;
  updatedAt: number;
};

/** Some introductions already keep you back during this pilot. */
const RECIPROCAL = new Set(["1", "3"]);

/** How long a mock reply takes to arrive. Long enough to feel like a person. */
const REPLY_DELAY_MS = 14000;
const MATCH_DELAY_MS = 9000;

let threads: Thread[] = [];
const listeners = new Set<() => void>();
const timers = new Set<ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((fn) => fn());
}

function touch(id: string, mutate: (thread: Thread) => Thread) {
  threads = threads.map((t) => (t.id === id ? mutate(t) : t));
  threads = [...threads].sort((a, b) => b.updatedAt - a.updatedAt);
  emit();
}

function later(fn: () => void, ms: number) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    fn();
  }, ms);
  timers.add(timer);
}

export function getThreads() {
  return threads;
}

export function subscribeThreads(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getThread(id: string) {
  return threads.find((t) => t.id === id) ?? null;
}

/** Total unread across every chapter — drives the tab badge. */
export function getUnreadCount() {
  return threads.reduce((sum, t) => sum + t.unread, 0);
}

export function getPendingMatch() {
  return threads.find((t) => t.matchPending) ?? null;
}

export function markThreadRead(id: string) {
  const thread = getThread(id);
  if (!thread || thread.unread === 0) return;
  touch(id, (t) => ({ ...t, unread: 0 }));
}

export function clearMatchPending(id: string) {
  const thread = getThread(id);
  if (!thread?.matchPending) return;
  touch(id, (t) => ({ ...t, matchPending: false }));
}

function message(
  from: ThreadMessage["from"],
  text: string,
): ThreadMessage {
  return { id: `${from}-${Date.now()}-${Math.random()}`, from, text, at: Date.now() };
}

/**
 * Queues a mock reply so a thread stops being a monologue. Only the people
 * marked reciprocal write back, which is what makes a reply mean something.
 */
function scheduleReply(threadId: string, personId: string, personName: string) {
  if (!RECIPROCAL.has(personId)) return;

  later(() => {
    const thread = getThread(threadId);
    if (!thread) return;
    touch(threadId, (t) => ({
      ...t,
      messages: [
        ...t.messages,
        message(
          "them",
          `I read yours twice before answering, ${firstName(personName)} here. The part you picked out is the part nobody usually notices.`,
        ),
      ],
      unread: t.unread + 1,
      updatedAt: Date.now(),
    }));
  }, REPLY_DELAY_MS);
}

function firstName(name: string) {
  return name.split(" ")[0] ?? name;
}

export function startThread(input: {
  personId: string;
  personName: string;
  moment: MomentTarget;
  message: string;
}): Thread {
  const existing = threads.find(
    (t) => t.personId === input.personId && t.moment.blockId === input.moment.blockId,
  );

  if (existing) {
    touch(existing.id, (t) => ({
      ...t,
      messages: [...t.messages, message("me", input.message)],
      updatedAt: Date.now(),
    }));
    scheduleReply(existing.id, input.personId, input.personName);
    return getThread(existing.id) ?? existing;
  }

  const thread: Thread = {
    id: `t-${Date.now()}`,
    personId: input.personId,
    personName: input.personName,
    moment: input.moment,
    kind: "moment",
    originLabel: `Started from .. ${input.moment.title}`,
    messages: [message("me", input.message)],
    unread: 0,
    updatedAt: Date.now(),
  };
  threads = [thread, ...threads];
  emit();
  scheduleReply(thread.id, input.personId, input.personName);
  return thread;
}

export function countActiveNewConversations() {
  return threads.filter((t) => t.kind === "mutual").length;
}

export function startMutualChapter(input: {
  personId: string;
  personName: string;
  originLabel?: string;
}): Thread {
  const existing = threads.find(
    (thread) => thread.personId === input.personId && thread.kind === "mutual",
  );
  if (existing) return existing;

  const thread: Thread = {
    id: `mutual-${Date.now()}`,
    personId: input.personId,
    personName: input.personName,
    kind: "mutual",
    originLabel: input.originLabel,
    moment: {
      blockId: `mutual-${input.personId}`,
      kind: "prompt",
      title: "You both chose to keep this introduction.",
    },
    messages: [
      message(
        "system",
        "A shared chapter opened. Begin with something you noticed, not just hello.",
      ),
    ],
    unread: 1,
    matchPending: true,
    updatedAt: Date.now(),
  };
  threads = [thread, ...threads];
  emit();
  return thread;
}

export function startKhatChapter(input: {
  personId: string;
  personName: string;
  note: string;
  originLabel?: string;
}): Thread {
  const existing = threads.find(
    (thread) => thread.personId === input.personId && thread.kind === "khat",
  );
  if (existing) return existing;

  const thread: Thread = {
    id: `khat-thread-${Date.now()}`,
    personId: input.personId,
    personName: input.personName,
    kind: "khat",
    originLabel: input.originLabel ?? "Started from .. a Khat",
    moment: {
      blockId: `khat-${input.personId}`,
      kind: "prompt",
      title: "A KHAT opened this correspondence.",
    },
    messages: [message("me", input.note)],
    unread: 0,
    updatedAt: Date.now(),
  };
  threads = [thread, ...threads];
  emit();

  // A KHAT to someone who already chose you becomes a match, after a pause
  // long enough that it reads as their decision rather than a system reply.
  if (RECIPROCAL.has(input.personId)) {
    later(() => {
      startMutualChapter({
        personId: input.personId,
        personName: input.personName,
      });
    }, MATCH_DELAY_MS);
  } else {
    scheduleReply(thread.id, input.personId, input.personName);
  }

  return thread;
}

export function addReply(
  threadId: string,
  text: string,
  from: "me" | "them" | "system" = "me",
) {
  const thread = getThread(threadId);
  if (!thread) return;
  if (from === "me" && thread.kind !== "mutual") return;

  touch(threadId, (t) => ({
    ...t,
    messages: [...t.messages, message(from, text)],
    unread: from === "them" ? t.unread + 1 : t.unread,
    updatedAt: Date.now(),
  }));

  if (from === "me") {
    scheduleReply(threadId, thread.personId, thread.personName);
  }
}

export function resetThreads() {
  timers.forEach((t) => clearTimeout(t));
  timers.clear();
  threads = [];
  emit();
}
