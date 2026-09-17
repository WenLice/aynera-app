import type { EditTarget } from "../components/ProfileStory";

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Sample: undefined;
  ProfileSetup: { startAt?: EditTarget } | undefined;
  Premiere: undefined;
  PendingReview: undefined;
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
