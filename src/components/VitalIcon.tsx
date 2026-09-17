import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "../theme";

/**
 * Line marks for the facts on an introduction. Drawn rather than imported so
 * the stroke weight matches the rest of the icon set.
 */
export type VitalIconId =
  | "age"
  | "person"
  | "height"
  | "place"
  | "drink"
  | "smoke"
  | "food"
  | "movement"
  | "work"
  | "faith"
  | "home"
  | "family"
  | "child"
  | "intent"
  | "pace"
  | "dot";

type Props = {
  id: VitalIconId;
  size?: number;
  color?: string;
};

export function VitalIcon({ id, size = 20, color = colors.brandPrimary }: Props) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {id === "age" ? (
        <>
          <Path d="M3.6 20.4h16.8" {...stroke} />
          <Path
            d="M5.8 20.4v-5a2 2 0 0 1 2-2h8.4a2 2 0 0 1 2 2v5"
            {...stroke}
          />
          <Path d="M12 13.4V9.8" {...stroke} />
          <Circle cx="12" cy="7.4" r="1.5" {...stroke} />
        </>
      ) : null}

      {id === "person" ? (
        <>
          <Circle cx="12" cy="8.2" r="3.3" {...stroke} />
          <Path d="M5.6 20c1-3.4 3.2-5.1 6.4-5.1s5.4 1.7 6.4 5.1" {...stroke} />
        </>
      ) : null}

      {id === "height" ? (
        <>
          <Rect x="8.6" y="3.4" width="6.8" height="17.2" rx="1.8" {...stroke} />
          <Path d="M8.6 8h2.6M8.6 12h2.6M8.6 16h2.6" {...stroke} />
        </>
      ) : null}

      {id === "place" ? (
        <>
          <Path
            d="M12 20.8c3.6-3.9 5.9-6.9 5.9-9.9a5.9 5.9 0 0 0-11.8 0c0 3 2.3 6 5.9 9.9Z"
            {...stroke}
          />
          <Circle cx="12" cy="10.6" r="2.2" {...stroke} />
        </>
      ) : null}

      {id === "drink" ? (
        <>
          <Path
            d="M7.6 4h8.8l-.9 5.3a3.6 3.6 0 0 1-7 0L7.6 4Z"
            {...stroke}
          />
          <Path d="M12 13v7M8.8 20h6.4" {...stroke} />
        </>
      ) : null}

      {id === "smoke" ? (
        <>
          <Rect x="3.4" y="15" width="12.6" height="3.6" rx="1.4" {...stroke} />
          <Rect x="17.4" y="15" width="3.2" height="3.6" rx="1.4" {...stroke} />
          <Path d="M17.2 11.6c1.7-1 1.7-2.6 0-3.6" {...stroke} />
        </>
      ) : null}

      {id === "food" ? (
        <>
          <Path d="M3.6 11.8h16.8a8.4 8.4 0 0 1-16.8 0Z" {...stroke} />
          <Path d="M6.4 20.4h11.2" {...stroke} />
          <Path d="M12 8.8c0-1.7 1.7-1.7 1.7-3.4" {...stroke} />
        </>
      ) : null}

      {id === "movement" ? (
        <Path d="M3 12.6h3.8l2.3-5.4 3.4 10 2.3-4.6H21" {...stroke} />
      ) : null}

      {id === "work" ? (
        <>
          <Rect x="3.4" y="7.4" width="17.2" height="11.2" rx="2.2" {...stroke} />
          <Path d="M9 7.4V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.4" {...stroke} />
          <Path d="M3.4 12.4h17.2" {...stroke} />
        </>
      ) : null}

      {id === "faith" ? (
        <>
          <Path
            d="M12 6.6C10.4 5.3 8.3 4.7 5 4.7v12.6c3.3 0 5.4.6 7 1.9 1.6-1.3 3.7-1.9 7-1.9V4.7c-3.3 0-5.4.6-7 1.9Z"
            {...stroke}
          />
          <Path d="M12 6.6v12.6" {...stroke} />
        </>
      ) : null}

      {id === "home" ? (
        <>
          <Path d="M3.8 11.2 12 4.6l8.2 6.6v8.2a1 1 0 0 1-1 1H4.8a1 1 0 0 1-1-1v-8.2Z" {...stroke} />
          <Path d="M9.8 20.4v-5.2h4.4v5.2" {...stroke} />
        </>
      ) : null}

      {id === "family" ? (
        <>
          <Circle cx="8.8" cy="8.8" r="2.7" {...stroke} />
          <Circle cx="16.2" cy="9.6" r="2.1" {...stroke} />
          <Path d="M3.6 19.6c.8-2.9 2.6-4.4 5.2-4.4s4.4 1.5 5.2 4.4" {...stroke} />
          <Path d="M15.6 15.6c2.2 0 3.7 1.3 4.6 3.9" {...stroke} />
        </>
      ) : null}

      {id === "child" ? (
        <>
          <Circle cx="12" cy="7" r="2.5" {...stroke} />
          <Path d="M12 9.5v5.4M8.8 12.2h6.4M9.6 20.4 12 15m0 0 2.4 5.4" {...stroke} />
        </>
      ) : null}

      {id === "intent" ? (
        <>
          <Circle cx="10.8" cy="10.8" r="6.2" {...stroke} />
          <Path d="M15.4 15.4 20.4 20.4" {...stroke} />
        </>
      ) : null}

      {id === "pace" ? (
        <>
          <Circle cx="12" cy="12" r="7.6" {...stroke} />
          <Path d="M12 7.4V12l3.5 2.2" {...stroke} />
        </>
      ) : null}

      {id === "dot" ? <Circle cx="12" cy="12" r="3.2" {...stroke} /> : null}
    </Svg>
  );
}
