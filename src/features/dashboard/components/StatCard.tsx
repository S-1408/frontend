type StatCardProps = {
  title: string;
  value: number;
};

const StatCard = ({title,value}:StatCardProps) => {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
        <p className="truncate text-xs font-medium text-gray-500 uppercase sm:text-sm">{title}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{value}</p>
    </div>
  )
}

export default StatCard