import { useRef, type ReactNode } from "react";
import Modal from "../Modal/Modal";

type ConfirmDialogProps = {
  isOpen: boolean;
  title: string;
  // What will happen; name the exact item ("Delete Google – Frontend Developer?")
  children: ReactNode;
  confirmLabel: string; // "Delete"
  pendingLabel: string; // "Deleting..."
  cancelLabel?: string;
  // "danger" for destructive actions (red confirm button)
  tone?: "danger" | "default";
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const confirmClasses = {
  danger: "bg-red-500 text-white hover:bg-red-700",
  default: "bg-indigo-300 hover:bg-indigo-500",
};

// Generic confirmation for any action that needs a second step. Cancel gets
// focus on open: the safe default, so a reflexive Enter never confirms.
const ConfirmDialog = ({
  isOpen,
  title,
  children,
  confirmLabel,
  pendingLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      initialFocusRef={cancelRef}
      footer={
        <>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-xl bg-gray-100 px-3 py-2 text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            aria-busy={isPending}
            className={`rounded-xl px-3 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmClasses[tone]}`}
          >
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-sm text-gray-700">{children}</div>
    </Modal>
  );
};

export default ConfirmDialog;
