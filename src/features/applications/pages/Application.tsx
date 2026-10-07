import { useState } from "react";
import { toast } from "sonner";
import ApplicationSearch from "../components/ApplicationSearch";
import StatusFilter from "../components/StatusFilter";
import ApplicationList from "../components/ApplicationList";
import AddApplication, {
  type ApplicationFormValues,
} from "../components/AddApplication/AddApplication";
import Modal from "../../../shared/components/Modal/Modal";
import type { ApplicationStatus } from "../types/types";
import { useCreateApplication } from "../hooks/useCreateApplication";
import { getApiErrorMessage } from "../../../lib/apiClient/getApiErrorMessage";
import SectionBoundary from "../../../shared/components/ErrorBoundary/SectionBoundary";

const Application = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | "">(
    "",
  );
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
      <div>
        {/* // Header */}
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
        {/* // Search components */}
        <div className="flex items-center justify-around p-6 gap-5">
          <ApplicationSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <StatusFilter
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
          />
        </div>
        <SectionBoundary name="application-list" title="Couldn't display your applications.">
          <ApplicationList />
        </SectionBoundary>
       
      </div>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Add Application"
        footer={
          <>
            <button
              type="button"
              className="rounded-xl bg-gray-100 px-3 py-2 text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="application-form"
              className="rounded-xl bg-indigo-300 px-3 py-2 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? "Adding..." : "Add"}
            </button>
          </>
        }
      >
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
          >
            {getApiErrorMessage(error, "Failed to add application.")}
          </p>
        )}
        <AddApplication
          formId="application-form"
          onSubmit={handleSubmit}
          disabled={isPending}
        />
      </Modal>
    </>
  );
};

export default Application;
