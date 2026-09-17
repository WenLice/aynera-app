import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { View } from "react-native";
import { colors } from "../theme";

type Props = {
  size?: number;
};

/** Compact static Aynera mark — plum soul + rose soul meeting. */
export function BrandMark({ size = 28 }: Props) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Path
          fill={colors.brandPrimary}
          d="M20 12c-5.2 0-9.5 4.1-9.5 9.5 0 3.2 1.5 5.9 3.8 7.6C8.8 33.4 4 41.2 4 50.2c0 1.4.4 2.6 1.8 2.6h18.4c1.5-6.8 5.2-12.2 10.2-15.8-1.2-1.5-2-3.4-2-5.5C32.4 22.2 27 12 20 12Z"
        />
        <Circle cx="20" cy="14" r="5.2" fill={colors.brandPrimary} />
        <Defs>
          <LinearGradient id="bmRose" x1="18" y1="8" x2="56" y2="56">
            <Stop offset="0" stopColor="#F0C4A8" />
            <Stop offset="0.55" stopColor="#E8A88A" />
            <Stop offset="1" stopColor="#C97B5D" />
          </LinearGradient>
        </Defs>
        <Path
          fill="url(#bmRose)"
          d="M44 12c5.2 0 9.5 4.1 9.5 9.5 0 3.2-1.5 5.9-3.8 7.6C55.2 33.4 60 41.2 60 50.2c0 1.4-.4 2.6-1.8 2.6H39.8c-1.5-6.8-5.2-12.2-10.2-15.8 1.2-1.5 2-3.4 2-5.5C31.6 22.2 37 12 44 12Z"
        />
        <Circle cx="44" cy="14" r="5.2" fill="url(#bmRose)" />
        <Path
          fill={colors.backgroundPrimary}
          d="M32 34.5 27.2 39.3 32 44.1l4.8-4.8L32 34.5Z"
        />
      </Svg>
    </View>
  );
}
