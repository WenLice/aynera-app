import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { getSession } from "../auth/session";
import { CONSENT_POLICIES } from "../config/aynera";
import { PHOTO_SLOTS } from "../data/profileOptions";
import { ApiError } from "./client";
import type { RegistrationAnswer, RegistrationAnswers } from "./registration";
import type { AdmissionState, AuthAccount, EarlyAccessCity, MemberAdmission, TokenPayload } from "./types";

/**
 * The demo build's stand-in for the Aynera API.
 *
 * This branch has no server: every call the app makes is answered here and saved on the device
 * (localStorage and IndexedDB on the web, the keystore on phones), so a visitor can walk the whole
 * registration and into the app with nothing configured. There are no codes to receive — the
 * phone and email steps confirm on Continue — and the face check is the on-device camera capture.
 *
 * The answers mirror the real API's shapes and resume rule (`nextStep`), so the screens are the
 * same code as `dev`; only `client.ts` routes here.
 */

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type StoredPhoto = { id: string; slot: number; caption: string | null; key: string };
type StoredVideo = { caption: string | null; contentType: string; byteSize: number; key: string };

type DemoAccount = {
  id: string;
  phone: string;
  email: string | null;
  emailConfirmed: boolean;
  answers: RegistrationAnswers;
  lifestyle: Record<string, RegistrationAnswer>;
  beliefs: Record<string, RegistrationAnswer>;
  vibe: string[];
  livenessPassed: boolean;
  photos: StoredPhoto[];
  video: StoredVideo | null;
  consents: string[];
  admission: AdmissionState;
  submittedAtUtc: string | null;
};

type DemoDb = { accounts: Record<string, DemoAccount> };

/** The same order as the API's `RegistrationProgress.Ordered`. */
const ORDERED = [
  "phone", "email", "you", "self", "birth", "life", "looking", "intent",
  "lifestyle", "beliefs", "vibe", "liveness", "photos", "consent",
];

const CITIES: EarlyAccessCity[] = [
  { id: "demo-bangalore", name: "Bangalore", wave: 1, sortOrder: 1, isActive: true },
  { id: "demo-delhi-ncr", name: "Delhi NCR", wave: 2, sortOrder: 2, isActive: true },
  { id: "demo-mumbai", name: "Mumbai", wave: 2, sortOrder: 3, isActive: true },
];

// ---- storage -------------------------------------------------------------------------------

const DB_KEY = "aynera.demo.v1";
let db: DemoDb | null = null;

async function loadDb(): Promise<DemoDb> {
  if (db) return db;
  let raw: string | null = null;
  try {
    raw = Platform.OS === "web"
      ? globalThis.localStorage?.getItem(DB_KEY) ?? null
      : await SecureStore.getItemAsync(DB_KEY);
  } catch {
    raw = null;
  }
  try {
    db = raw ? (JSON.parse(raw) as DemoDb) : { accounts: {} };
  } catch {
    db = { accounts: {} };
  }
  return db;
}

async function saveDb(): Promise<void> {
  if (!db) return;
  const raw = JSON.stringify(db);
  try {
    if (Platform.OS === "web") globalThis.localStorage?.setItem(DB_KEY, raw);
    else await SecureStore.setItemAsync(DB_KEY, raw);
  } catch {
    /* private mode or a full store: the demo keeps working for this visit */
  }
}

/**
 * Photos and the video. On the web they are Blobs in IndexedDB (too big for localStorage) and
 * are handed back as object URLs; on phones the picked file's own uri is kept.
 */
const mediaUrls = new Map<string, string>();

function openMediaStore(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const open = globalThis.indexedDB?.open("aynera-demo-media", 1);
      if (!open) return resolve(null);
      open.onupgradeneeded = () => open.result.createObjectStore("media");
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function putMedia(key: string, file: Blob | string): Promise<void> {
  const old = mediaUrls.get(key);
  if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
  if (typeof file === "string") {
    mediaUrls.set(key, file);
    return;
  }
  mediaUrls.set(key, URL.createObjectURL(file));
  const store = await openMediaStore();
  if (!store) return;
  await new Promise<void>((resolve) => {
    const tx = store.transaction("media", "readwrite");
    tx.objectStore("media").put(file, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

async function mediaUrl(key: string): Promise<string | null> {
  const known = mediaUrls.get(key);
  if (known) return known;
  const store = await openMediaStore();
  if (!store) return null;
  const blob = await new Promise<Blob | null>((resolve) => {
    const read = store.transaction("media").objectStore("media").get(key);
    read.onsuccess = () => resolve((read.result as Blob | undefined) ?? null);
    read.onerror = () => resolve(null);
  });
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  mediaUrls.set(key, url);
  return url;
}

/** Reads a multipart body the app built: web FormData has `get`, React Native's has `getParts`. */
function formValue(form: FormData, field: string): Blob | string | null {
  const web = form as unknown as { get?: (name: string) => unknown };
  if (typeof web.get === "function") {
    const value = web.get(field);
    return value instanceof Blob || typeof value === "string" ? value : null;
  }
  const parts = (form as unknown as { getParts?: () => Array<Record<string, unknown>> }).getParts?.() ?? [];
  const part = parts.find((p) => p.fieldName === field);
  if (!part) return null;
  if (typeof part.string === "string") return part.string;
  return typeof part.uri === "string" ? part.uri : null;
}

// ---- accounts ------------------------------------------------------------------------------

const emptyAnswers = (): RegistrationAnswers => ({
  name: null, nickname: null, gender: null, genderIsPublic: null, dateOfBirth: null,
  heightCm: null, hometown: null, city: null, work: null, interestedIn: null,
  minAge: null, maxAge: null, ageIsFlexible: null, track: null, outcome: null,
});

const tenDigits = (phone: string) => phone.replace(/\D/g, "").slice(-10);
const newId = () => `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

function fail(code: string, status: number): never {
  throw new ApiError(code, status, null, null);
}

async function findByIdentifier(identifier: string): Promise<DemoAccount | undefined> {
  const all = Object.values((await loadDb()).accounts);
  const id = identifier.trim().toLowerCase();
  return id.includes("@")
    ? all.find((a) => a.email?.toLowerCase() === id)
    : all.find((a) => tenDigits(a.phone) === tenDigits(id));
}

async function current(): Promise<DemoAccount> {
  const token = getSession()?.accessToken ?? "";
  const account = (await loadDb()).accounts[token.replace(/^demo\./, "")];
  return account ?? fail("unauthorized", 401);
}

function toAccount(a: DemoAccount): AuthAccount {
  const x = a.answers;
  const profile = x.name && x.gender && x.dateOfBirth && x.city
    ? {
        name: x.name, gender: x.gender, genderIsPublic: x.genderIsPublic ?? true,
        dateOfBirth: x.dateOfBirth, city: x.city,
        cityId: CITIES.find((c) => c.name === x.city)?.id ?? "demo-city",
        nickname: x.nickname, heightCm: x.heightCm, hometown: x.hometown, work: x.work, religion: null,
      }
    : null;
  return {
    id: a.id, phone: a.phone, phoneConfirmed: true, email: a.email, emailConfirmed: a.emailConfirmed,
    accountKind: "Member", isActive: true, isDeleted: false, isSuperAdmin: false, isRestricted: false,
    roles: ["Member"], profile,
  };
}

function tokens(a: DemoAccount): TokenPayload {
  return {
    accessToken: `demo.${a.id}`, refreshToken: `demo.${a.id}`, tokenType: "Bearer",
    expiresInSeconds: 86_400, account: toAccount(a),
  };
}

function completed(a: DemoAccount): string[] {
  const x = a.answers;
  const done: string[] = ["phone"];
  if (a.emailConfirmed) done.push("email");
  if (x.name?.trim()) done.push("you");
  if (x.gender) done.push("self");
  if (x.dateOfBirth && x.hometown?.trim()) done.push("birth");
  if (x.city) done.push("life");
  if (x.interestedIn) done.push("looking");
  if (x.track && x.outcome) done.push("intent");
  if (Object.keys(a.lifestyle).length) done.push("lifestyle");
  if (Object.keys(a.beliefs).length) done.push("beliefs");
  if (a.vibe.length) done.push("vibe");
  if (a.livenessPassed) done.push("liveness");
  if (a.photos.length >= PHOTO_SLOTS) done.push("photos");
  if (CONSENT_POLICIES.every((p) => a.consents.includes(`${p.kind}@${p.version}`))) done.push("consent");
  return done;
}

function progress(a: DemoAccount) {
  const done = completed(a);
  return {
    answers: a.answers,
    completed: done,
    nextStep: ORDERED.find((step) => !done.includes(step)) ?? null,
    profile: null,
    preferences: null,
    profileAnswers: { lifestyle: a.lifestyle, beliefs: a.beliefs, vibe: a.vibe },
  };
}

/** A submitted demo profile is approved on the next look, so "Check again" opens the app. */
function admission(a: DemoAccount): MemberAdmission {
  const state: AdmissionState = a.admission === "Submitted" ? "Approved" : a.admission;
  return {
    userId: a.id, state, submittedAtUtc: a.submittedAtUtc,
    decidedAtUtc: state === "Approved" ? new Date().toISOString() : null,
    decisionReason: null, reviewNote: null,
    eligibility: { isEligible: true, admissionState: state, unmetRequirements: [] },
  };
}

function patchRegistration(a: DemoAccount, page: Record<string, unknown>) {
  const x = a.answers as Record<string, unknown>;
  for (const key of Object.keys(emptyAnswers())) {
    if (!(key in page) || page[key] === undefined) continue;
    const value = page[key];
    x[key] = typeof value === "string" && value.trim() === "" ? null : value;
  }
  if (page.maxAgeIsOpen === true) a.answers.maxAge = null;
  if (page.lifestyle) a.lifestyle = { ...a.lifestyle, ...(page.lifestyle as Record<string, RegistrationAnswer>) };
  if (page.beliefs) a.beliefs = { ...a.beliefs, ...(page.beliefs as Record<string, RegistrationAnswer>) };
  if (Array.isArray(page.vibe)) a.vibe = page.vibe as string[];
}

async function photoDtos(a: DemoAccount) {
  const sorted = [...a.photos].sort((p, q) => p.slot - q.slot);
  return Promise.all(sorted.map(async (p) => ({
    id: p.id, sortOrder: p.slot, isReference: p.slot === sorted[0]?.slot,
    caption: p.caption, url: await mediaUrl(p.key),
  })));
}

// ---- routes --------------------------------------------------------------------------------

export async function handleDemoRequest<T>(path: string, method: Method, body: unknown): Promise<T> {
  // A beat of latency, so buttons show their busy state the way they do against a real server.
  await new Promise((resolve) => setTimeout(resolve, 150));
  const route = `${method} ${path.split("?")[0]}`;
  const data = (body ?? {}) as Record<string, unknown>;
  const store = await loadDb();

  const result = await (async (): Promise<unknown> => {
    switch (route) {
      case "GET /early-access/cities/GetAll":
        return CITIES;

      // Registration access: no codes. Starting the phone step creates (or reopens) the account.
      case "POST /members/register/phone":
        return { expiresInSeconds: 600, retryAfterSeconds: null };
      case "POST /members/register/phone/verify": {
        const phone = `+91${tenDigits(String(data.phone ?? ""))}`;
        let account = await findByIdentifier(phone);
        if (!account) {
          account = {
            id: newId(), phone, email: null, emailConfirmed: false, answers: emptyAnswers(),
            lifestyle: {}, beliefs: {}, vibe: [], livenessPassed: false, photos: [], video: null,
            consents: [], admission: "Draft", submittedAtUtc: null,
          };
          store.accounts[account.id] = account;
        }
        return tokens(account);
      }
      case "POST /members/me/email":
        return { expiresInSeconds: 600, retryAfterSeconds: null };
      case "POST /members/me/email/verify": {
        const account = await current();
        account.email = String(data.email ?? "").trim();
        account.emailConfirmed = true;
        return toAccount(account);
      }

      // Sign-in: any code or password opens an account made on this device.
      case "POST /auth/otp/request":
        return (await findByIdentifier(String(data.identifier ?? "")))
          ? { expiresInSeconds: 600, retryAfterSeconds: null }
          : fail("user_not_found", 404);
      case "POST /auth/otp/verify":
      case "POST /auth/password": {
        const account = await findByIdentifier(String(data.identifier ?? ""));
        return account ? tokens(account) : fail("user_not_found", 404);
      }
      case "POST /auth/refresh":
        return tokens(await current());
      case "POST /auth/logout":
        return null;

      case "GET /members/me":
        return toAccount(await current());
      case "GET /members/me/registration":
        return progress(await current());
      case "PATCH /members/me/registration": {
        const account = await current();
        patchRegistration(account, data);
        return progress(account);
      }

      case "POST /liveness/Start":
        await current();
        return { sessionId: newId(), region: "demo", pageUrl: "" };
      case "GET /liveness/me": {
        const account = await current();
        return account.livenessPassed
          ? { sessionId: "demo", outcome: "Passed", passed: true, confidence: 100, similarity: null, checkedAtUtc: null }
          : fail("liveness_not_found", 404);
      }

      case "GET /photos/GetAll":
        return photoDtos(await current());
      case "POST /photos/Upload": {
        const account = await current();
        const form = body as FormData;
        const file = formValue(form, "photos");
        if (!file) return fail("validation_failed", 400);
        const slot = Number(formValue(form, "slot")) || account.photos.length + 1;
        const caption = (formValue(form, "caption") as string | null)?.trim() || null;
        const key = `${account.id}/photo_${slot}`;
        await putMedia(key, file);
        const existing = account.photos.find((p) => p.slot === slot);
        if (existing) existing.caption = caption;
        else account.photos.push({ id: newId(), slot, caption, key });
        return (await photoDtos(account)).filter((p) => p.sortOrder === slot);
      }

      case "GET /introduction-video/me": {
        const account = await current();
        if (!account.video) return fail("video_not_found", 404);
        const { caption, contentType, byteSize, key } = account.video;
        return { caption, contentType, byteSize, url: await mediaUrl(key) };
      }
      case "POST /introduction-video/Upload": {
        const account = await current();
        const form = body as FormData;
        const file = formValue(form, "video");
        if (!file) return fail("validation_failed", 400);
        const key = `${account.id}/intro_video`;
        await putMedia(key, file);
        account.video = {
          key,
          caption: (formValue(form, "caption") as string | null)?.trim() || null,
          contentType: typeof file === "string" ? "video/mp4" : file.type || "video/mp4",
          byteSize: typeof file === "string" ? 0 : file.size,
        };
        return { ...account.video, url: await mediaUrl(key) };
      }
      case "PATCH /introduction-video/me": {
        const account = await current();
        if (!account.video) return fail("video_not_found", 404);
        account.video.caption = String(data.caption ?? "").trim() || null;
        return null;
      }

      case "GET /admissions/me":
        return admission(await current());
      case "POST /admissions/me/consents": {
        const account = await current();
        const key = `${data.policyKind}@${data.version}`;
        if (!account.consents.includes(key)) account.consents.push(key);
        return admission(account);
      }
      case "POST /admissions/me/submit": {
        const account = await current();
        if (account.admission !== "Draft") return fail("admission_already_submitted", 409);
        account.admission = "Submitted";
        account.submittedAtUtc = new Date().toISOString();
        return { ...admission(account), state: "Submitted" as AdmissionState };
      }
    }

    // Routes with an id in them.
    const photo = route.match(/^PATCH \/photos\/([^/]+)$/);
    if (photo) {
      const target = (await current()).photos.find((p) => p.id === photo[1]);
      if (!target) return fail("photo_not_found", 404);
      target.caption = String(data.caption ?? "").trim() || null;
      return null;
    }
    const liveness = route.match(/^POST \/liveness\/([^/]+)\/Complete$/);
    if (liveness) {
      const account = await current();
      account.livenessPassed = true;
      return {
        sessionId: decodeURIComponent(liveness[1]), outcome: "Passed", passed: true,
        confidence: 100, similarity: null, checkedAtUtc: new Date().toISOString(),
      };
    }

    return fail("not_available_in_demo", 404);
  })();

  await saveDb();
  return result as T;
}
