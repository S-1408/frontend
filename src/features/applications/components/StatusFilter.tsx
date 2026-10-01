import type { ApplicationStatus } from "../../dashboard/types/types"

type StatusFilterProps ={
    selectedStatus:ApplicationStatus | "",
    setSelectedStatus:(selectedValue:ApplicationStatus)=>void
}
const StatusFilter = ({selectedStatus,setSelectedStatus}:StatusFilterProps) => {
  return (
    <select value={selectedStatus} onChange={(e)=>setSelectedStatus(e.target.value)}
    className="rounded-lg bg-gray-200 px-3 py-2 "
    >
     <option value="">All status</option>
      <option value="interviewing">Interviewing</option>
      <option value="applied">Applied</option>
      <option value="offer">Offer</option>
      <option value="rejected">Rejected</option>
    </select>
  )
}

export default StatusFilter