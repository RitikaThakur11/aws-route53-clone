"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search resources by name, type, or value...",
  className = "",
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [internalValue, value, onChange]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3 w-4 h-4 text-[#545b64] pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-1.5 text-xs bg-white text-[#16191f] border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3] placeholder-[#879596] transition-all"
      />
      {internalValue && (
        <button
          onClick={() => {
            setInternalValue("");
            onChange("");
          }}
          className="absolute right-2.5 text-[#545b64] hover:text-[#16191f] p-0.5 rounded"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
