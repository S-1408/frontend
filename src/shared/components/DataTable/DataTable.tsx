import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
type DataTableProps<TData> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: ColumnDef<TData, any>[];
  data: TData[];
  emptyMessage?:string
};
// The comma tells TypeScript:This is a generic type parameter, not JSX."
function DataTable<TData>({ columns, data,emptyMessage = "No data available" }: DataTableProps<TData>) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <table className="w-full min-w-175">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/70">
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="px-6 py-3.5 text-left text-sm font-medium uppercase tracking-wide text-gray-500">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-gray-100">
        {
        table.getRowModel().rows.length===0 ? (
            <tr>
                <td colSpan={columns.length}>{emptyMessage}</td>
            </tr>
        )
        :(table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="group transition-colors hover:bg-gray-50/70">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-6 py-4">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        )))}
      </tbody>
    </table>
  );
}

export default DataTable;
