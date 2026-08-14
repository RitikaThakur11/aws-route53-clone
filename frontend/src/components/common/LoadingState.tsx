"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export function LoadingState({
  message = "Loading data...",
  rows = 5,
}: LoadingStateProps) {
  return (
    <div className="w-full bg-white rounded border border-[#eaeded] p-6 space-y-4">
      <div className="flex items-center justify-center gap-2.5 py-6 text-sm text-[#545b64]">
        <Loader2 className="w-5 h-5 animate-spin text-[#0972d3]" />
        <span>{message}</span>
      </div>

      {/* Skeleton Rows */}
      <div className="space-y-2.5 opacity-60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="h-4 bg-[#eaeded] rounded w-6 animate-pulse" />
            <div className="h-4 bg-[#eaeded] rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-[#eaeded] rounded w-16 animate-pulse" />
            <div className="h-4 bg-[#eaeded] rounded flex-1 animate-pulse" />
            <div className="h-4 bg-[#eaeded] rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
