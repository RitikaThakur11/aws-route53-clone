"use client";

import React from "react";

interface ARecordFormProps {
  value: string;
  onChangeValue: (val: string) => void;
}

export function ARecordForm({ value, onChangeValue }: ARecordFormProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#16191f]">
        IPv4 address (Value) <span className="text-[#d13212]">*</span>
      </label>
      <p className="text-[11px] text-[#545b64]">
        Enter a valid IPv4 address in standard dot-decimal notation (e.g.{" "}
        <code className="font-mono bg-[#f2f3f3] px-1 py-0.5 rounded text-[#16191f]">198.51.100.42</code>).
      </p>
      <input
        type="text"
        required
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder="192.0.2.1"
        pattern="^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$"
        className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
      />
    </div>
  );
}
