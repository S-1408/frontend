import { useApplications } from "../../hooks/useApplications";
import { getApiErrorMessage } from "../../../../lib/apiClient/getApiErrorMessage";
import DataTable from "../../../../shared/components/DataTable/DataTable";
import type { Application } from "../../types";
import { memo, useMemo, useRef, useState } from "react";
import { useDeleteApplication } from "../../hooks/useDeleteApplication";
import Modal from "../../../../shared/components/Modal/Modal";
import { toast } from "sonner";
import { getApplicationColumns } from "./applicationColumns";

// Module level: the same empty array every render, so the table doesn't rebuild
const No_APPLICATION: Application[] = [];

const ApplicationList = () => {
  const [toDelete, setToDelete] = useState<Application | null>(null);
  // setState is stable, so the columns are built once

  const { data, isLoading, isError, error, refetch, isFetching } =
    useApplications();
  const { mutate: deleteApp, isPending } = useDeleteApplication();
  // Cancel gets focus when the confirm opens: the safe default for a destructive action
  const cancelRef = useRef<HTMLButtonElement>(null);

  const columns = useMemo(
    () => getApplicationColumns({ onDelete: setToDelete }),
    [],
  );
  const handleClose = () => {
  if (isPending) return;
  setToDelete(null);
};
  const handleConfirmDelete = () => {
     if (!toDelete) return;
     deleteApp(toDelete.id,{
      onSuccess:()=>{
        setToDelete(null);
        toast.success("Application deleted")
      }
     })
  };
  if (isLoading) {
    return <p>Loading...</p>;
  }
  // A failed load is an expected state (offline, server down), not a crash:
  // explain it inline and let the user retry, no error boundary needed
  if (isError) {
    return (
      <div
        role="alert"
        className="m-6 flex flex-col items-start gap-2 rounded-2xl border border-red-100 bg-red-50 p-4"
      >
        <p className="text-sm font-medium text-red-700">
          {getApiErrorMessage(error, "Couldn't load your applications.")}
        </p>
        <button
          type="button"
          className="rounded-lg bg-white px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200 transition hover:bg-gray-50 disabled:opacity-50"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          {isFetching ? "Retrying..." : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-6 w-full p-6">
        <h2>All Applications</h2>
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={data ?? No_APPLICATION}
              emptyMessage="No application yet."
            />
          </div>
        </section>
      </div>
      <Modal
        isOpen={toDelete !== null}
        onClose={handleClose}
        title="Delete Application"
        initialFocusRef={cancelRef}
        footer={
          <>
            <button
              ref={cancelRef}
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isPending}
              aria-busy={isPending}
              className="border px-3 py-1 bg-red-500 rounded-lg border-red-200 cursor-pointer hover:bg-red-700 text-md font-bold text-white "
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
          </>
        }
      >
        Delete{" "}
        <strong>
          {toDelete?.company}-{toDelete?.role}
        </strong>
        , Are you sure, you want to continue?
      </Modal>
    </>
  );
};

export default memo(ApplicationList);


