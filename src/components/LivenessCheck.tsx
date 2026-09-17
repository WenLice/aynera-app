import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "./AppText";
import { Button } from "./Button";
import { colors, spacing } from "../theme";

type Props = {
  open: boolean;
  onClose: () => void;
  onCaptured: (uri: string) => void;
};

/**
 * Private front-camera face check — never a gallery clip.
 * Capture stays on-device for review and never appears on the introduction.
 */
export function LivenessCheck({ open, onClose, onCaptured }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("Look at the camera · hold still");

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setHint("Look at the camera · hold still");
    if (permission && !permission.granted) {
      void requestPermission();
    }
  }, [open, permission, requestPermission]);

  const capture = async () => {
    if (!cameraRef.current || busy) return;
    setBusy(true);
    setHint("Checking…");
    try {
      const shot = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        skipProcessing: true,
      });
      if (!shot?.uri) {
        setHint("Couldn’t capture — try again");
        setBusy(false);
        return;
      }
      onCaptured(shot.uri);
      onClose();
    } catch {
      setHint("Couldn’t capture — try again");
      setBusy(false);
    }
  };

  return (
    <Modal
      visible={open}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        {!permission?.granted ? (
          <SafeAreaView style={styles.center}>
            <AppText variant="title" tone="inverse" center>
              Camera access
            </AppText>
            <AppText variant="body" tone="soft" center>
              Aynera needs your camera for a private face check. It never lands
              on your profile.
            </AppText>
            <Button label="Allow camera" onPress={() => void requestPermission()} />
            <Button label="Not now" variant="ghost" haptic={false} onPress={onClose} />
          </SafeAreaView>
        ) : (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="front"
              mirror
            />
            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
              <View style={styles.topBar}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  hitSlop={12}
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.close,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText variant="label" tone="inverse">
                    Close
                  </AppText>
                </Pressable>
                <AppText variant="meta" tone="inverse" center>
                  Liveness check
                </AppText>
                <View style={styles.spacer} />
              </View>

              <View style={styles.guideWrap}>
                <View style={styles.oval} />
                <AppText variant="meta" tone="inverse" center>
                  {hint}
                </AppText>
              </View>

              <View style={styles.bottom}>
                <AppText variant="meta" tone="soft" center>
                  Private · deleted after review · never on your profile
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Capture face check"
                  disabled={busy}
                  onPress={() => void capture()}
                  style={({ pressed }) => [
                    styles.shutter,
                    (pressed || busy) && styles.shutterDim,
                  ]}
                >
                  <View style={styles.shutterInner} />
                </Pressable>
              </View>
            </SafeAreaView>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0B0710",
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  close: {
    minWidth: 64,
    paddingVertical: spacing.sm,
  },
  spacer: { minWidth: 64 },
  guideWrap: {
    alignItems: "center",
    gap: spacing.base,
  },
  oval: {
    width: 240,
    height: 300,
    borderRadius: 120,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.85)",
    backgroundColor: "transparent",
  },
  bottom: {
    alignItems: "center",
    gap: spacing.base,
    paddingBottom: spacing.base,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: colors.textOnPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.textOnPrimary,
  },
  shutterDim: { opacity: 0.7 },
  pressed: { opacity: 0.7 },
  center: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.base,
  },
});
