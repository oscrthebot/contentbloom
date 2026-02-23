"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<T = Record<string, any>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
}

type SortDir = "asc" | "desc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 25,
  loading,
  emptyMessage = "No data found",
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const av = a[sortKey] ?? null;
    const bv = b[sortKey] ?? null;
    if (av === null || bv === null) return 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-comparison
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageItems = sorted.slice(page * pageSize, (page + 1) * pageSize);

  if (loading) {
    return (
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 dark:bg-gray-900 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide ${
                    col.sortable ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="flex flex-col -space-y-1">
                        <ChevronUp
                          size={10}
                          className={sortKey === String(col.key) && sortDir === "asc" ? "text-blue-600" : "opacity-30"}
                        />
                        <ChevronDown
                          size={10}
                          className={sortKey === String(col.key) && sortDir === "desc" ? "text-blue-600" : "opacity-30"}
                        />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-12 text-sm text-gray-400 dark:text-gray-600"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageItems.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-100 dark:border-gray-900 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-950/50 transition"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {col.render
                        ? col.render(row)
                        : String(row[String(col.key)] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
