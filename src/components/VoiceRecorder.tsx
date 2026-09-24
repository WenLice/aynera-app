import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { colors, radius, spacing, typography } from "../theme";
import { VOICE_ANSWER_MAX_SECONDS } from "../config/aynera";

type Props = {
  /** The recording to play: a local file/blob just recorded, or a signed link from the server. */
  uri: string | null;
  onRecorded: (uri: string) => void;
  onRemove: () => void;
};

/** "0:07" — short enough to sit inside the button. */
function clock(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * A spoken answer to one prompt: record up to a minute, listen back, record again or remove it.
 * The file stays on the device until the member continues; the screen uploads it then.
 */
export function VoiceRecorder({ uri, onRecorded, onRemove }: Props) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recording = useAudioRecorderState(recorder, 250);
  const player = useAudioPlayer(uri ?? null);
  const playing = useAudioPlayerStatus(player);
  const [error, setError] = useState<string | null>(null);
  /** Set while this recorder owns a take, so the auto-stop at the time limit is noticed once. */
  const active = useRef(false);

  useEffect(() => {
    if (uri) player.replace(uri);
  }, [player, uri]);

  // The limit stops the recorder on its own; hand the take over when it does.
  useEffect(() => {
    if (active.current && !recording.isRecording && recording.durationMillis > 0) {
      void finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording.isRecording]);

  const finish = async () => {
    if (!active.current) return;
    active.current = false;
    if (recorder.isRecording) await recorder.stop();
    // Back to playback mode, or iOS keeps routing sound to the earpiece.
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    if (recorder.uri) onRecorded(recorder.uri);
  };

  const start = async () => {
    setError(null);
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setError("Allow the microphone to record an answer — or type it instead.");
      return;
    }
    try {
      if (playing.playing) player.pause();
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      active.current = true;
      recorder.record({ forDuration: VOICE_ANSWER_MAX_SECONDS });
    } catch {
      active.current = false;
      setError("Recording didn't start. Try again, or type your answer.");
    }
  };

  const togglePlay = () => {
    if (playing.playing) {
      player.pause();
      return;
    }
    if (playing.didJustFinish || playing.currentTime >= playing.duration) player.seekTo(0);
    player.play();
  };

  if (recording.isRecording) {
    return (
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Stop recording"
          onPress={() => void finish()}
          style={[styles.pill, styles.recording]}
        >
          <View style={styles.stopDot} />
          <Text style={styles.pillTextInverse}>
            Stop · {clock(recording.durationMillis)} / {clock(VOICE_ANSWER_MAX_SECONDS * 1000)}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.block}>
      <View style={styles.row}>
        {uri ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={playing.playing ? "Pause your answer" : "Play your answer"}
              onPress={togglePlay}
              style={styles.pill}
            >
              <Text style={styles.pillText}>
                {playing.playing ? "Pause" : "Play"} · {clock((playing.duration || 0) * 1000)}
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => void start()} style={styles.link}>
              <Text style={styles.linkText}>Record again</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onRemove} style={styles.link}>
              <Text style={styles.linkText}>Remove</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Record a spoken answer"
            onPress={() => void start()}
            style={styles.pill}
          >
            <View style={styles.recDot} />
            <Text style={styles.pillText}>Record an answer · up to 1 min</Text>
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderChip,
    backgroundColor: colors.surfacePrimary,
  },
  recording: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brandPrimary,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.textOnPrimary,
  },
  pillText: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
  },
  pillTextInverse: {
    color: colors.textOnPrimary,
    fontSize: typography.size.base,
  },
  link: {
    paddingVertical: spacing.xs,
  },
  linkText: {
    color: colors.textLink,
    fontSize: typography.size.base,
  },
  error: {
    color: colors.textSecondary,
    fontSize: typography.size.sm,
  },
});
