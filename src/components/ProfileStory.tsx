import { useState, type ReactNode } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import type {
  HeroPhoto,
  PersonProfile,
  StoryBeat,
  Vibe,
} from "../data/mockPeople";
import { RespondMark } from "./RespondMark";
import {
  readVitals,
  VitalRows,
  VitalsPanel,
  type VitalRow,
} from "./VitalsPanel";
import { colors, fonts, radius, spacing, typography } from "../theme";

export type MomentTarget = {
  blockId: string;
  kind: "photo" | "video" | "prompt";
  title: string;
};

/** Which chapter an edit affordance should jump back to. */
export type EditTarget =
  | "hero"
  | "life"
  | "basics"
  | "everyday"
  | "voice"
  | "story"
  | "taste"
  | "intent"
  | "video"
  | "rhythm";

type Props = {
  person: PersonProfile;
  mode: "meet" | "self";
  onRespond?: (moment: MomentTarget) => void;
  /** Viewer's own taste, used to surface overlaps. */
  viewerTaste?: string[];
  /** Self mode only — makes sections tappable to edit. */
  onEdit?: (target: EditTarget) => void;
  onReviewPress?: () => void;
};

const HERO_H = Dimensions.get("window").height;
const FALLBACK_VIBE: Vibe = [colors.brandPrimary, colors.accentPrimaryPressed];

export function ProfileStory({
  person,
  mode,
  onRespond,
  viewerTaste,
  onEdit,
  onReviewPress,
}: Props) {
  const canRespond = mode === "meet" && !!onRespond;
  const { strip, rows, later } = readVitals(person);
  /**
   * The untold line earns the place right under the opening photos; the facts
   * follow it, and the rest of the introduction unfolds after.
   */
  const untold = person.beats.find((b) => b.kind === "story");
  const restOfBeats = person.beats.filter((b) => b !== untold);

  return (
    <View style={styles.wrap}>
      <Hero
        key={person.id}
        person={person}
        canRespond={canRespond}
        onRespond={onRespond}
        onEdit={onEdit}
        onReviewPress={onReviewPress}
      />

      <View style={styles.below}>
        {mode === "meet" && (person.whyReasons?.length || person.reason) ? (
          <View style={styles.whyStrip}>
            <Text style={styles.whyKicker}>Why this introduction</Text>
            {(person.whyReasons ?? [person.reason]).slice(0, 3).map((line) => (
              <Text key={line} style={styles.whyText}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {untold ? (
          <Beat
            beat={untold}
            canRespond={canRespond}
            onRespond={onRespond}
            onEdit={onEdit}
          />
        ) : null}

        <VitalsPanel
          strip={strip}
          rows={rows}
          footer={
            onEdit ? (
              <EditChip label="Edit" onPress={() => onEdit("basics")} inline />
            ) : null
          }
        />

        {restOfBeats.map((beat) => (
          <Beat
            key={beat.id}
            beat={beat}
            canRespond={canRespond}
            onRespond={onRespond}
            onEdit={onEdit}
          />
        ))}

        <About
          person={person}
          later={later}
          viewerTaste={viewerTaste}
          onEdit={onEdit}
          canRespond={canRespond}
          onRespond={onRespond}
        />

        {mode === "meet" ? (
          <View style={styles.endGate}>
            <View style={styles.endLine} />
            <Text style={styles.endTitle}>
              You’ve read {person.name}’s introduction
            </Text>
            <Text style={styles.endQuestion}>
              Does this feel like someone worth your slow yes?
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- hero */

function Hero({
  person,
  canRespond,
  onRespond,
  onEdit,
  onReviewPress,
}: {
  person: PersonProfile;
  canRespond: boolean;
  onRespond?: (moment: MomentTarget) => void;
  onEdit?: (target: EditTarget) => void;
  onReviewPress?: () => void;
}) {
  const photos = person.heroPhotos.length
    ? person.heroPhotos
    : [{ id: "hero", vibe: FALLBACK_VIBE } as HeroPhoto];
  const [index, setIndex] = useState(0);
  const photo = photos[Math.min(index, photos.length - 1)];
  const many = photos.length > 1;

  /** Work now has its own row below, so the photo only carries the place. */
  const meta = person.area ?? person.city;
  /** A flipped-to photo speaks for itself; the first one carries the signature. */
  const line = photo.caption?.trim() || person.signature;

  return (
    <View style={styles.hero}>
      <Stage vibe={photo.vibe ?? FALLBACK_VIBE} uri={photo.uri}>
        {many ? (
          <View style={StyleSheet.absoluteFill}>
            <Pressable
              style={styles.tapZone}
              onPress={() => setIndex((v) => Math.max(0, v - 1))}
            />
            <Pressable
              style={styles.tapZone}
              onPress={() =>
                setIndex((v) => Math.min(photos.length - 1, v + 1))
              }
            />
          </View>
        ) : null}

        <View style={styles.heroInner} pointerEvents="box-none">
          <View style={styles.heroTop} pointerEvents="box-none">
            {many ? (
              <View style={styles.segments} pointerEvents="none">
                {photos.map((p, i) => (
                  <View
                    key={p.id}
                    style={[styles.segment, i === index && styles.segmentOn]}
                  />
                ))}
              </View>
            ) : null}
            {person.verified ? (
              <Pressable
                onPress={onReviewPress}
                style={styles.seal}
                accessibilityRole="button"
                accessibilityLabel="Profile reviewed"
              >
                <Text style={styles.sealText}>Profile reviewed</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.heroBottom} pointerEvents="box-none">
            <Text style={styles.heroName}>
              {person.age > 0 ? `${person.name}, ${person.age}` : person.name}
            </Text>
            {meta ? <Text style={styles.heroMeta}>{meta}</Text> : null}
            {line ? <Text style={styles.heroSignature}>“{line}”</Text> : null}
          </View>
        </View>
      </Stage>

      {canRespond ? (
        <View style={styles.respondWrap}>
          <RespondMark
            onPress={() =>
              onRespond?.({
                blockId: photo.id,
                kind: "photo",
                title: photo.caption || `${person.name}’s first photo`,
              })
            }
          />
          <Text style={styles.replyLabel}>Reply to this</Text>
        </View>
      ) : null}

      {onEdit ? <EditChip label="Edit" onPress={() => onEdit("hero")} /> : null}
    </View>
  );
}

/* --------------------------------------------------------------- beats */

function Beat({
  beat,
  canRespond,
  onRespond,
  onEdit,
}: {
  beat: StoryBeat;
  canRespond: boolean;
  onRespond?: (moment: MomentTarget) => void;
  onEdit?: (target: EditTarget) => void;
}) {
  if (beat.kind === "photo") {
    return (
      <View style={styles.mediaCard}>
        <Stage vibe={beat.vibe ?? FALLBACK_VIBE} uri={beat.uri}>
          <View style={styles.mediaInner}>
            {beat.caption ? (
              <Text style={styles.mediaCaption}>{beat.caption}</Text>
            ) : null}
          </View>
        </Stage>
        {canRespond ? (
          <View style={styles.respondWrap}>
            <RespondMark
              onPress={() =>
                onRespond?.({
                  blockId: beat.id,
                  kind: "photo",
                  title: beat.caption || `Photo · ${beat.label}`,
                })
              }
            />
            <Text style={styles.replyLabel}>Reply to this</Text>
          </View>
        ) : null}
        {onEdit ? <EditChip label="Edit" onPress={() => onEdit("hero")} /> : null}
      </View>
    );
  }

  if (beat.kind === "video") {
    return (
      <View style={styles.mediaCard}>
        {beat.videoUri ? (
          <InlineVideo uri={beat.videoUri} caption={beat.caption} />
        ) : (
          <Stage vibe={beat.vibe ?? FALLBACK_VIBE} uri={beat.posterUri}>
            <View style={styles.mediaInner}>
              <View style={styles.playCircle}>
                <Text style={styles.play}>▶</Text>
              </View>
              {beat.caption ? (
                <Text style={styles.mediaCaption}>{beat.caption}</Text>
              ) : null}
            </View>
          </Stage>
        )}
        {canRespond ? (
          <View style={styles.respondWrap}>
            <RespondMark
              onPress={() =>
                onRespond?.({
                  blockId: beat.id,
                  kind: "video",
                  title: beat.caption || "Their intro video",
                })
              }
            />
            <Text style={styles.replyLabel}>Reply to this</Text>
          </View>
        ) : null}
        {onEdit ? <EditChip label="Edit" onPress={() => onEdit("video")} /> : null}
      </View>
    );
  }

  if (beat.kind === "story") {
    return (
      <View style={styles.storyCard}>
        <Text style={styles.storyKicker}>{beat.title}</Text>
        <Text style={styles.storyBody}>{beat.body}</Text>
        {canRespond ? (
          <View style={styles.inlineRespond}>
            <RespondMark
              onPress={() =>
                onRespond?.({
                  blockId: beat.id,
                  kind: "prompt",
                  title: beat.title,
                })
              }
            />
            <Text style={styles.replyLabelInk}>Reply to this</Text>
          </View>
        ) : null}
        {onEdit ? (
          <EditChip label="Edit" onPress={() => onEdit("story")} inline />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.answerCard}>
      <Text style={styles.answerPrompt}>{beat.prompt}</Text>
      <Text style={styles.answerText}>{beat.answer}</Text>
      {canRespond ? (
        <View style={styles.inlineRespond}>
          <RespondMark
            onPress={() =>
              onRespond?.({
                blockId: beat.id,
                kind: "prompt",
                title: beat.prompt,
              })
            }
          />
          <Text style={styles.replyLabelInk}>Reply to this</Text>
        </View>
      ) : null}
      {onEdit ? (
        <EditChip label="Edit" onPress={() => onEdit("voice")} inline />
      ) : null}
    </View>
  );
}

function InlineVideo({ uri, caption }: { uri: string; caption?: string }) {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={styles.videoFill}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      <LinearGradient
        colors={["transparent", colors.scrim20, colors.scrim90]}
        locations={[0.4, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.mediaInner}>
        {caption ? <Text style={styles.mediaCaption}>{caption}</Text> : null}
      </View>
    </View>
  );
}

/* --------------------------------------------------------------- about */

function About({
  person,
  later,
  viewerTaste,
  onEdit,
  canRespond,
  onRespond,
}: {
  person: PersonProfile;
  later: VitalRow[];
  viewerTaste?: string[];
  onEdit?: (target: EditTarget) => void;
  canRespond?: boolean;
  onRespond?: (moment: MomentTarget) => void;
}) {
  const shared = viewerTaste
    ? person.taste.filter((t) => viewerTaste.includes(t))
    : [];
  const rest = person.taste.filter((t) => !shared.includes(t));

  if (!later.length && !person.taste.length && !person.rhythm.length) {
    return null;
  }

  return (
    <View style={styles.about}>
      {shared.length ? (
        <View style={styles.sharedBlock}>
          <Text style={styles.sharedKicker}>
            {shared.length > 1 ? "Things you both keep" : "Something you both keep"}
          </Text>
          <View style={styles.chips}>
            {shared.map((chip) => (
              <View key={chip} style={[styles.chip, styles.chipShared]}>
                <Text style={[styles.chipText, styles.chipSharedText]}>
                  {chip}
                </Text>
              </View>
            ))}
          </View>
          {canRespond ? (
            <View style={styles.inlineRespond}>
              <RespondMark
                onPress={() =>
                  onRespond?.({
                    blockId: "shared-taste",
                    kind: "prompt",
                    title: shared.slice(0, 2).join(" · "),
                  })
                }
              />
              <Text style={styles.replyLabelInk}>Reply to this</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {rest.length ? (
        <View style={styles.tasteBlock}>
          <Text style={styles.aboutTitle}>{onEdit ? "Your vibe" : "Their vibe"}</Text>
          <View style={styles.chips}>
            {rest.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>
          {onEdit ? (
            <EditChip label="Edit" onPress={() => onEdit("taste")} inline />
          ) : null}
        </View>
      ) : null}

      {later.length ? (
        <View style={styles.laterBlock}>
          <Text style={styles.aboutTitle}>A little more</Text>
          <View style={styles.laterCard}>
            <VitalRows rows={later} />
          </View>
          {onEdit ? (
            <EditChip label="Edit" onPress={() => onEdit("everyday")} inline />
          ) : null}
        </View>
      ) : null}

      {person.rhythm.length ? (
        <Text style={styles.rhythmLine}>{person.rhythm.join(" · ")}</Text>
      ) : null}
    </View>
  );
}

/* ------------------------------------------------------------- helpers */

function EditChip({
  label,
  onPress,
  inline,
}: {
  label: string;
  onPress: () => void;
  inline?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.editChip, inline ? styles.editInline : styles.editFloating]}
    >
      <Text style={styles.editText}>{label}</Text>
    </Pressable>
  );
}

function Stage({
  vibe,
  uri,
  children,
}: {
  vibe: Vibe;
  uri?: string;
  children: ReactNode;
}) {
  const [a, b] = vibe;
  return (
    <View style={styles.stage}>
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      ) : (
        <>
          <LinearGradient
            colors={[a, colors.brandPrimaryPressed, b]}
            locations={[0, 0.45, 1]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.orb, styles.orbA, { backgroundColor: b }]} />
          <View style={[styles.orb, styles.orbB, { backgroundColor: a }]} />
        </>
      )}
      <LinearGradient
        colors={["transparent", colors.scrim20, colors.scrim90]}
        locations={[0.32, 0.62, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: spacing.xxxl,
  },
  replyLabel: {
    color: colors.textOnPrimary,
    fontSize: typography.size.xs,
    fontWeight: "600",
    marginTop: 4,
  },
  replyLabelInk: {
    color: colors.brandPrimary,
    fontSize: typography.size.xs,
    fontWeight: "600",
  },
  below: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },

  hero: {
    height: HERO_H,
  },
  heroInner: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 96,
    paddingBottom: spacing.xxl,
  },
  heroTop: {
    alignItems: "flex-start",
    gap: spacing.md,
  },
  /** Left half steps back, right half steps forward. */
  tapZone: {
    flex: 1,
  },
  segments: {
    flexDirection: "row",
    gap: 6,
    alignSelf: "stretch",
  },
  segment: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.onDark32,
  },
  segmentOn: {
    backgroundColor: colors.textOnPrimary,
  },
  heroBottom: {
    gap: 6,
    paddingRight: 88,
  },
  heroName: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xxxl,
    color: colors.textOnPrimary,
    letterSpacing: 0.2,
  },
  heroMeta: {
    fontFamily: fonts.bodyMedium,
    color: colors.onDark82,
    fontSize: typography.size.base,
  },
  heroSignature: {
    marginTop: spacing.sm,
    fontFamily: fonts.displayRegular,
    fontSize: typography.size.lg,
    lineHeight: 26,
    color: colors.textOnPrimary,
  },
  seal: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.onDark16,
    borderWidth: 1,
    borderColor: colors.accentLine,
  },
  sealText: {
    color: colors.success,
    fontSize: typography.size.xs,
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },

  whyStrip: {
    backgroundColor: colors.whyIntroSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accentPrimary,
  },
  whyKicker: {
    color: colors.accentPrimaryPressed,
    fontSize: typography.size.sm,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  whyText: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.lg,
    lineHeight: 26,
    color: colors.textOnAccentSoft,
  },

  mediaCard: {
    height: 420,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  mediaInner: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.xl,
    gap: spacing.md,
  },
  mediaCaption: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xl,
    lineHeight: 28,
    color: colors.textOnPrimary,
    maxWidth: "86%",
  },
  videoFill: {
    flex: 1,
    backgroundColor: colors.brandPrimaryPressed,
  },
  playCircle: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.onDark16,
    borderWidth: 1,
    borderColor: colors.onDark32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "auto",
    marginTop: "auto",
  },
  play: {
    color: colors.textOnPrimary,
    fontSize: typography.size.xl,
    marginLeft: 3,
  },

  answerCard: {
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderPrimary,
  },
  answerPrompt: {
    color: colors.textTertiary,
    fontSize: typography.size.base,
    fontWeight: "600",
  },
  answerText: {
    fontFamily: fonts.display,
    fontSize: typography.size.xl,
    lineHeight: 30,
    color: colors.textAnswer,
  },

  storyCard: {
    backgroundColor: colors.brandSoft,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.base,
  },
  storyKicker: {
    color: colors.accentPrimaryPressed,
    fontSize: typography.size.sm,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  storyBody: {
    fontFamily: fonts.displayMedium,
    fontSize: typography.size.xxl,
    lineHeight: 34,
    color: colors.textAnswer,
  },
  inlineRespond: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },

  about: {
    gap: spacing.lg,
  },
  aboutTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xl,
    color: colors.textPrimary,
  },
  laterBlock: {
    gap: spacing.md,
  },
  laterCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
    backgroundColor: colors.surfacePrimary,
    overflow: "hidden",
  },
  vitalLabel: {
    color: colors.textTertiary,
    fontSize: typography.size.xs,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  vitalValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: typography.size.lg,
    color: colors.textPrimary,
  },
  sharedBlock: {
    gap: spacing.sm,
  },
  sharedKicker: {
    color: colors.accentPrimaryPressed,
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.lg,
  },
  tasteBlock: {
    gap: spacing.md,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderChip,
    backgroundColor: colors.surfacePrimary,
  },
  chipShared: {
    borderColor: colors.tasteSoftBorder,
    backgroundColor: colors.tasteSoft,
  },
  chipText: {
    color: colors.textPrimary,
    fontWeight: "600",
    fontSize: typography.size.base,
  },
  chipSharedText: {
    color: colors.brandPrimary,
    fontWeight: "700",
  },
  rhythmLine: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    lineHeight: 22,
    fontFamily: fonts.body,
  },

  endGate: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
  },
  endLine: {
    width: 48,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.accentPrimaryPressed,
    marginBottom: spacing.sm,
  },
  endTitle: {
    color: colors.textTertiary,
    fontSize: typography.size.sm,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    textAlign: "center",
  },
  endQuestion: {
    fontFamily: fonts.bodySemi,
    fontSize: typography.size.xxl,
    lineHeight: 34,
    color: colors.textPrimary,
    textAlign: "center",
    maxWidth: 300,
  },

  editChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderPrimary,
  },
  editFloating: {
    position: "absolute",
    top: spacing.base,
    right: spacing.base,
    zIndex: 4,
  },
  editInline: {
    alignSelf: "flex-start",
    marginTop: spacing.sm,
  },
  editText: {
    color: colors.brandPrimary,
    fontSize: typography.size.xs,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  stage: {
    flex: 1,
    overflow: "hidden",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.35,
  },
  orbA: {
    width: 220,
    height: 220,
    top: "18%",
    right: -60,
  },
  orbB: {
    width: 180,
    height: 180,
    bottom: "22%",
    left: -50,
    opacity: 0.25,
  },
  respondWrap: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    zIndex: 2,
  },
});
