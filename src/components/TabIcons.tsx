import type { ReactNode } from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { Image, View } from "react-native";
import { colors } from "../theme";

type Props = {
  focused: boolean;
  color: string;
  size?: number;
};

const PASS_LOGO = require("../../assets/brand/icon-pass.png");
const KHAT_LOGO = require("../../assets/brand/icon-khat.png");

function IconShell({
  focused,
  children,
}: {
  focused: boolean;
  children: ReactNode;
}) {
  return (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.brandSoft : "transparent",
      }}
    >
      {children}
    </View>
  );
}

/** Meet — diamond / introduction seal */
export function MeetTabIcon({ focused, color, size = 20 }: Props) {
  return (
    <IconShell focused={focused}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M12 3.5 19.5 12 12 20.5 4.5 12 12 3.5Z"
          fill={focused ? colors.brandPrimary : "none"}
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
      </Svg>
    </IconShell>
  );
}

/** Threads — layered letter / conversation lines */
export function ThreadsTabIcon({ focused, color, size = 20 }: Props) {
  return (
    <IconShell focused={focused}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path
          d="M5 7.5h14M5 12h10M5 16.5h12"
          stroke={color}
          strokeWidth={focused ? 2.2 : 1.8}
          strokeLinecap="round"
        />
        {focused ? (
          <Circle cx="18.5" cy="7.5" r="2.2" fill={colors.accentPrimaryPressed} />
        ) : null}
      </Svg>
    </IconShell>
  );
}

/** Profile — soul circle */
export function ProfileTabIcon({ focused, color, size = 20 }: Props) {
  return (
    <IconShell focused={focused}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle
          cx="12"
          cy="9"
          r="3.5"
          fill={focused ? colors.brandPrimary : "none"}
          stroke={color}
          strokeWidth={1.8}
        />
        <Path
          d="M5.5 19c1.2-3.2 3.4-4.8 6.5-4.8S17.8 15.8 19 19"
          fill="none"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
      </Svg>
    </IconShell>
  );
}

/** Pass — dedicated 3D X logo asset */
export function RejectIcon({ size = 28 }: { size?: number; color?: string }) {
  return (
    <Image
      source={PASS_LOGO}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}

/** KHAT — dedicated letter / quill logo asset */
export function KhatIcon({ size = 28 }: { size?: number }) {
  return (
    <Image
      source={KHAT_LOGO}
      style={{ width: size, height: size }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );
}
