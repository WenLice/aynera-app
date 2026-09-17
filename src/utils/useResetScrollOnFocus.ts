import { useCallback, useRef } from "react";
import { ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Screens must open at the first line — never inherit the previous scroll offset.
 */
export function useResetScrollOnFocus() {
  const ref = useRef<ScrollView>(null);

  useFocusEffect(
    useCallback(() => {
      const id = requestAnimationFrame(() => {
        ref.current?.scrollTo({ y: 0, animated: false });
      });
      return () => cancelAnimationFrame(id);
    }, []),
  );

  return ref;
}
