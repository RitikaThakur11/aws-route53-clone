"use client";

import React from "react";
import { Filter } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function FilterDropdown({
  label,
  value,
  options,
  onChange,
  className = "",
}: FilterDropdownProps) {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <Filter className="w-3.5 h-3.5 text-[#545b64]" />
      <span className="text-xs text-[#545b64] font-medium">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2.5 py-1.5 text-xs bg-white text-[#16191f] border border-[#aab7b8] rounded font-medium focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3] cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
