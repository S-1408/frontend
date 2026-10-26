import { Link } from "react-router-dom";
import StatusBadge from "../../applications/components/StatusBadge/StatusBadge";
import { useApplications } from "../../applications/hooks/useApplications";


const RecentApplication = () => {

const {data,isLoading,isError} = useApplications()
if(isLoading){
  return <p>Loading...</p>
}
if(isError){
  return <p>Something went wrong</p>
}
  return (
    <div className="w-full mt-3">
      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Applications
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Keep track of your latest application
            </p>
          </div>
          <Link
            to="/applications"
            className="shrink-0 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                  Company
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                  Role
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                  Status
                </th>
                <th className="px-3 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                  Applied
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
                    <td className="px-3 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
                          {item.company.charAt(0).toUpperCase()}
                        </div>

                        <span className="text-sm font-medium text-gray-900">
                          {item.company}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <span className="text-sm text-gray-600">
                        {item.role}
                      </span>
                    </td>
                    <td className="px-3 py-4 sm:px-6">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 sm:px-6">
                      <span> {new Date(item.appliedAt).toLocaleDateString()}</span>
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

export default RecentApplication;
