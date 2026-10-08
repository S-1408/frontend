import { useSearchParams } from "react-router-dom";
import { APPLICATION_STATUS_OPTIONS } from "../../constants/status";

const StatusFilter = () => {
  const [params, setParams] = useSearchParams();
  const status = params.get("status") ?? "";

  const handleChange = (value: string) =>
    setParams((prev) => {
      if (value) prev.set("status", value);
      else prev.delete("status");
      return prev;
    }, { replace: true }); // don't add a history entry for every change

  return (
    <label>
      <span className="sr-only">Filter by status</span>
      <select value={status} onChange={(e) => handleChange(e.target.value)} className="…">
        <option value="">All status</option>
        {APPLICATION_STATUS_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
  );
};

export default StatusFilter
