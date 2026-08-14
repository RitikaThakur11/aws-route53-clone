"use client";

import React from "react";

export interface Column<T> {
  header: string;
  accessor?: keyof T | string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  selectedId?: string | null;
  onSelectRow?: (row: T) => void;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectedId,
  onSelectRow,
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto border-t border-b border-[#eaeded] bg-white">
      <table className="w-full text-left text-xs border-collapse">
        {/* Table Header */}
        <thead>
          <tr className="bg-[#fafafa] border-b border-[#eaeded] text-[#545b64] font-bold select-none">
            {onSelectRow && <th className="w-10 px-3 py-2.5 text-center"></th>}
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{ width: col.width }}
                className={`px-4 py-2.5 font-bold uppercase tracking-wider text-[11px] ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-[#eaeded]">
          {data.map((row) => {
            const rowKey = keyExtractor(row);
            const isSelected = selectedId === rowKey;

            return (
              <tr
                key={rowKey}
                onClick={() => {
                  if (onRowClick) onRowClick(row);
                  if (onSelectRow) onSelectRow(row);
                }}
                className={`transition-colors cursor-pointer group ${
                  isSelected
                    ? "bg-[#f1faff] text-[#0972d3]"
                    : "hover:bg-[#f9fafb] text-[#16191f]"
                }`}
              >
                {onSelectRow && (
                  <td
                    className="w-10 px-3 py-2 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRow(row);
                    }}
                  >
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => onSelectRow(row)}
                      className="w-3.5 h-3.5 text-[#0972d3] border-gray-300 focus:ring-[#0972d3] cursor-pointer"
                    />
                  </td>
                )}

                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={`px-4 py-2.5 align-middle ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : (row as any)[col.accessor as string] || "-"}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
