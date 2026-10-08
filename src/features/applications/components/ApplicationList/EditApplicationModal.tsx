import { toast } from "sonner";
import ApplicationFormModal from "../ApplicationForm/ApplicationFormModal";
import { useUpdateApplication } from "../../hooks/useUpdateApplication";
import type { Application, ApplicationFormValues } from "../../types";

type EditApplicationModalProps = {
  // The row being edited; null = closed
  application: Application | null;
  onClose: () => void;
};

// Owns the update mutation, so saving re-renders only this modal, not the table.
// The form inside the modal mounts on open, so it always starts from this row's values.
const EditApplicationModal = ({ application, onClose }: EditApplicationModalProps) => {
  const { mutate: updateApplication, isPending, error, reset } = useUpdateApplication();

  const handleClose = () => {
    if (isPending) return; // can't dismiss mid-request
    reset(); // clear a previous error so reopening starts clean
    onClose();
  };

  const handleSubmit = (values: ApplicationFormValues) => {
    if (!application) return;
    updateApplication(
      { id: application.id, data: values },
      {
        onSuccess: () => {
          reset();
          onClose();
          toast.success("Application updated");
        },
      },
    );
  };

  return (
    <ApplicationFormModal
      isOpen={application !== null}
      title="Edit Application"
      submitLabel="Save"
      pendingLabel="Saving..."
      formId="edit-application-form"
      defaultValues={
        application
          ? {
              company: application.company,
              role: application.role,
              status: application.status,
              appliedAt: application.appliedAt,
            }
          : undefined
      }
      isPending={isPending}
      error={error}
      errorFallback="Couldn't save changes."
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
};

export default EditApplicationModal;
