import { CheckboxRow } from "./CheckboxRow";

type Props = {
  /** True when the answer shows on the profile — what the server stores as visibility. */
  visible: boolean;
  onChange: (visible: boolean) => void;
  accessibilityLabel?: string;
};

/**
 * Answering and publishing are separate, deliberate choices — this is the second one. One fixed
 * label everywhere, "Keep private": ticked hides the answer from the profile, unticked shows it.
 * Used by the gender step (hidden, matching still uses it) and every everyday and belief question.
 */
export function VisibilityToggle({ visible, onChange, accessibilityLabel = "Keep this private" }: Props) {
  return (
    <CheckboxRow
      checked={!visible}
      onChange={(keepPrivate) => onChange(!keepPrivate)}
      label="Keep private"
      accessibilityLabel={accessibilityLabel}
    />
  );
}
