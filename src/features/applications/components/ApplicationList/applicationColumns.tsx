import { createColumnHelper } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import type { Application } from "../../types";
import StatusBadge from "../StatusBadge/StatusBadge";


type ColumnActions = { onDelete: (application: Application) => void };
const columnHelper = createColumnHelper<Application>();
export const getApplicationColumns=({onDelete}:ColumnActions) => [
  columnHelper.accessor("company", {
    header: "Company",
    cell: ({ row }) => {
      const { company } = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-600">
            {company.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-900">{company}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor("role", {
    header: "Role",
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
  columnHelper.accessor("appliedAt", {
    header: "Appied",
    cell: ({ row }) => (
      <div className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
        <span>{new Date(row.original.appliedAt).toLocaleDateString()}</span>
      </div>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-space-between gap-3">
        <button
          type="button"
          aria-label={`Edit ${row.original.company}`}
          className="text-gray-500 hover:text-gray-900"
          onClick={() => console.log(row.original.id)}
        >
          <Pencil size={16} className="text-blue-500" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="cursor-pointer"
          aria-label={`Delete ${row.original.company}`}
          onClick={() => onDelete(row.original)}
        >
          <Trash2 size={16} className="text-red-500" aria-hidden="true" />
        </button>
      </div>
    ),
  }),
];
