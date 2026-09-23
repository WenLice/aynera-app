import { request } from "./client";

/** From POST /liveness/Start: open `pageUrl`, and call complete with `sessionId` when it says done. */
export type LivenessStart = {
  sessionId: string;
  region: string;
  pageUrl: string;
};

export type LivenessOutcome = "Pending" | "Passed" | "NotLive" | "FaceMismatch" | "Expired" | "Failed";

/** The server's verdict, read from AWS by the server — never from the page. */
export type LivenessResult = {
  sessionId: string;
  outcome: LivenessOutcome;
  passed: boolean;
  confidence: number | null;
  similarity: number | null;
  checkedAtUtc: string | null;
};

export function startLiveness(): Promise<LivenessStart> {
  return request<LivenessStart>("/liveness/Start", { method: "POST" });
}

export function completeLiveness(sessionId: string): Promise<LivenessResult> {
  return request<LivenessResult>(`/liveness/${encodeURIComponent(sessionId)}/Complete`, {
    method: "POST",
    // AWS finishes analysing a moment after the page reports done; give it room.
    timeoutMs: 20_000,
  });
}
