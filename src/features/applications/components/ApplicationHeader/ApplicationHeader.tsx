import { useState } from "react";
import { toast } from "sonner";
import type { ApplicationFormValues } from "../../types";
import { useCreateApplication } from "../../hooks/useCreateApplication";
import ApplicationFormModal from "../ApplicationForm/ApplicationFormModal";

const ApplicationHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    mutate: createApplication,
    isPending,
    error,
    reset: resetCreateState,
  } = useCreateApplication();

  const handleClose = () => {
    // Don't let the user dismiss the modal mid-request
    if (isPending) return;
    resetCreateState();
    setIsOpen(false);
  };

  const handleSubmit = (data: ApplicationFormValues) => {
    // Close only after the server confirms, so a failed request keeps the
    // user's input and shows them the error instead of silently losing it
    createApplication(data, {
      onSuccess: () => {
        setIsOpen(false);
        // The modal closing alone is easy to miss; confirm the save explicitly
        toast.success("Application added");
      },
    });
  };
  return (
    <>
      <div className="flex flex-col items-stretch gap-4 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h2 className="text-xl font-medium text-gray-700">Applications</h2>
          <p className="text-sm text-gray-600">
            Manage and track all your job applications.
          </p>
        </div>
        <button
          className="w-full rounded-xl bg-indigo-300 px-4 py-2 transition hover:bg-indigo-500 sm:w-auto"
          onClick={() => setIsOpen(true)}
        >
          Add Application
        </button>
      </div>
      <ApplicationFormModal
        isOpen={isOpen}
        title="Add Application"
        submitLabel="Add"
        pendingLabel="Adding..."
        formId="add-application-form"
        isPending={isPending}
        error={error}
        errorFallback="Failed to add application."
        onSubmit={handleSubmit}
        onClose={handleClose}
      />
    </>
  );
};

export default ApplicationHeader;
