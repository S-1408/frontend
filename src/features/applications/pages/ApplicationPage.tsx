import ApplicationSearch from "../components/ApplicationToolbar/ApplicationSearch";
import StatusFilter from "../components/ApplicationToolbar/StatusFilter";
import ApplicationList from "../components/ApplicationList/ApplicationList";
import SectionErrorBoundary from "../../../shared/components/ErrorBoundary/SectionErrorBoundary";
import ApplicationHeader from "../components/ApplicationHeader/ApplicationHeader";

const Application = () => {

  return (
    <>
         <ApplicationHeader/>
        <div className="flex items-center justify-around p-6 gap-5">
          <ApplicationSearch/>
          <StatusFilter/>
        </div>
        <SectionErrorBoundary name="application-list" title="Couldn't display your applications.">
          <ApplicationList />
        </SectionErrorBoundary>
    </>
  );
};

export default Application;

// ApplicationList: reads the URL and passes the values to the table:
// Filters are URL state: they should survive a refresh, be shareable as a link, and work with the Back button. With useSearchParams, each component reads and writes the URL directly. There's no page state and no props:

// const [params] = useSearchParams();
// const search = params.get("search") ?? "";
// const status = params.get("status") ?? "";
// const columnFilters = useMemo(() => (status ? [{ id: "status", value: status }] : []), [status]);
// // <DataTable … globalFilter={search} columnFilters={columnFilters} />
// The page has no state, so typing never re-renders the header or the table. The table re-renders only once, after you stop typing (300 ms).
// No prop drilling: each component talks to the URL directly.
// Filters survive a refresh and can be shared (/applications?status=offer&search=google).
// Testable: render with createMemoryRouter(routes, { initialEntries: ["/applications?status=offer"] }) and assert the filtered rows.