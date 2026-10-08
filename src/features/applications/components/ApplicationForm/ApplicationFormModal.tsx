import Modal from "../../../../shared/components/Modal/Modal";
import { getApiErrorMessage } from "../../../../lib/apiClient/getApiErrorMessage";
import type { ApplicationFormValues } from "../../types";
import ApplicationFormFields from "./ApplicationFormFields";

export type ApplicationFormModalProps = {
  isOpen: boolean;
  title: string;                 // "Add Application" / "Edit Application"
  submitLabel: string;           // "Add" / "Save"
  pendingLabel: string;          // "Adding..." / "Saving..."
  formId: string;                // must be unique per modal
  defaultValues?: Partial<ApplicationFormValues>; // pre-fill for edit; omit for create
  isPending: boolean;
  error: unknown;
  errorFallback: string;         // "Failed to add application." / "Couldn't save changes."
  onSubmit: (values: ApplicationFormValues) => void;
  onClose: () => void;
};

// One modal for create and edit. The parent owns the mutation and decides when
// to open/close; this component only renders the form, footer and error.
const ApplicationFormModal = ({
  isOpen,
  title,
  submitLabel,
  pendingLabel,
  formId,
  defaultValues,
  isPending,
  error,
  errorFallback,
  onSubmit,
  onClose,
}: ApplicationFormModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            className="rounded-xl bg-gray-100 px-3 py-2 text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            className="rounded-xl bg-indigo-300 px-3 py-2 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? pendingLabel : submitLabel}
          </button>
        </>
      }
    >
      {Boolean(error) && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {getApiErrorMessage(error, errorFallback)}
        </p>
      )}
      <ApplicationFormFields
        formId={formId}
        defaultValues={defaultValues}
        isPending={isPending}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};

export default ApplicationFormModal;
