import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ApiError } from "../api/client";
import { getMe } from "../api/members";
import {
  saveProfile,
  savePreferences,
  startEmailVerification,
  startPhoneRegistration,
  verifyEmailCode,
  verifyPhoneRegistration,
} from "../api/registration";
import { getSession, saveSession } from "../auth/session";
import { AppText } from "../components/AppText";
import { Button } from "../components/Button";
import { ChapterShell } from "../components/ChapterShell";
import { ChipSelect } from "../components/ChipSelect";
import { Sheet } from "../components/Sheet";
import { TasteSpark } from "../components/TasteSpark";
import { LivenessCheck } from "../components/LivenessCheck";
import type { EditTarget } from "../components/ProfileStory";
import {
  CHIP_GROUPS,
  INTENT_OUTCOMES,
  LOOKING_FOR,
  MAX_CHIPS,
  MIN_CHIPS,
  PHOTO_SLOTS,
  PROFILE_PROMPTS,
  RHYTHM,
  TRACK_OPTIONS,
  outcomesForTrack,
} from "../data/profileOptions";
import { REQUIRED_PROMPTS, OPTIONAL_PROMPT_MAX } from "../config/aynera";
import { AgeRangeSelector } from "../components/AgeRangeSelector";
import { ChoiceCard } from "../components/ChoiceCard";
import { CodeInput, CODE_LENGTH } from "../components/CodeInput";
import { Field } from "../components/Field";
import { HeightPicker } from "../components/HeightPicker";
import { PrivacyHint } from "../components/PrivacyHint";
import { VisibilityToggle } from "../components/VisibilityToggle";
import { QuestionCard } from "../components/QuestionCard";
import { VibeMoment } from "../components/VibeMoment";
import { useLaunchCities } from "../data/cities";
import {
  BELIEF_QUESTIONS,
  HEIGHT_DEFAULT_CM,
  LIFESTYLE_QUESTIONS,
  formatHeight,
} from "../data/lifestyleOptions";
import { VIBE_MOMENTS } from "../data/vibeMoments";
import { sparkForChip } from "../data/tasteSparks";
import type { RootStackParamList } from "../navigation/types";
import {
  ageFromBirth,
  emptyDraft,
  GENDER_OPTIONS,
  getProfileDraft,
  isValidEmail,
  isValidPhone,
  optionalAnswer,
  PHOTO_ROLES,
  publicIntroName,
  publishedVitals,
  realFirstName,
  setProfileDraft,
  type IntroStyle,
  type OptionalAnswer,
  type ProfileDraft,
  type PromptAnswer,
} from "../state/profileDraft";
import { colors, fonts, leading, radius, spacing, typography } from "../theme";
type Props = NativeStackScreenProps<RootStackParamList, "ProfileSetup">;

/** Backend error codes the access and profile steps can hit, in the app's voice. */
function accessStepError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";
  switch (error.code) {
    case "user_already_exists":
      return "This number already has an account. Go back and tap \"I already applied\" to sign in.";
    case "account_deactivated":
      return "This number belongs to a deactivated account. Sign in to reactivate it.";
    case "account_restricted":
      return "This number can't be used to register. Please contact support.";
    case "email_already_exists":
      return "That email is already on another account. Use a different one.";
    case "otp_rate_limited":
      return "Too many codes requested. Please wait a few minutes.";
    case "otp_expired":
      return "That code has expired. Send a new one.";
    case "otp_invalid":
      return "That code isn't right. Check it and try again.";
    case "otp_locked":
      return "Too many wrong codes. Send a new one to continue.";
    case "city_not_supported":
      return "Aynera isn't open in that city yet. Pick one from the list.";
    case "underage":
      return "You need to be 18 to join Aynera.";
    case "validation_failed":
      return (
        error.field("phone") ??
        error.field("email") ??
        error.field("name") ??
        error.field("nickname") ??
        error.field("dateOfBirth") ??
        error.field("city") ??
        "Please check what you entered."
      );
    case "network_error":
    case "request_timeout":
      return "We couldn't reach Aynera. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}

type StepId =
  | "arrive"
  | "phone"
  | "phoneCode"
  | "email"
  | "emailCode"
  | "you"
  | "self"
  | "birth"
  | "life"
  | "looking"
  | "momentConnect"
  | "taste"
  | "intent"
  | "lifestyle"
  | "beliefs"
  | "photos"
  | "liveness"
  | "notifications"
  | "voicePick"
  | "voiceAnswer"
  | "momentGlimpse"
  | "reveal"
  | "dealbreaker"
  | "video"
  | "rhythm";

const REQUIRED_FLOW: StepId[] = [
  "arrive",
  "phone",
  "phoneCode",
  "email",
  "emailCode",
  "you",
  "self",
  "birth",
  "life",
  "looking",
  "momentConnect",
  "intent",
  "lifestyle",
  "beliefs",
  "taste",
  "photos",
  "video",
  "voicePick",
  "voiceAnswer",
  "liveness",
  "notifications",
  "momentGlimpse",
  "reveal",
];

/** Enrichment steps that offer an explicit way past. */
const SKIPPABLE: StepId[] = ["dealbreaker", "video", "rhythm"];

const MOMENT_STEPS: Partial<Record<StepId, keyof typeof VIBE_MOMENTS>> = {
  arrive: "arrive",
  momentConnect: "connect",
  momentGlimpse: "glimpse",
};

const META: Record<
  StepId,
  { act: string; vibe: string; tone: "dusk" | "paper" | "rose"; cta: string }
> = {
  arrive: {
    act: "Arrive",
    vibe: "Open your introduction.",
    tone: "paper",
    cta: "Begin",
  },
  phone: {
    act: "Access",
    vibe: "What's your number?",
    tone: "paper",
    cta: "Send my code",
  },
  phoneCode: {
    act: "Access",
    vibe: "Enter the six digits.",
    tone: "paper",
    cta: "Confirm",
  },
  email: {
    act: "Access",
    vibe: "And an email we can reach you on?",
    tone: "paper",
    cta: "Send my code",
  },
  emailCode: {
    act: "Access",
    vibe: "Enter the six digits.",
    tone: "paper",
    cta: "Confirm",
  },
  you: {
    act: "You",
    vibe: "What you're called.",
    tone: "paper",
    cta: "Continue",
  },
  self: {
    act: "You",
    vibe: "How you'd describe yourself.",
    tone: "paper",
    cta: "Continue",
  },
  birth: {
    act: "You",
    vibe: "When and where you're from.",
    tone: "paper",
    cta: "Continue",
  },
  looking: {
    act: "You",
    vibe: "Who you'd like to meet.",
    tone: "paper",
    cta: "Continue",
  },
  lifestyle: {
    act: "Everyday",
    vibe: "How your everyday actually runs.",
    tone: "rose",
    cta: "Continue",
  },
  beliefs: {
    act: "Everyday",
    vibe: "What matters quietly.",
    tone: "rose",
    cta: "Continue",
  },
  notifications: {
    act: "Almost there",
    vibe: "Should we tell you when an introduction lands?",
    tone: "paper",
    cta: "Yes, let me know",
  },
  life: {
    act: "You",
    vibe: "Where you are now.",
    tone: "paper",
    cta: "Continue",
  },
  momentConnect: {
    act: "Pause",
    vibe: "These next details can help others connect with you.",
    tone: "paper",
    cta: "Continue",
  },
  taste: {
    act: "Vibe",
    vibe: "Pick what feels like your real life — not a résumé.",
    tone: "rose",
    cta: "Next vibe",
  },
  intent: {
    act: "Intent",
    vibe: "What would you be happy if this became?",
    tone: "paper",
    cta: "Continue",
  },
  photos: {
    act: "Presence",
    vibe: "Five photos. Each with a line in your words.",
    tone: "paper",
    cta: "Continue",
  },
  liveness: {
    act: "Verify",
    vibe: "A quick face check so we know you're really you.",
    tone: "paper",
    cta: "Continue",
  },
  momentGlimpse: {
    act: "Pause",
    vibe: "Your profile is a glimpse of you.",
    tone: "paper",
    cta: "Continue",
  },
  video: {
    act: "Intro video",
    vibe: "Thirty seconds of you talking",
    tone: "paper",
    cta: "Looks good",
  },
  dealbreaker: {
    act: "A little more",
    vibe: "Share something that helps someone understand you beyond the profile .. only if you want",
    tone: "rose",
    cta: "Keep going",
  },
  voicePick: {
    act: "Voice",
    vibe: "Choose two conversation prompts .. a third can wait",
    tone: "paper",
    cta: "Answer them",
  },
  voiceAnswer: {
    act: "Voice",
    vibe: "Make each answer specific enough to reply to.",
    tone: "paper",
    cta: "Keep going",
  },
  rhythm: {
    act: "Rhythm",
    vibe: "The shape of your ordinary week.",
    tone: "rose",
    cta: "Keep going",
  },
  reveal: {
    act: "Reveal",
    vibe: "This is how Aynera will read you.",
    tone: "dusk",
    cta: "Send for a human read",
  },
};

/** Where an "Edit" tap from the preview should land. */
const EDIT_ENTRY: Record<EditTarget, StepId> = {
  hero: "photos",
  life: "life",
  // "basics" is the vitals-panel edit chip, and height is what it was about.
  basics: "self",
  birth: "birth",
  self: "self",
  looking: "looking",
  everyday: "lifestyle",
  voice: "voiceAnswer",
  story: "dealbreaker",
  taste: "taste",
  intent: "intent",
  video: "video",
  rhythm: "rhythm",
};

function flowFor(startAt?: EditTarget): StepId[] {
  if (!startAt) return REQUIRED_FLOW;
  if (startAt === "taste") return ["taste"];
  if (startAt === "voice") return ["voicePick", "voiceAnswer"];
  if (startAt === "everyday") return ["lifestyle", "beliefs"];
  return [EDIT_ENTRY[startAt]];
}

export function ProfileSetupScreen({ navigation, route }: Props) {
  const startAt = route.params?.startAt;
  const FLOW = flowFor(startAt);
  const [index, setIndex] = useState(0);
  /** Re-entry from the preview continues the saved draft. */
  const [draft, setDraft] = useState<ProfileDraft>(() => {
    const saved = getProfileDraft();
    return saved.name ? saved : emptyDraft();
  });
  const [tasteIndex, setTasteIndex] = useState(0);
  const [tasteSummary, setTasteSummary] = useState(false);
  const [encourage, setEncourage] = useState("");
  const [exitOpen, setExitOpen] = useState(false);
  const [spark, setSpark] = useState({ chip: "", text: "", key: 0 });
  const [smsCode, setSmsCode] = useState("");
  const [mailCode, setMailCode] = useState("");
  const [resent, setResent] = useState<"" | "sms" | "mail">("");
  /** A backend call for the current access step is in flight. */
  const [busy, setBusy] = useState(false);
  /** Backend refusal for the current access step; cleared on any input change. */
  const [stepError, setStepError] = useState<string | null>(null);
  const [livenessOpen, setLivenessOpen] = useState(false);

  /**
   * Cities offered on the `life` step, live from the catalog. Only the founding wave is
   * open for registration; if the catalog somehow reports none, fall back to the whole
   * active list rather than render an empty list the member cannot get past.
   */
  const catalogCities = useLaunchCities();
  const openCities = useMemo(() => {
    const founding = catalogCities.filter((c) => c.status === "founding");
    return founding.length > 0 ? founding : catalogCities;
  }, [catalogCities]);

  const scrollRef = useRef<ScrollView>(null);
  /** Day, month, year boxes, so each can hand focus to its neighbour. */
  const birthInputs = useRef<(TextInput | null)[]>([]);
  const fieldY = useRef<Record<string, number>>({});
  const pendingReveal = useRef<{ mode: "end" | "y"; y: number } | null>(null);

  /** Keep the focused field above the keyboard on every setup step. */
  const revealFocusedField = useCallback((mode: "end" | "y" = "end", y = 0) => {
    pendingReveal.current = { mode, y };
    const delay = Platform.OS === "ios" ? 100 : 240;
    setTimeout(() => {
      const pending = pendingReveal.current;
      if (!pending) return;
      if (pending.mode === "end") {
        scrollRef.current?.scrollToEnd({ animated: true });
        return;
      }
      scrollRef.current?.scrollTo({
        y: Math.max(pending.y - 56, 0),
        animated: true,
      });
    }, delay);
  }, []);

  useEffect(() => {
    const event = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const sub = Keyboard.addListener(event, () => {
      const pending = pendingReveal.current;
      if (!pending) return;
      setTimeout(() => {
        if (pending.mode === "end") {
          scrollRef.current?.scrollToEnd({ animated: true });
          return;
        }
        scrollRef.current?.scrollTo({
          y: Math.max(pending.y - 56, 0),
          animated: true,
        });
      }, Platform.OS === "ios" ? 16 : 40);
    });
    return () => sub.remove();
  }, []);

  // A signed-in member resuming a Draft account: seed the access steps from the server so the
  // already-verified phone/email are skipped instead of tripping "already registered".
  useEffect(() => {
    if (!getSession()) return;
    let cancelled = false;
    void getMe()
      .then((account) => {
        if (cancelled) return;
        setDraft((current) => ({
          ...current,
          phone: account.phone ? account.phone.replace(/\D/g, "").slice(-10) : current.phone,
          phoneVerified: account.phoneConfirmed || current.phoneVerified,
          email: account.email ?? current.email,
          emailVerified: account.emailConfirmed || current.emailVerified,
          name: current.name || account.profile?.name || "",
          nickname: current.nickname || account.profile?.nickname || "",
          introStyle: current.nickname || account.profile?.nickname ? "nickname" : current.introStyle,
          gender: current.gender || (account.profile?.gender as ProfileDraft["gender"]) || "",
          genderIsPublic: account.profile?.genderIsPublic ?? current.genderIsPublic,
          city: current.city || account.profile?.city || "",
          heightCm: current.heightCm ?? account.profile?.heightCm ?? null,
          hometown: current.hometown || account.profile?.hometown || "",
          work: current.work || account.profile?.work || "",
        }));
      })
      .catch(() => {
        /* offline or expired session — the steps will simply ask again */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // While only one city is open there is nothing to choose, so pick it. Guarded on an empty
  // city so re-entering this step from Settings never overwrites the member's own answer.
  useEffect(() => {
    if (openCities.length !== 1) return;
    setDraft((current) =>
      current.city === "" ? { ...current, city: openCities[0].id } : current,
    );
  }, [openCities]);

  const editing = !!startAt;
  const step = FLOW[index];
  const meta = META[step];
  const progress = (index + 1) / FLOW.length;
  const group = CHIP_GROUPS[tasteIndex];

  const photoCount = draft.photos.filter((p) => !!p.uri).length;
  const verified = !!draft.verification.uri;
  const age = ageFromBirth(draft.birth);
  const answered = draft.prompts.filter((p) => p.answer.trim().length > 8).length;
  const promptCap = startAt === "voice" ? OPTIONAL_PROMPT_MAX : REQUIRED_PROMPTS;

  const pickPhoto = async (slotId: string) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.9,
    });
    const uri = result.canceled ? null : result.assets[0]?.uri;
    if (!uri) return;
    setDraft((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === slotId ? { ...p, uri } : p)),
    }));
  };

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      videoMaxDuration: 30,
      quality: 0.9,
    });
    const uri = result.canceled ? null : result.assets[0]?.uri;
    if (!uri) return;
    setDraft((prev) => ({ ...prev, video: { ...prev.video, uri } }));
  };

  const pickVerification = () => {
    setLivenessOpen(true);
  };

  const patch = (partial: Partial<ProfileDraft>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  /** Optional answers live in a map, so each one patches in place. */
  const patchAnswer = (
    field: "lifestyle" | "beliefs",
    id: string,
    change: Partial<OptionalAnswer>,
  ) =>
    setDraft((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [id]: { ...optionalAnswer(prev[field], id), ...change },
      },
    }));

  const dismissSpark = useCallback(() => {
    setSpark((prev) => (prev.text ? { ...prev, text: "" } : prev));
  }, []);

  /** A spark never follows you off the screen. */
  useEffect(
    () => navigation.addListener("blur", dismissSpark),
    [navigation, dismissSpark],
  );

  /** Every chapter starts at the top — never inherit the previous step's offset. */
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [step, tasteIndex, tasteSummary]);

  const toggleChip = (option: string) => {
    const on = draft.chips.includes(option);
    const full = draft.chips.length >= MAX_CHIPS;
    if (on || full) {
      dismissSpark();
    } else {
      setSpark((s) => ({
        chip: option,
        text: sparkForChip(option),
        key: s.key + 1,
      }));
    }

    const chips = on
      ? draft.chips.filter((c) => c !== option)
      : full
        ? draft.chips
        : [...draft.chips, option];

    if (!on) {
      if (chips.length === 3) setEncourage("You’re starting to sound specific.");
      else if (chips.length === MIN_CHIPS)
        setEncourage("Nice start — keep browsing the other vibes.");
      else if (chips.length === 10)
        setEncourage("Rich — leave a little mystery too.");
      else setEncourage("");
    }

    patch({ chips });
  };

  /**
   * Returns null when the step is complete, otherwise the exact sentence shown
   * above the disabled button. A greyed-out CTA with no explanation is the
   * single most common place people give up.
   */
  const missing = useMemo((): string | null => {
    switch (step) {
      case "arrive":
      case "momentConnect":
      case "momentGlimpse":
      case "dealbreaker":
      case "reveal":
      case "rhythm":
      case "video":
      case "lifestyle":
      case "beliefs":
      case "notifications":
        return null;
      case "phone":
        return isValidPhone(draft.phone)
          ? null
          : "A 10-digit mobile number we can confirm";
      case "phoneCode":
        return smsCode.length < CODE_LENGTH
          ? `${CODE_LENGTH - smsCode.length} more digit${CODE_LENGTH - smsCode.length === 1 ? "" : "s"}`
          : null;
      case "email":
        return isValidEmail(draft.email) ? null : "An email we can confirm";
      case "emailCode":
        return mailCode.length < CODE_LENGTH
          ? `${CODE_LENGTH - mailCode.length} more digit${CODE_LENGTH - mailCode.length === 1 ? "" : "s"}`
          : null;
      case "you":
        if (draft.name.trim().length < 2)
          return "Your first name, however you say it out loud";
        if (
          draft.introStyle === "nickname" &&
          draft.nickname.trim().length < 2
        )
          return "A nickname of at least 2 letters, or switch to first letter";
        return null;
      case "self":
        return draft.gender === "" ? "Pick the one that fits you" : null;
      case "birth":
        return age === null
          ? "A full birth date — you'll be shown as an age, never a date"
          : null;
      case "looking":
        return draft.lookingFor === ""
          ? "Choose who you're hoping to meet"
          : null;
      case "life":
        if (draft.city === "") return "Pick the city you're actually in";
        if (draft.work.trim().length < 2) return "A few words about what you do with your days";
        return null;
      case "taste":
        if (tasteIndex < CHIP_GROUPS.length - 1) return null;
        return draft.chips.length < MIN_CHIPS
          ? `${MIN_CHIPS - draft.chips.length} more picks and your vibe starts to have a shape`
          : null;
      case "intent":
        if (draft.relationshipTrack === "") return "Choose Fluid or Intent";
        if (draft.intentOutcome === "") return "Now choose the one that fits";
        return null;
      case "photos":
        return photoCount < PHOTO_SLOTS
          ? `${PHOTO_SLOTS - photoCount} more photo${PHOTO_SLOTS - photoCount === 1 ? "" : "s"} — five is where a stranger starts to trust a face`
          : null;
      case "liveness":
        return verified ? null : "Complete the face check so we can review access";
      case "voicePick":
        return draft.prompts.length < REQUIRED_PROMPTS
          ? `Choose ${REQUIRED_PROMPTS - draft.prompts.length} more`
          : null;
      case "voiceAnswer":
        return answered < REQUIRED_PROMPTS
          ? `${REQUIRED_PROMPTS - answered} answer${REQUIRED_PROMPTS - answered === 1 ? "" : "s"} still need a real sentence`
          : null;
      case "rhythm":
        if (draft.socialEnergy === "") return "How you recharge with people";
        if (draft.weekends === "") return "What a good weekend feels like";
        if (draft.family === "") return "How close family is right now";
        return null;
      default:
        return null;
    }
  }, [
    age,
    answered,
    draft,
    mailCode,
    photoCount,
    smsCode,
    step,
    tasteIndex,
    verified,
  ]);

  const canPrimary = missing === null && !busy;

  /** Runs one backend call for an access step; on success the caller advances. */
  const callBackend = async (work: () => Promise<void>): Promise<boolean> => {
    if (busy) return false;
    setBusy(true);
    setStepError(null);
    try {
      await work();
      return true;
    } catch (error) {
      setStepError(accessStepError(error));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const advance = () => setIndex((v) => Math.min(v + 1, FLOW.length - 1));

  /** The API's `YYYY-MM-DD`; the draft keeps the three boxes the member typed. */
  const isoBirthDate = (birth: ProfileDraft["birth"]) =>
    `${birth.year.padStart(4, "0")}-${birth.month.padStart(2, "0")}-${birth.day.padStart(2, "0")}`;

  /** The steps that talk to the API; everything else only touches the local draft. */
  const runAccessStep = async (): Promise<boolean> => {
    switch (step) {
      case "phone": {
        // A verified number with a live session (resumed draft) skips straight past the code.
        if (draft.phoneVerified && getSession()) {
          setIndex((v) => Math.min(v + 2, FLOW.length - 1));
          return false;
        }
        const ok = await callBackend(async () => {
          await startPhoneRegistration(draft.phone);
        });
        if (ok) setSmsCode("");
        return ok;
      }
      case "phoneCode": {
        return callBackend(async () => {
          const tokens = await verifyPhoneRegistration(draft.phone, smsCode);
          await saveSession({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
          patch({ phoneVerified: true });
        });
      }
      case "email": {
        if (draft.emailVerified && getSession()) {
          setIndex((v) => Math.min(v + 2, FLOW.length - 1));
          return false;
        }
        const ok = await callBackend(async () => {
          await startEmailVerification(draft.email.trim());
        });
        if (ok) setMailCode("");
        return ok;
      }
      case "emailCode": {
        return callBackend(async () => {
          await verifyEmailCode(draft.email.trim(), mailCode);
          patch({ emailVerified: true });
        });
      }
      case "life": {
        // The last step of the basic details — city is collected here, and the API requires it, so
        // this is the first point the whole set can be sent. Everything before this stayed on device.
        if (draft.gender === "") return true;
        return callBackend(async () => {
          await saveProfile({
            name: draft.name.trim(),
            gender: draft.gender as Exclude<ProfileDraft["gender"], "">,
            genderIsPublic: draft.genderIsPublic,
            dateOfBirth: isoBirthDate(draft.birth),
            city: draft.city,
            nickname:
              draft.introStyle === "nickname" && draft.nickname.trim().length >= 2
                ? draft.nickname.trim()
                : null,
            heightCm: draft.heightCm,
            hometown: draft.hometown.trim() || null,
            work: draft.work.trim() || null,
          });
        });
      }
      case "intent": {
        // The last of the two preference steps — "looking" is answered by now, so the
        // whole §6 filter set goes in one write, the way the profile does at "life".
        if (draft.lookingFor === "" || draft.intentOutcome === "") return true;
        return callBackend(async () => {
          await savePreferences({
            interestedIn: draft.lookingFor as Exclude<ProfileDraft["lookingFor"], "">,
            minAge: draft.ageMin,
            maxAge: draft.ageMax,
            ageIsFlexible: draft.ageFlexible,
            intentOutcome: draft.intentOutcome as Exclude<ProfileDraft["intentOutcome"], "">,
          });
        });
      }
      default:
        return true;
    }
  };

  const resendCode = async (kind: "sms" | "mail") => {
    const ok = await callBackend(async () => {
      if (kind === "sms") await startPhoneRegistration(draft.phone);
      else await startEmailVerification(draft.email.trim());
    });
    if (ok) {
      setResent(kind);
      if (kind === "sms") setSmsCode("");
      else setMailCode("");
    }
  };

  const goNext = () => {
    dismissSpark();
    setResent("");
    if (
      step === "phone" ||
      step === "phoneCode" ||
      step === "email" ||
      step === "emailCode" ||
      step === "life" ||
      step === "intent"
    ) {
      void runAccessStep().then((ok) => {
        if (ok) advance();
      });
      return;
    }
    if (step === "notifications") patch({ notificationsOn: true });
    if (step === "self" && draft.heightCm === null)
      patch({ heightCm: HEIGHT_DEFAULT_CM });
    if (step === "taste" && !tasteSummary) {
      // Always walk every taste category before the summary.
      if (tasteIndex < CHIP_GROUPS.length - 1) {
        setTasteIndex((v) => v + 1);
        setEncourage("");
        return;
      }
      if (draft.chips.length < MIN_CHIPS) return;
      setTasteSummary(true);
      return;
    }
    if (editing && index >= FLOW.length - 1) {
      setProfileDraft(draft);
      navigation.replace("Premiere");
      return;
    }
    if (step === "reveal") {
      setProfileDraft(draft);
      navigation.replace("Premiere");
      return;
    }
    setIndex((v) => Math.min(v + 1, FLOW.length - 1));
  };

  const goBack = () => {
    dismissSpark();
    setResent("");
    setStepError(null);
    if (tasteSummary) {
      setTasteSummary(false);
      return;
    }
    if (step === "taste" && tasteIndex > 0) {
      setTasteIndex((v) => v - 1);
      setEncourage("");
      return;
    }
    if (index === 0) {
      navigation.goBack();
      return;
    }
    setIndex((v) => Math.max(v - 1, 0));
  };

  const tasteCta = tasteSummary
    ? "That's my vibe"
    : editing && step !== "taste"
      ? "Save & preview"
      : step === "taste" && tasteIndex < CHIP_GROUPS.length - 1
        ? "Next vibe"
        : step === "taste"
          ? "This is my vibe"
          : meta.cta;

  const primaryDisabled = !canPrimary;

  /** Saves whatever exists and leaves. Nothing typed is ever lost. Only an approved member enters Main. */
  const saveAndClose = () => {
    dismissSpark();
    setProfileDraft(draft);
    setExitOpen(false);
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  };

  const momentId = MOMENT_STEPS[step];
  if (momentId) {
    return (
      <VibeMoment
        moment={VIBE_MOMENTS[momentId]}
        onContinue={goNext}
        onBack={goBack}
      />
    );
  }

  return (
    <ChapterShell
      act={
        step === "taste"
          ? `Vibe · ${tasteIndex + 1}/${CHIP_GROUPS.length}`
          : `${meta.act} · ${index + 1}/${FLOW.length}`
      }
      vibe={
        tasteSummary
          ? "Your Vibe"
          : step === "taste"
            ? group.title
            : meta.vibe
      }
      progress={progress}
      tone={meta.tone}
      primaryLabel={busy ? "One moment…" : tasteCta}
      primaryDisabled={primaryDisabled}
      disabledReason={busy ? undefined : (missing ?? undefined)}
      onPrimary={goNext}
      onBack={goBack}
      onExit={editing ? undefined : () => setExitOpen(true)}
      secondaryLabel={
        step === "notifications"
          ? "Not now"
          : SKIPPABLE.includes(step)
          ? "Skip for now"
          : undefined
      }
      onSecondary={
        step === "notifications"
          ? () => {
              patch({ notificationsOn: false });
              setIndex((v) => Math.min(v + 1, FLOW.length - 1));
            }
          : SKIPPABLE.includes(step)
          ? () => {
              if (editing) {
                setProfileDraft(draft);
                navigation.replace("Premiere");
                return;
              }
              setIndex((v) => Math.min(v + 1, FLOW.length - 1));
            }
          : undefined
      }
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      >
        {step === "phone" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              One number, one person. It's how we keep the circle real.
            </AppText>
            <View style={styles.phoneRow}>
              <View style={styles.dial}>
                <AppText variant="label" tone="ink">
                  +91
                </AppText>
              </View>
              <Field
                variant="box"
                value={draft.phone}
                onChangeText={(raw) => {
                  setSmsCode("");
                  setStepError(null);
                  patch({
                    phone: raw.replace(/\D/g, "").slice(0, 10),
                    phoneVerified: false,
                  });
                }}
                placeholder="98765 43210"
                keyboardType="number-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                autoFocus
                style={styles.phoneInput}
                accessibilityLabel="Mobile number"
                onFocus={() => revealFocusedField("end")}
              />
            </View>
            <PrivacyHint text="Never shown on your profile" />
            <Text style={styles.helper}>
              We'll send a six-digit code to confirm it's yours. No one can find
              you by your number.
            </Text>
            {stepError ? (
              <AppText variant="meta" tone="rose" center>
                {stepError}
              </AppText>
            ) : null}
          </View>
        )}
        {step === "phoneCode" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              Sent to +91 {draft.phone}
            </AppText>
            <CodeInput
              value={smsCode}
              onChange={(next) => {
                setStepError(null);
                setSmsCode(next);
              }}
              autoFocus
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Resend the code"
              disabled={busy}
              onPress={() => void resendCode("sms")}
              style={styles.resend}
            >
              <Text style={styles.resendText}>
                {resent === "sms" ? "Code sent again" : "Didn't get it? Send again"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change my number"
              onPress={goBack}
              style={styles.resend}
            >
              <Text style={styles.resendMuted}>Wrong number? Change it</Text>
            </Pressable>
            <Text style={styles.helper}>
              The code is valid for five minutes.
            </Text>
            {stepError ? (
              <AppText variant="meta" tone="rose" center>
                {stepError}
              </AppText>
            ) : null}
          </View>
        )}
        {step === "email" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              For your introduction and nothing else. No newsletters.
            </AppText>
            <Field
              variant="box"
              value={draft.email}
              onChangeText={(email) => {
                setMailCode("");
                setStepError(null);
                patch({ email, emailVerified: false });
              }}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              autoFocus
              accessibilityLabel="Email address"
              onFocus={() => revealFocusedField("end")}
            />
            <PrivacyHint text="Never shown on your profile" />
            {stepError ? (
              <AppText variant="meta" tone="rose" center>
                {stepError}
              </AppText>
            ) : null}
          </View>
        )}
        {step === "emailCode" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              Sent to {draft.email}
            </AppText>
            <CodeInput
              value={mailCode}
              onChange={(next) => {
                setStepError(null);
                setMailCode(next);
              }}
              autoFocus
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Resend the code"
              disabled={busy}
              onPress={() => void resendCode("mail")}
              style={styles.resend}
            >
              <Text style={styles.resendText}>
                {resent === "mail" ? "Code sent again" : "Didn't get it? Send again"}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change my email"
              onPress={goBack}
              style={styles.resend}
            >
              <Text style={styles.resendMuted}>Wrong address? Change it</Text>
            </Pressable>
            <Text style={styles.helper}>
              The code is valid for five minutes.
            </Text>
            {stepError ? (
              <AppText variant="meta" tone="rose" center>
                {stepError}
              </AppText>
            ) : null}
          </View>
        )}
        {step === "lifestyle" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              Answer what you like. Each one has its own switch — answering
              isn't the same as publishing.
            </AppText>
            <View style={styles.stack}>
              {LIFESTYLE_QUESTIONS.map((q) => {
                const answer = optionalAnswer(draft.lifestyle, q.id);
                return (
                  <QuestionCard
                    key={q.id}
                    question={q.question}
                    hint={q.hint}
                    options={q.options}
                    value={answer.value}
                    visible={answer.visible}
                    onChange={(value) => patchAnswer("lifestyle", q.id, { value })}
                    onChangeVisible={(visible) =>
                      patchAnswer("lifestyle", q.id, { visible })
                    }
                  />
                );
              })}
            </View>
          </View>
        )}
        {step === "beliefs" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              These help a curator introduce you well. Keep any of them private.
            </AppText>
            <View style={styles.stack}>
              {BELIEF_QUESTIONS.map((q) => {
                const answer = optionalAnswer(draft.beliefs, q.id);
                return (
                  <QuestionCard
                    key={q.id}
                    question={q.question}
                    hint={q.hint}
                    options={q.options}
                    value={answer.value}
                    visible={answer.visible}
                    onChange={(value) => patchAnswer("beliefs", q.id, { value })}
                    onChangeVisible={(visible) =>
                      patchAnswer("beliefs", q.id, { visible })
                    }
                  />
                );
              })}
            </View>
          </View>
        )}
        {step === "notifications" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              Introductions arrive in small numbers, so a missed one matters
            </AppText>
            <View style={styles.stack}>
              {[
                {
                  title: "A new Duo",
                  body: "When someone is introduced to you",
                },
                {
                  title: "A reply",
                  body: "When a conversation you started moves",
                },
                {
                  title: "Weekend Surprise",
                  body: "When a Saturday drop opens in Bangalore",
                },
              ].map((row) => (
                <View key={row.title} style={styles.notifyRow}>
                  <AppText variant="label" tone="ink">
                    {row.title}
                  </AppText>
                  <AppText variant="meta" tone="muted">
                    {row.body}
                  </AppText>
                </View>
              ))}
            </View>
            <Text style={styles.helper}>
              No streaks, no nudges to come back, nothing at 2am.
            </Text>
          </View>
        )}
        {step === "you" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              Your real name — kept for verification and shown after a match
            </AppText>
            <Field
              value={draft.name}
              onChangeText={(name) => patch({ name })}
              placeholder="Name"
              variant="box"
              autoFocus
              maxFontSizeMultiplier={1.2}
              // This field sits at the top of the step, so revealing it means staying at the top.
              // scrollToEnd would drop the member at the birth date, away from what they just tapped.
              onFocus={() => revealFocusedField("y", 0)}
            />

            <Text style={styles.fieldLabel}>Before a match, introduce me as</Text>
            <View style={styles.stack}>
              <ChoiceCard
                label={
                  draft.name.trim().length >= 1
                    ? `Just my initial · ${draft.name.trim().charAt(0).toUpperCase()}.`
                    : "Just my initial"
                }
                hint="Strangers see only the first letter until you match"
                selected={draft.introStyle === "initial"}
                onPress={() => patch({ introStyle: "initial" as IntroStyle })}
              />
              <ChoiceCard
                label="A nickname"
                hint="A short name for Duos — real name after you match"
                selected={draft.introStyle === "nickname"}
                onPress={() => patch({ introStyle: "nickname" as IntroStyle })}
              />
            </View>
            {draft.introStyle === "nickname" ? (
              <Field
                value={draft.nickname}
                onChangeText={(nickname) => patch({ nickname })}
                placeholder="Nickname"
                variant="box"
                maxFontSizeMultiplier={1.2}
                onFocus={() => revealFocusedField("end")}
              />
            ) : null}
            <PrivacyHint
              text={
                draft.introStyle === "nickname" && draft.nickname.trim().length >= 2
                  ? `Before a match: ${publicIntroName(draft)} · After a match: ${realFirstName(draft.name) || "your real name"}`
                  : draft.name.trim().length >= 1
                    ? `Before a match: ${publicIntroName(draft)} · After a match: ${realFirstName(draft.name)}`
                    : "After a mutual match, your real first name is always shown"
              }
            />
          </View>
        )}
        {step === "self" && (
          <View style={styles.block}>
            <Text style={styles.fieldLabel}>How do you describe yourself?</Text>
            <View style={styles.stack}>
              {GENDER_OPTIONS.map((option) => (
                <ChoiceCard
                  key={option.value}
                  label={option.label}
                  selected={draft.gender === option.value}
                  onPress={() => patch({ gender: option.value })}
                />
              ))}
            </View>
            <VisibilityToggle
              visible={draft.genderIsPublic}
              onChange={(genderIsPublic) => patch({ genderIsPublic })}
              hiddenLabel="Prefer not to say — kept off your profile"
              accessibilityLabel="Show my gender on my profile"
            />

            <Text style={styles.fieldLabel}>How tall are you?</Text>
            <HeightPicker
              cm={draft.heightCm ?? HEIGHT_DEFAULT_CM}
              onChange={(heightCm) => patch({ heightCm })}
            />
            <PrivacyHint kind="eye" text="Shown on your profile" />
          </View>
        )}
        {step === "birth" && (
          <View style={styles.block}>
            <View style={styles.birthRow}>
              {(
                [
                  { key: "day", label: "DD", max: 2 },
                  { key: "month", label: "MM", max: 2 },
                  { key: "year", label: "YYYY", max: 4 },
                ] as const
              ).map((field, fieldIndex) => (
                <Field
                  key={field.key}
                  ref={(input) => {
                    birthInputs.current[fieldIndex] = input;
                  }}
                  variant="compact"
                  value={draft.birth[field.key]}
                  onChangeText={(raw) => {
                    const previous = draft.birth[field.key];
                    const digits = raw.replace(/[^0-9]/g, "").slice(0, field.max);
                    patch({ birth: { ...draft.birth, [field.key]: digits } });
                    // A box that just filled up hands over, so the date types straight
                    // through. Requiring a change stops a keystroke into an already-full
                    // box — which the slice discards — from jumping away for nothing.
                    if (digits.length === field.max && digits !== previous) {
                      birthInputs.current[fieldIndex + 1]?.focus();
                    }
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    // Backspace in an empty box steps back, rather than doing nothing.
                    if (
                      nativeEvent.key === "Backspace" &&
                      draft.birth[field.key] === ""
                    ) {
                      birthInputs.current[fieldIndex - 1]?.focus();
                    }
                  }}
                  placeholder={field.label}
                  keyboardType="number-pad"
                  autoFocus={field.key === "day"}
                  maxFontSizeMultiplier={1.2}
                  accessibilityLabel={
                    field.key === "day" ? "Day" : field.key === "month" ? "Month" : "Year"
                  }
                  style={field.key === "year" ? styles.birthInputWide : styles.birthInput}
                  // Top of its own step now, so revealing means staying put.
                  onFocus={() => revealFocusedField("y", 0)}
                />
              ))}
            </View>
            <Text style={styles.helper}>
              {age
                ? `You’ll be introduced as ${age}.`
                : "Your age is shown; your birthday never is."}
            </Text>
            <PrivacyHint text="Your date of birth is never shown publicly" />

            <Text style={styles.fieldLabel}>Where are you originally from?</Text>
            <Field
              variant="box"
              value={draft.hometown}
              onChangeText={(hometown) => patch({ hometown })}
              placeholder="Kochi, Patna, Pune…"
              maxFontSizeMultiplier={1.2}
              onFocus={() => revealFocusedField("end")}
            />
            <Text style={styles.helper}>
              Hometowns start more conversations here than job titles do.
            </Text>
            <PrivacyHint kind="eye" text="Shown on your profile" />
          </View>
        )}
        {step === "life" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              We'll use this to introduce you nearby. Only the city appears on your profile.
            </AppText>
            <View style={styles.stack}>
              {openCities.map((city) => (
                <ChoiceCard
                  key={city.id}
                  label={city.label}
                  hint={city.helper}
                  selected={draft.city === city.id}
                  onPress={() => patch({ city: city.id })}
                />
              ))}
            </View>
            <PrivacyHint text="Your city or general area may be shown" />

            <Text style={styles.fieldLabel}>What you do with your days</Text>
            <Field
              variant="box"
              value={draft.work}
              onChangeText={(work) => patch({ work })}
              placeholder="Architect, teacher, founder…"
              maxFontSizeMultiplier={1.2}
              onFocus={() => revealFocusedField("end")}
            />
            <Text style={styles.helper}>
              Plain and true beats impressive. This sits under your name.
            </Text>
          </View>
        )}
        {step === "looking" && (
          <View style={styles.block}>
            <Text style={styles.fieldLabel}>Who would you like to meet?</Text>
            <View style={styles.stack}>
              {LOOKING_FOR.map((option) => (
                <ChoiceCard
                  key={option.id}
                  label={option.label}
                  hint={option.hint}
                  selected={draft.lookingFor === option.id}
                  onPress={() => patch({ lookingFor: option.id })}
                />
              ))}
            </View>

            <AgeRangeSelector
              minAge={draft.ageMin}
              maxAge={draft.ageMax}
              flexible={draft.ageFlexible}
              onChangeRange={(ageMin, ageMax) => patch({ ageMin, ageMax })}
              onChangeFlexible={(ageFlexible) => patch({ ageFlexible })}
            />
            <PrivacyHint text="Never shown to anyone else" />
          </View>
        )}
        {step === "taste" && (
          <View style={styles.block}>
            {tasteSummary ? (
              <>
                <Text style={styles.fieldLabel}>Your Vibe</Text>
                <AppText variant="title">A little context around how you live</AppText>
                <Text style={styles.helper}>
                  A little context around how you live .. not a compatibility score
                </Text>
                <ChipSelect
                  options={draft.chips}
                  selected={draft.chips}
                  onToggle={() => undefined}
                  interactive={false}
                  size="lg"
                />
              </>
            ) : (
              <>
            <View style={styles.tasteHead}>
              <Text style={styles.tasteSub}>{group.subtitle}</Text>
              <View
                style={[
                  styles.countPill,
                  draft.chips.length >= MIN_CHIPS && styles.countPillMet,
                ]}
              >
                <Text
                  style={[
                    styles.countPillText,
                    draft.chips.length >= MIN_CHIPS && styles.countPillTextMet,
                  ]}
                >
                  {draft.chips.length}/{MAX_CHIPS}
                  {draft.chips.length >= MIN_CHIPS
                    ? ""
                    : ` · ${MIN_CHIPS - draft.chips.length} more`}
                </Text>
              </View>
            </View>
            <ChipSelect
              options={[...group.options]}
              selected={draft.chips}
              onToggle={toggleChip}
              max={MAX_CHIPS}
              size="lg"
            />
            <PrivacyHint
              kind="eye"
              text="Selected Vibe may appear on your introduction and be used to recommend people and gatherings"
            />
              </>
            )}
          </View>
        )}
        {step === "intent" && (
          <View style={styles.block}>
            <View style={styles.stack}>
              {TRACK_OPTIONS.map((option) => (
                <ChoiceCard
                  key={option.id}
                  label={option.label}
                  hint={option.hint}
                  selected={draft.relationshipTrack === option.id}
                  onPress={() =>
                    // Switching track drops an outcome belonging to the other one, so the
                    // two can never disagree about which track the member is on.
                    patch(
                      draft.relationshipTrack === option.id
                        ? { relationshipTrack: option.id }
                        : { relationshipTrack: option.id, intentOutcome: "" },
                    )
                  }
                />
              ))}
            </View>

            {draft.relationshipTrack ? (
              <>
                <Text style={styles.fieldLabel}>
                  {draft.relationshipTrack === "Fluid"
                    ? "Open to which shape?"
                    : "Heading where?"}
                </Text>
                <View style={styles.stack}>
                  {outcomesForTrack(draft.relationshipTrack).map((option) => (
                    <ChoiceCard
                      key={option.id}
                      label={option.label}
                      hint={option.hint}
                      selected={draft.intentOutcome === option.id}
                      onPress={() => patch({ intentOutcome: option.id })}
                    />
                  ))}
                </View>
              </>
            ) : null}

            <Text style={styles.helper}>
              Choose what feels true right now .. you can change this later
            </Text>
            <PrivacyHint kind="eye" text="Shown on your profile" />
          </View>
        )}
        {step === "dealbreaker" && (
          <View style={styles.storyBlock}>
            <Text style={styles.storyKicker}>A little more about you</Text>
            <Text style={styles.storyGuide}>
              Share something that helps someone understand you beyond the profile .. only if you want
            </Text>
            <Field
              value={draft.dealbreaker}
              onChangeText={(dealbreaker) => patch({ dealbreaker })}
              placeholder="Something I don't usually say first .."
              multiline
              onFocus={() => revealFocusedField("end")}
            />
          </View>
        )}
        {step === "liveness" && (
          <View style={styles.block}>
            <AppText variant="meta" tone="muted" center>
              Open your camera for a quick face check. Sent only to the person
              reviewing your profile — never shown on your introduction.
            </AppText>
            <View style={styles.stack}>
              {[
                `Confirmed: +91 ${draft.phone}`,
                `Confirmed: ${draft.email}`,
              ].map((line) => (
                <View key={line} style={styles.confirmedRow}>
                  <View style={styles.confirmedDot} />
                  <AppText variant="meta" tone="soft">
                    {line}
                  </AppText>
                </View>
              ))}
            </View>
            <ChoiceCard
              label={
                draft.verification.uri
                  ? "Face check complete"
                  : "Start liveness check"
              }
              hint="Opens your camera · deleted after review"
              selected={!!draft.verification.uri}
              onPress={pickVerification}
            />
            <PrivacyHint text="This never appears on your profile" />
          </View>
        )}
        {step === "photos" && (
          <PhotosStep
            draft={draft}
            onPickPhoto={pickPhoto}
            onCaption={(id, caption) =>
              setDraft((prev) => ({
                ...prev,
                photos: prev.photos.map((slot) =>
                  slot.id === id ? { ...slot, caption } : slot,
                ),
              }))
            }
            onFocusField={(y) => revealFocusedField("y", y)}
          />
        )}
        {step === "video" && (
          <VideoStep
            draft={draft}
            onPickVideo={pickVideo}
            onVideoCaption={(caption) =>
              setDraft((prev) => ({
                ...prev,
                video: { ...prev.video, caption },
              }))
            }
            onFocusField={(y) => revealFocusedField("y", y)}
          />
        )}
        {step === "voicePick" && (
          <VoicePick
            selected={draft.prompts}
            max={promptCap}
            onToggle={(id, text) => {
              setDraft((prev) => {
                const exists = prev.prompts.find((p) => p.promptId === id);
                if (exists) {
                  return {
                    ...prev,
                    prompts: prev.prompts.filter((p) => p.promptId !== id),
                  };
                }
                if (prev.prompts.length >= promptCap) return prev;
                return {
                  ...prev,
                  prompts: [
                    ...prev.prompts,
                    { promptId: id, promptText: text, answer: "" },
                  ],
                };
              });
            }}
          />
        )}
        {step === "voiceAnswer" && (
          <View style={styles.stack}>
            {draft.prompts.map((item, promptIndex) => (
              <View
                key={item.promptId}
                style={styles.answerBlock}
                onLayout={(e) => {
                  fieldY.current[item.promptId] = e.nativeEvent.layout.y;
                }}
              >
                <Text style={styles.promptLabel}>{item.promptText}</Text>
                <Field
                  value={item.answer}
                  onChangeText={(answer) =>
                    setDraft((prev) => ({
                      ...prev,
                      prompts: prev.prompts.map((p) =>
                        p.promptId === item.promptId ? { ...p, answer } : p,
                      ),
                    }))
                  }
                  placeholder="One concrete sentence with a hook…"
                  multiline
                  onFocus={() => {
                    const y = fieldY.current[item.promptId] ?? promptIndex * 160;
                    revealFocusedField("y", y);
                  }}
                />
                {item.answer.trim().length > 12 ? (
                  <Text style={styles.replyHint}>
                    Someone might reply: “Tell me more about that.”
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
        {step === "rhythm" && (
          <View style={styles.block}>
            <Text style={styles.fieldLabel}>How you recharge with people</Text>
            <View style={styles.stack}>
              {RHYTHM.socialEnergy.map((option) => (
                <ChoiceCard
                  key={option}
                  label={option}
                  selected={draft.socialEnergy === option}
                  onPress={() => patch({ socialEnergy: option })}
                />
              ))}
            </View>

            <Text style={styles.fieldLabel}>What a good weekend feels like</Text>
            <View style={styles.stack}>
              {RHYTHM.weekends.map((option) => (
                <ChoiceCard
                  key={option}
                  label={option}
                  selected={draft.weekends === option}
                  onPress={() => patch({ weekends: option })}
                />
              ))}
            </View>

            <Text style={styles.fieldLabel}>How close family is right now</Text>
            <View style={styles.stack}>
              {RHYTHM.family.map((option) => (
                <ChoiceCard
                  key={option}
                  label={option}
                  selected={draft.family === option}
                  onPress={() => patch({ family: option })}
                />
              ))}
            </View>
          </View>
        )}
        {step === "reveal" && <Reveal draft={draft} />}
      </ScrollView>

      {step === "taste" ? (
        <TasteSpark
          chip={spark.chip}
          spark={spark.text}
          sparkKey={spark.key}
          note={encourage || undefined}
          onDismiss={dismissSpark}
        />
      ) : null}

      <Sheet visible={exitOpen} onClose={() => setExitOpen(false)} scroll>
        <AppText variant="kicker" tone="rose">
          Nothing is lost
        </AppText>
        <AppText variant="title" style={styles.sheetTitle}>
          Where you are so far
        </AppText>
        <AppText variant="body" tone="soft" style={styles.sheetBody}>
          Everything you've written is saved. Come back from your profile
          whenever you have ten quiet minutes.
        </AppText>

        {FLOW.filter((id) => id !== "arrive" && id !== "reveal").map((id) => {
          const position = FLOW.indexOf(id);
          const done = position < index;
          const current = position === index;
          return (
            <View key={id} style={styles.checkRow}>
              <View
                style={[
                  styles.checkDot,
                  done && styles.checkDotDone,
                  current && styles.checkDotNow,
                ]}
              />
              <AppText variant="body" tone={done ? "soft" : current ? "plum" : "muted"}>
                {META[id].act} — {META[id].vibe}
              </AppText>
            </View>
          );
        })}

        <View style={styles.sheetActions}>
          <Button label="Save & close" onPress={saveAndClose} />
          <Button
            label="Keep going"
            variant="ghost"
            haptic={false}
            onPress={() => setExitOpen(false)}
          />
        </View>
      </Sheet>

      <LivenessCheck
        open={livenessOpen}
        onClose={() => setLivenessOpen(false)}
        onCaptured={(uri) =>
          setDraft((prev) => ({
            ...prev,
            verification: { ...prev.verification, uri },
          }))
        }
      />
    </ChapterShell>
  );
}

function PhotosStep({
  draft,
  onPickPhoto,
  onCaption,
  onFocusField,
}: {
  draft: ProfileDraft;
  onPickPhoto: (id: string) => void;
  onCaption: (id: string, caption: string) => void;
  onFocusField: (y: number) => void;
}) {
  const filled = draft.photos.filter((p) => !!p.uri).length;
  const offsets = useRef<Record<string, number>>({});
  /** Slot offsets are local; add the stack's own offset to scroll correctly. */
  const baseY = useRef(0);
  const focusSlot = (id: string) =>
    onFocusField(baseY.current + (offsets.current[id] ?? 0));

  return (
    <View
      style={styles.mediaStack}
      onLayout={(e) => {
        baseY.current = e.nativeEvent.layout.y;
      }}
    >
      <View style={styles.progressPips}>
        {draft.photos.map((slot) => (
          <View
            key={slot.id}
            style={[styles.pip, !!slot.uri && styles.pipFull]}
          />
        ))}
        <Text style={styles.metaLine}>
          {filled} of {PHOTO_SLOTS}
        </Text>
      </View>

      {draft.photos.map((slot, index) => (
        <View
          key={slot.id}
          style={styles.slotCard}
          onLayout={(e) => {
            offsets.current[slot.id] = e.nativeEvent.layout.y;
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              slot.uri ? `Replace ${slot.label}` : `Add ${slot.label}`
            }
            onPress={() => onPickPhoto(slot.id)}
            style={({ pressed }) => [styles.slotFrame, pressed && styles.cardPressed]}
          >
            {slot.uri ? (
              <Image source={{ uri: slot.uri }} style={styles.slotImage} />
            ) : (
              <View style={styles.slotEmpty}>
                <Text style={styles.plus}>+</Text>
              </View>
            )}
          </Pressable>

          <View style={styles.slotBody}>
            <Text style={styles.slotLabel} numberOfLines={1}>
              {slot.label}
            </Text>
            <Text style={styles.slotHint}>{PHOTO_ROLES[index]?.hint}</Text>
            {slot.uri ? (
              <>
                <Field
                  value={slot.caption}
                  onChangeText={(caption) => onCaption(slot.id, caption)}
                  placeholder={
                    index === 0 ? "Optional line…" : "Say something about this…"
                  }
                  multiline
                  maxFontSizeMultiplier={1.3}
                  onFocus={() => focusSlot(slot.id)}
                  style={styles.captionInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Replace ${slot.label}`}
                  onPress={() => onPickPhoto(slot.id)}
                >
                  <Text style={styles.replaceText}>Replace photo</Text>
                </Pressable>
              </>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function VideoStep({
  draft,
  onPickVideo,
  onVideoCaption,
  onFocusField,
}: {
  draft: ProfileDraft;
  onPickVideo: () => void;
  onVideoCaption: (caption: string) => void;
  onFocusField: (y: number) => void;
}) {
  const baseY = useRef(0);

  return (
    <View
      style={styles.mediaStack}
      onLayout={(e) => {
        baseY.current = e.nativeEvent.layout.y;
      }}
    >
      <Text style={styles.supportLight}>
        Let someone hear the person behind the photos .. up to 30 seconds
      </Text>
      <PrivacyHint text="Optional .. appears on your introduction" />

      <View style={styles.slotCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={draft.video.uri ? "Replace video" : "Add intro video"}
          onPress={onPickVideo}
          style={({ pressed }) => [styles.slotFrame, pressed && styles.cardPressed]}
        >
          {draft.video.uri ? (
            <LinearGradient colors={[colors.brandPrimaryPressed, colors.accentPrimary]} style={styles.slotImage}>
              <PlayGlyph />
            </LinearGradient>
          ) : (
            <View style={styles.slotEmpty}>
              <PlayGlyph muted />
            </View>
          )}
        </Pressable>
        <View style={styles.slotBody}>
          <Text style={styles.slotLabel}>Intro video</Text>
          <Text style={styles.slotHint}>
            Up to 30 seconds. Talking beats posing.
          </Text>
          {draft.video.uri ? (
            <>
              <Field
                value={draft.video.caption}
                onChangeText={onVideoCaption}
                placeholder="What are you saying here?"
                multiline
                maxFontSizeMultiplier={1.3}
                onFocus={() => onFocusField(baseY.current + 80)}
                style={styles.captionInput}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Replace video"
                onPress={onPickVideo}
              >
                <Text style={styles.replaceText}>Replace video</Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

/** Drawn rather than typed, so it matches the icon set instead of the font. */
function PlayGlyph({ muted }: { muted?: boolean }) {
  return (
    <View style={[styles.playRing, muted && styles.playRingMuted]}>
      <View style={[styles.playTriangle, muted && styles.playTriangleMuted]} />
    </View>
  );
}

function VoicePick({
  selected,
  onToggle,
  max,
}: {
  selected: PromptAnswer[];
  onToggle: (id: string, text: string) => void;
  max: number;
}) {
  const ids = selected.map((p) => p.promptId);
  return (
    <View style={styles.stack}>
      <Text style={styles.metaLine}>
        Chosen {selected.length}/{max}
      </Text>
      {PROFILE_PROMPTS.map((prompt) => {
        const active = ids.includes(prompt.id);
        const locked = !active && selected.length >= max;
        return (
          <ChoiceCard
            key={prompt.id}
            label={prompt.text}
            selected={active}
            onPress={() => {
              if (locked) return;
              onToggle(prompt.id, prompt.text);
            }}
          />
        );
      })}
    </View>
  );
}

function Reveal({ draft }: { draft: ProfileDraft }) {
  const intent = INTENT_OUTCOMES.find((i) => i.id === draft.intentOutcome)?.label;
  const age = ageFromBirth(draft.birth);
  const hero = draft.photos.find((p) => !!p.uri)?.uri;
  const shown = [
    ...(draft.heightCm
      ? [{ label: "Height", value: formatHeight(draft.heightCm) }]
      : []),
    ...(draft.hometown.trim()
      ? [{ label: "From", value: draft.hometown.trim() }]
      : []),
    ...publishedVitals(draft.lifestyle, LIFESTYLE_QUESTIONS),
    ...publishedVitals(draft.beliefs, BELIEF_QUESTIONS),
  ];
  return (
    <View style={styles.reveal}>
      <View style={styles.revealGlass}>
        <LinearGradient colors={[colors.brandSecondary, colors.accentPrimaryPressed]} style={styles.revealHero}>
          {hero ? (
            <Image source={{ uri: hero }} style={styles.revealPhoto} />
          ) : null}
          <Text style={styles.revealName}>
            {publicIntroName(draft) || draft.name}
            {age ? `, ${age}` : ""}
          </Text>
          <Text style={styles.revealMeta}>
            {[draft.work, draft.city].filter(Boolean).join(" · ")}
          </Text>
          <Text style={styles.revealMeta}>
            On Duos: {publicIntroName(draft) || "—"} · After match:{" "}
            {realFirstName(draft.name) || draft.name}
          </Text>
        </LinearGradient>
        <View style={styles.revealRows}>
          <Text style={styles.revealRow}>{intent}</Text>
          <Text style={styles.revealRow}>{draft.city}</Text>
          {shown.length ? (
            <Text style={styles.revealRow}>
              {shown.map((v) => v.value).join(" · ")}
            </Text>
          ) : null}
          <Text style={styles.revealChips}>{draft.chips.slice(0, 6).join(" · ")}</Text>
        </View>
      </View>
      <Text style={styles.revealNote}>
        Here's how some of what you share will appear. A human reads this before you show up in Duos.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    minHeight: 0,
  },
  scroll: {
    paddingBottom: spacing.xxxl + spacing.xxxl + spacing.xl,
    gap: spacing.lg,
    flexGrow: 1,
  },
  arrive: {
    gap: spacing.xl,
    paddingTop: spacing.md,
  },
  arriveSeal: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  arriveSealRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: colors.accentLine,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfacePrimary,
  },
  arriveSealCore: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accentPrimaryPressed,
  },
  arriveSealLabel: {
    color: colors.accentPrimaryPressed,
    fontSize: typography.size.sm,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  arriveLead: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xxl,
    lineHeight: 32,
    color: colors.textPrimary,
    maxWidth: 320,
  },
  arriveSub: {
    fontFamily: fonts.body,
    color: colors.textSecondary,
    fontSize: typography.size.base,
    lineHeight: 22,
    maxWidth: 300,
  },
  heroInput: {
    minHeight: 56,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderStrong,
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xxl,
    color: colors.textPrimary,
    paddingVertical: spacing.md,
  },
  multi: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  stack: {
    gap: spacing.sm,
  },
  storyBlock: {
    gap: spacing.md,
  },
  storyKicker: {
    color: colors.accentPrimaryPressed,
    fontSize: typography.size.sm,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  storyGuide: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    lineHeight: 22,
    maxWidth: 340,
  },
  storyInput: {
    minHeight: 140,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfacePrimary,
    fontFamily: fonts.displayRegular,
    fontSize: typography.size.lg,
    lineHeight: 26,
    color: colors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  block: {
    gap: spacing.md,
  },
  /** Sub-heading inside a merged step, so two questions still read as two. */
  fieldLabel: {
    fontFamily: fonts.bodySemi,
    color: colors.brandPrimary,
    fontSize: typography.size.sm,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: spacing.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  progressPips: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  pip: {
    width: 26,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderPrimary,
  },
  pipFull: { backgroundColor: colors.accentPrimary },
  playRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.onDark92,
    backgroundColor: colors.scrim30,
  },
  playRingMuted: {
    borderColor: colors.borderStrong,
    backgroundColor: "transparent",
  },
  /** A triangle from borders — no glyph, no font dependency. */
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 13,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: colors.textOnPrimary,
  },
  playTriangleMuted: {
    borderLeftColor: colors.borderStrong,
  },
  sheetTitle: { marginTop: spacing.xs },
  sheetBody: { marginBottom: spacing.base },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderPrimary,
  },
  checkDotDone: { backgroundColor: colors.success },
  checkDotNow: {
    backgroundColor: colors.accentPrimaryPressed,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sheetActions: {
    marginTop: spacing.base,
    gap: spacing.xs,
  },
  choice: {
    minHeight: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: colors.surfacePrimary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  choiceActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  choiceText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: typography.size.md,
  },
  choiceTextActive: {
    color: colors.textOnPrimary,
  },
  card: {
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: colors.surfacePrimary,
    gap: 6,
  },
  cardActive: {
    borderColor: colors.brandPrimary,
    backgroundColor: colors.brandSoft,
  },
  cardTitle: {
    color: colors.textSecondary,
    fontWeight: "600",
    fontSize: typography.size.md,
  },
  cardTitleActive: {
    color: colors.brandPrimary,
  },
  cardHint: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
    lineHeight: 18,
  },
  tasteHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  tasteSub: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.size.base,
    lineHeight: 21,
  },
  countPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.accentLine,
  },
  countPillMet: {
    borderColor: colors.success,
    backgroundColor: colors.successSoft,
  },
  countPillText: {
    color: colors.accentPrimaryPressed,
    fontSize: typography.size.xs,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  countPillTextMet: {
    color: colors.success,
  },
  metaLine: {
    color: colors.textTertiary,
    fontWeight: "600",
    fontSize: typography.size.base,
  },
  support: {
    color: colors.onDark82,
    lineHeight: 22,
    fontSize: typography.size.base,
  },
  supportLight: {
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: typography.size.base,
    maxWidth: 340,
  },
  birthRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  birthInput: {
    width: 78,
  },
  birthInputWide: {
    width: 116,
  },
  helper: {
    color: colors.textTertiary,
    fontSize: typography.size.base,
    lineHeight: 20,
  },
  mediaStack: {
    gap: spacing.base,
  },
  slotCard: {
    flexDirection: "row",
    gap: spacing.base,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: colors.surfacePrimary,
  },
  slotFrame: {
    width: 96,
    aspectRatio: 0.8,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  slotImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  slotEmpty: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderPrimary,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfacePrimary,
  },
  slotBody: {
    flex: 1,
    gap: 4,
  },
  slotLabel: {
    color: colors.brandPrimary,
    fontWeight: "700",
    fontSize: typography.size.md,
  },
  slotHint: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
    lineHeight: 18,
  },
  captionInput: {
    marginTop: spacing.sm,
    minHeight: 56,
  },
  replaceText: {
    marginTop: spacing.xs,
    color: colors.accentPrimaryPressed,
    fontSize: typography.size.sm,
    fontWeight: "700",
  },
  plus: {
    color: colors.brandPrimary,
    fontSize: typography.size.xl,
    fontWeight: "600",
  },
  answerBlock: {
    gap: spacing.sm,
  },
  promptLabel: {
    color: colors.accentPrimaryPressed,
    fontWeight: "700",
    fontSize: typography.size.base,
  },
  replyHint: {
    color: colors.textTertiary,
    fontStyle: "italic",
    fontSize: typography.size.base,
  },
  locked: {
    opacity: 0.4,
  },
  reveal: {
    gap: spacing.lg,
  },
  revealGlass: {
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: colors.onDark16,
    borderWidth: 1,
    borderColor: colors.onDark24,
  },
  revealRows: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  revealRow: {
    color: colors.onDark92,
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.md,
  },
  revealHero: {
    padding: spacing.lg,
    minHeight: 200,
    justifyContent: "flex-end",
    gap: 4,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  revealPhoto: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  revealName: {
    color: colors.textOnPrimary,
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xxl,
  },
  revealMeta: {
    fontFamily: fonts.body,
    color: colors.onDark82,
    fontSize: typography.size.base,
  },
  revealBody: {
    fontFamily: fonts.body,
    color: colors.onDark92,
    fontSize: typography.size.base,
    lineHeight: 22,
  },
  revealChips: {
    color: colors.accentPrimary,
    fontSize: typography.size.base,
    lineHeight: 22,
  },
  revealPrompt: {
    color: colors.accentPrimary,
    fontSize: typography.size.sm,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  revealAnswer: {
    color: colors.textOnPrimary,
    marginTop: 4,
    fontSize: typography.size.md,
  },
  revealNote: {
    color: colors.onDark70,
    fontFamily: fonts.displayRegular,
    fontSize: typography.size.lg,
    lineHeight: leading.lg,
    textAlign: "center",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dial: {
    paddingHorizontal: spacing.base,
    height: 56,
    justifyContent: "center",
    borderRadius: radius.xl,
    backgroundColor: colors.surfacePrimary,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  phoneInput: {
    flex: 1,
  },
  resend: {
    alignSelf: "center",
    paddingVertical: spacing.xs,
  },
  resendText: {
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.base,
    color: colors.brandPrimary,
  },
  resendMuted: {
    fontFamily: fonts.body,
    fontSize: typography.size.base,
    color: colors.textTertiary,
  },
  notifyRow: {
    backgroundColor: colors.surfacePrimary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    padding: spacing.lg,
    gap: 4,
  },
  confirmedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  confirmedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentPrimaryPressed,
  },
});
