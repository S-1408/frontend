import { APPLICATION_STATUS_OPTIONS } from "../constants/status"
import type { ApplicationStatus } from "../types/types"

type StatusFilterProps ={
    selectedStatus:ApplicationStatus | "",
    setSelectedStatus:(selectedValue:ApplicationStatus | "")=>void
}
const StatusFilter = ({selectedStatus,setSelectedStatus}:StatusFilterProps) => {
  return (
    <select value={selectedStatus} onChange={(e)=>setSelectedStatus(e.target.value as ApplicationStatus | "")}
    className="rounded-lg bg-gray-200 px-3 py-2 "
    >
     <option value="">All status</option>
      {APPLICATION_STATUS_OPTIONS.map(({value,label})=>(
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
  )
}

export default StatusFilter
