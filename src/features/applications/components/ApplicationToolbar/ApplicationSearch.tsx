// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";

const ApplicationSearch = () => {
  // const [params, setParams] = useSearchParams();
  // const [draft, setDraft] = useState(params.get("search") ?? ""); // local, fast-changing
  // const debounced = useDebouncedValue(draft, 300);

  // useEffect(() => {
  //   setParams((prev) => {
  //     if (debounced) prev.set("search", debounced);
  //     else prev.delete("search");
  //     return prev;
  //   }, { replace: true });
  // }, [debounced, setParams]);

  return (
    <label className="w-full">
      <span className="sr-only">Search applications</span>
      {/* <input type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search company or role…" className="…" /> */}
    </label>
  );
};


export default ApplicationSearch

