import { useState } from "react";
import ApplicationSearch from "../components/ApplicationSearch";
import StatusFilter from "../components/StatusFilter";
import { recentApplication } from "../../dashboard/dummy/dashboard";
import ApplicationList from "../components/ApplicationList";
import type { ApplicationStatus } from "../../dashboard/types/types";

const Application = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus |"">("");
  return (
    <div>
      {/* // Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-medium text-gray-700">Applications </h2>
          <p className="text-sm text-gray-600">
            Manage and track all your job applications.{" "}
          </p>
        </div>
        <button className="rounded-xl bg-indigo-300 px-3 py-2 transition hover:bg-indigo-500">
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

      <ApplicationList
        data={recentApplication}
      />
    </div>
  );
};

export default Application;
