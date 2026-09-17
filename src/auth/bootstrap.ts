import { ApiError } from "../api/client";
import { getMe, getMyAdmission } from "../api/members";
import type { AuthAccount, MemberAdmission } from "../api/types";
import { isFoundingCity, loadLaunchCities } from "../data/cities";
import type { RootStackParamList } from "../navigation/types";
import { clearSession, loadSession } from "./session";

export type StartRoute =
  | { name: "Welcome" }
  | { name: "Main" }
  | { name: "PendingReview" }
  | { name: "ProfileSetup" }
  | { name: "Waitlist"; params: RootStackParamList["Waitlist"] };

/**
 * Decides where a signed-in member lands. Used by Splash on launch and by
 * Login after tokens arrive, so both paths agree.
 */
export function routeFor(account: AuthAccount, admission: MemberAdmission | null): StartRoute {
  const city = account.profile?.city ?? "";
  if (city && !isFoundingCity(city)) return { name: "Waitlist", params: { city } };

  switch (admission?.state) {
    case "Approved":
      return { name: "Main" };
    case "Submitted":
    case "InReview":
    case "Rejected":
      return { name: "PendingReview" };
    default:
      return { name: "ProfileSetup" };
  }
}

/** Loads the persisted session and resolves the start route; Welcome when signed out. */
export async function resolveStartRoute(): Promise<StartRoute> {
  const session = await loadSession();
  if (!session) return { name: "Welcome" };

  try {
    await loadLaunchCities();
    const account = await getMe();
    let admission: MemberAdmission | null = null;
    try {
      admission = await getMyAdmission();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error;
    }
    return routeFor(account, admission);
  } catch (error) {
    // A dead session (refresh failed, account gone) goes back to Welcome; a
    // network blip keeps the session so the next launch can try again.
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      await clearSession();
    }
    return { name: "Welcome" };
  }
}
