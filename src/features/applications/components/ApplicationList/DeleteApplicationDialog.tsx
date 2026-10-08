import { toast } from "sonner";
import ConfirmDialog from "../../../../shared/components/ConfirmDialog/ConfirmDialog";
import { useDeleteApplication } from "../../hooks/useDeleteApplication";
import type { Application } from "../../types";

type DeleteApplicationDialogProps = {
  // The row to delete; null = closed
  application: Application | null;
  onClose: () => void;
};

// Owns the delete mutation, so its pending state re-renders only this dialog,
// not the whole table. Errors are shown by the global toast (useDeleteApplication meta).
const DeleteApplicationDialog = ({ application, onClose }: DeleteApplicationDialogProps) => {
  const { mutate: deleteApplication, isPending } = useDeleteApplication();

  const handleCancel = () => {
    if (isPending) return; // can't dismiss mid-request
    onClose();
  };

  const handleConfirm = () => {
    if (!application) return;
    deleteApplication(application.id, {
      onSuccess: () => {
        onClose();
        toast.success("Application deleted");
      },
    });
  };

  return (
    <ConfirmDialog
      isOpen={application !== null}
      title="Delete Application"
      confirmLabel="Delete"
      pendingLabel="Deleting..."
      tone="danger"
      isPending={isPending}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    >
      Delete{" "}
      <strong>
        {application?.company} – {application?.role}
      </strong>
      ? This can't be undone.
    </ConfirmDialog>
  );
};

export default DeleteApplicationDialog;
