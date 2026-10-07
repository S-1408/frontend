import StatusBadge from "../../dashboard/components/StatusBadge";
import { useApplication } from "../../dashboard/hooks/useApplication";
import { getApiErrorMessage } from "../../../lib/apiClient/getApiErrorMessage";

const ApplicationList = () => {
  const {data,isLoading,isError,error,refetch,isFetching} = useApplication();
  if(isLoading){
  return <p>Loading...</p>
}
// A failed load is an expected state (offline, server down), not a crash:
// explain it inline and let the user retry, no error boundary needed
if(isError){
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
  )
}
  
  return (
    <div className="mt-6 w-full p-6">
      <h2>All Applications</h2>
      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-175">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Company
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Applied
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.map((item) => {
                return (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-gray-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                          {item.company.charAt(0).toUpperCase()}
                        </div>

                        <span className="text-sm font-medium text-gray-900">
                          {item.company}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{item.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <span>{new Date(item.appliedAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-900"
                        aria-label={`Actions for ${item.company}`}
                      
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>

  );
};

export default ApplicationList;
