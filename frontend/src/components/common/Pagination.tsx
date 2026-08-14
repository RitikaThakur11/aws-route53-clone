"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#eaeded] bg-[#fafafa] text-xs text-[#545b64]">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <>
            <span>Records per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-[#aab7b8] rounded text-xs text-[#16191f] focus:outline-none focus:ring-1 focus:ring-[#0972d3]"
            >
              {pageSizeOptions.map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Item counts & navigation */}
      <div className="flex items-center gap-4">
        <span>
          Showing <strong className="text-[#16191f]">{startItem}</strong> -{" "}
          <strong className="text-[#16191f]">{endItem}</strong> of{" "}
          <strong className="text-[#16191f]">{total}</strong>
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded border border-[#d5dbdb] bg-white text-[#16191f] hover:bg-[#eaeded] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-[#16191f]">
            {page} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || totalPages === 0}
            className="p-1 rounded border border-[#d5dbdb] bg-white text-[#16191f] hover:bg-[#eaeded] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
