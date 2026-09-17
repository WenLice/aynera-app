import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export type Session = {
  accessToken: string;
  refreshToken: string;
};

const KEY = "aynera.session";

let cached: Session | null | undefined;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

/**
 * Tokens live in the OS keychain/keystore on phones. The web build falls back
 * to localStorage — good enough for a demo, not for production web sign-in.
 */
async function readRaw(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}

async function writeRaw(value: string | null): Promise<void> {
  if (Platform.OS === "web") {
    try {
      if (value === null) globalThis.localStorage?.removeItem(KEY);
      else globalThis.localStorage?.setItem(KEY, value);
    } catch {
      /* private mode etc. — session simply won't persist */
    }
    return;
  }
  if (value === null) await SecureStore.deleteItemAsync(KEY);
  else await SecureStore.setItemAsync(KEY, value);
}

/** Loads the persisted session once; later reads are synchronous via `getSession`. */
export async function loadSession(): Promise<Session | null> {
  if (cached !== undefined) return cached;
  const raw = await readRaw();
  try {
    cached = raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    cached = null;
  }
  return cached;
}

export function getSession(): Session | null {
  return cached ?? null;
}

export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function saveSession(session: Session): Promise<void> {
  cached = session;
  emit();
  await writeRaw(JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  cached = null;
  emit();
  await writeRaw(null);
}
