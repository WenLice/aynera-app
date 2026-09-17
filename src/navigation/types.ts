import type { AdmissionState } from "../api/types";
import type { EditTarget } from "../components/ProfileStory";

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  ProfileSetup: { startAt?: EditTarget } | undefined;
  Premiere: undefined;
  /** Seeded with the admission the caller already fetched, so the page doesn't refetch on mount. */
  PendingReview: { state?: AdmissionState; reason?: string | null } | undefined;
  Waitlist: { city: string };
  Main: undefined;
  Thread: { threadId: string };
  MatchMoment: { threadId: string };
  Settings: undefined;
  GatheringDetail: { gatheringId: string };
  GatheringReconnect: { gatheringId: string };
  PlanMeet: { threadId: string };
  PostMeetFeedback: { threadId: string };
};

export type MainTabParamList = {
  Meet: undefined;
  Threads: undefined;
  Profile: undefined;
};
