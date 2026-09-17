import { logout } from "../api/auth";
import { clearSession, getSession } from "./session";

/** Revokes the refresh session server-side (best effort) and forgets the tokens. */
export async function signOut(): Promise<void> {
  const session = getSession();
  if (session) {
    try {
      await logout(session.refreshToken);
    } catch {
      /* already gone or offline — the local session is cleared regardless */
    }
  }
  await clearSession();
}
