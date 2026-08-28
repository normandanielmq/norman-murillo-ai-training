import type { ReactNode, Ref } from "react";
import { Button } from "@/components/Button";

type ModalFooterProps = {
  children: ReactNode;
  /** Assign modals use a top border; simple confirm modals do not */
  withTopBorder?: boolean;
};

export function ModalFooter({ children, withTopBorder }: ModalFooterProps) {
  const row =
    withTopBorder === true
      ? "mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4"
      : "mt-6 flex justify-end gap-3";
  return <div className={row}>{children}</div>;
}

type ModalCancelPrimaryButtonsProps = {
  onCancel: () => void;
  onPrimary: () => void;
  cancelLabel?: string;
  primaryLabel: string;
  primaryPendingLabel?: string;
  cancelDisabled?: boolean;
  primaryDisabled?: boolean;
  pending?: boolean;
  primaryVariant?: "violet" | "danger";
  cancelRef?: Ref<HTMLButtonElement>;
  withTopBorder?: boolean;
  cancelVariant?: "secondary" | "outline";
  /** Rare: pass a full `className` to render a plain Cancel `<button>` instead of `<Button>`. Prefer `cancelVariant`. */
  cancelClassName?: string;
};

/** Standard Cancel + primary action row for modals (Save, Delete, etc.). */
export function ModalCancelPrimaryButtons({
  onCancel,
  onPrimary,
  cancelLabel = "Cancel",
  primaryLabel,
  primaryPendingLabel,
  cancelDisabled,
  primaryDisabled,
  pending = false,
  primaryVariant = "violet",
  cancelRef,
  withTopBorder,
  cancelVariant = "secondary",
  cancelClassName,
}: ModalCancelPrimaryButtonsProps) {
  const primaryText =
    pending && primaryPendingLabel !== undefined ? primaryPendingLabel : primaryLabel;

  return (
    <ModalFooter withTopBorder={withTopBorder}>
      {cancelClassName ? (
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          disabled={cancelDisabled ?? pending}
          className={cancelClassName}
        >
          {cancelLabel}
        </button>
      ) : (
        <Button
          ref={cancelRef}
          variant={cancelVariant}
          size="md"
          type="button"
          onClick={onCancel}
          disabled={cancelDisabled ?? pending}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        variant={primaryVariant === "danger" ? "danger" : "primary"}
        size="md"
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled ?? pending}
      >
        {primaryText}
      </Button>
    </ModalFooter>
  );
}
