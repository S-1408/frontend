import { memo, useMemo, useState } from "react";
import { useApplications } from "../../hooks/useApplications";
import { getApiErrorMessage } from "../../../../lib/apiClient/getApiErrorMessage";
import DataTable from "../../../../shared/components/DataTable/DataTable";
import type { Application } from "../../types";
import { getApplicationColumns } from "./applicationColumns";
import EditApplicationModal from "./EditApplicationModal";
import DeleteApplicationDialog from "./DeleteApplicationDialog";
import { useApplicationFilters } from "../../hooks/useApplicationFilters";

// Module level: the same empty array every render, so the table doesn't rebuild
const NO_APPLICATIONS: Application[] = [];

const ApplicationList = () => {
  // Which row the user picked. The dialogs own their mutations, so saving or
  // deleting re-renders only the dialog, not this list and its table.
  const [toEdit, setToEdit] = useState<Application | null>(null);
  const [toDelete, setToDelete] = useState<Application | null>(null);
  const filters = useApplicationFilters();
  // const { data, isLoading, isError, error, refetch, isFetching } = useApplications();
  const { data, isLoading, isError, error, refetch, isFetching } = useApplications(filters);
  
  const hasFilters = Boolean(filters.search || filters.status);
  // setState functions are stable, so the columns are built once
  const columns = useMemo(
    () => getApplicationColumns({ onEdit: setToEdit, onDelete: setToDelete }),
    [],
  );

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
              data={data ?? NO_APPLICATIONS}
              emptyMessage={hasFilters ? "No applications match your search." : "No application yet."}
            />
          </div>
        </section>
      </div>

      <EditApplicationModal application={toEdit} onClose={() => setToEdit(null)} />
      <DeleteApplicationDialog application={toDelete} onClose={() => setToDelete(null)} />
    </>
  );
};

export default memo(ApplicationList);
