import { Platform } from "react-native";
import { ApiError, request } from "./client";

/** A stored photo. `url` is a signed link that expires in about an hour — show it, never keep it. */
export type MemberPhoto = {
  id: string;
  /** The slot, 1-based: the same number as `photo_N` in storage. */
  sortOrder: number;
  isReference: boolean;
  caption: string | null;
  url: string | null;
};

export type IntroVideo = {
  contentType: string;
  byteSize: number;
  caption: string | null;
  url: string | null;
};

/** Uploads can be several megabytes on a phone connection; the JSON default of 8 s is too short. */
const UPLOAD_TIMEOUT_MS = 90_000;

/**
 * One picked file as a form part. Native gives a file uri the runtime can stream; on the web the
 * picker hands back a data or blob URL, which has to become a real Blob first.
 */
async function appendFile(form: FormData, field: string, uri: string, fallbackType: string, name: string) {
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    form.append(field, blob, name);
    return;
  }
  const type = typeFromUri(uri) ?? fallbackType;
  // React Native's FormData accepts this shape for a file on disk.
  form.append(field, { uri, name, type } as unknown as Blob);
}

function typeFromUri(uri: string): string | null {
  const ext = uri.split("?")[0].split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "webm":
      return "video/webm";
    case "m4a":
      return "audio/mp4";
    case "aac":
      return "audio/aac";
    case "mp3":
      return "audio/mpeg";
    case "ogg":
      return "audio/ogg";
    default:
      return null;
  }
}

export function listPhotos(): Promise<MemberPhoto[]> {
  return request<MemberPhoto[]>("/photos/GetAll");
}

/** Puts one photo in `slot` (1–5), replacing whatever was there. The server re-encodes and strips location. */
export async function uploadPhoto(slot: number, uri: string, caption: string): Promise<MemberPhoto> {
  const form = new FormData();
  await appendFile(form, "photos", uri, "image/jpeg", `photo_${slot}.jpg`);
  form.append("slot", String(slot));
  form.append("caption", caption);
  const saved = await request<MemberPhoto[]>("/photos/Upload", {
    method: "POST",
    body: form,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
  return saved[0];
}

export function updatePhotoCaption(photoId: string, caption: string): Promise<void> {
  return request<void>(`/photos/${photoId}`, { method: "PATCH", body: { caption } });
}

/** The member's intro video, or null when there is none yet. */
export async function getIntroVideo(): Promise<IntroVideo | null> {
  try {
    return (await request<IntroVideo | null>("/introduction-video/me")) ?? null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function uploadIntroVideo(uri: string, caption: string): Promise<IntroVideo> {
  const form = new FormData();
  await appendFile(form, "video", uri, "video/mp4", "intro_video");
  form.append("caption", caption);
  return request<IntroVideo>("/introduction-video/Upload", {
    method: "POST",
    body: form,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
}

export function updateIntroVideoCaption(caption: string): Promise<void> {
  return request<void>("/introduction-video/me", { method: "PATCH", body: { caption } });
}

/** A stored spoken answer. `url` is a signed link that expires in about an hour — play it, never keep it. */
export type VoiceAnswer = {
  promptId: string;
  contentType: string;
  byteSize: number;
  url: string | null;
};

export function listVoiceAnswers(): Promise<VoiceAnswer[]> {
  return request<VoiceAnswer[]>("/voice-answers/GetAll");
}

/**
 * Stores the spoken answer to one chosen prompt, replacing any earlier one. The prompt must already
 * be in the saved prompt list — save the list first.
 */
export async function uploadVoiceAnswer(promptId: string, uri: string): Promise<VoiceAnswer> {
  const form = new FormData();
  // Phones record AAC in an .m4a file; a browser recording arrives as a WebM blob and keeps its own type.
  await appendFile(form, "audio", uri, "audio/mp4", `voice_${promptId}.m4a`);
  form.append("promptId", promptId);
  return request<VoiceAnswer>("/voice-answers/Upload", {
    method: "POST",
    body: form,
    timeoutMs: UPLOAD_TIMEOUT_MS,
  });
}

export function deleteVoiceAnswer(promptId: string): Promise<void> {
  return request<void>(`/voice-answers/${encodeURIComponent(promptId)}`, { method: "DELETE" });
}
