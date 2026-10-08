import { useEffect, useState } from "react";
import { useDebouncedValue } from "../../../../shared/hooks/useDebouncedValue";
import { useSearchParams } from "react-router-dom";

const ApplicationSearch = () => {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get("search") ?? ""); // local, fast-changing
  const debounced = useDebouncedValue(draft, 300);

  useEffect(() => {
    setParams((prev) => {
      if (debounced) prev.set("search", debounced);
      else prev.delete("search");
      return prev;
    }, { replace: true });
  }, [debounced, setParams]);

  return (
    <label className="w-full">
      <span className="sr-only">Search applications</span>
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Search company or role…"
        className="w-full rounded-lg border border-gray-300 px-3 py-2 transition hover:border-gray-900 focus:border-gray-900"
      />

    </label>
  );
};


export default ApplicationSearch

