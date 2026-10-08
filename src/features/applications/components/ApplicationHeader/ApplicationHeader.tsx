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
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-medium text-gray-700">Applications </h2>
          <p className="text-sm text-gray-600">
            Manage and track all your job applications.{" "}
          </p>
        </div>
        <button
          className="rounded-xl bg-indigo-300 px-3 py-2 transition hover:bg-indigo-500"
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
