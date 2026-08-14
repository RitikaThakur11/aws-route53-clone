"use client";

import React from "react";
import { FolderSearch, Plus, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionType?: "create" | "clear";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  actionType = "create",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded border border-dashed border-[#d5dbdb] my-4">
      <div className="w-12 h-12 rounded-full bg-[#f2f3f3] flex items-center justify-center text-[#545b64] mb-3">
        <FolderSearch className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#16191f] mb-1">{title}</h3>
      <p className="text-xs text-[#545b64] max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded transition-colors shadow-xs ${
            actionType === "create"
              ? "bg-[#ec7211] hover:bg-[#eb5f07] text-white"
              : "bg-white hover:bg-[#eaeded] text-[#16191f] border border-[#545b64]"
          }`}
        >
          {actionType === "create" ? (
            <Plus className="w-3.5 h-3.5" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
