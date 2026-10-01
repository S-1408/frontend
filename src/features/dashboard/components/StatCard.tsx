import type { StatCardProps } from "../types/types"

const StatCard = ({title,value}:StatCardProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadlow-sm">
        <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

export default StatCard