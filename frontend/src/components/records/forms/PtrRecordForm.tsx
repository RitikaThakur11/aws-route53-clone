"use client";

import React from "react";

interface PtrRecordFormProps {
  value: string;
  onChangeValue: (val: string) => void;
}

export function PtrRecordForm({ value, onChangeValue }: PtrRecordFormProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#16191f]">
        Domain name target (Value) <span className="text-[#d13212]">*</span>
      </label>
      <p className="text-[11px] text-[#545b64]">
        Target canonical hostname for reverse DNS resolution (e.g.{" "}
        <code className="font-mono bg-[#f2f3f3] px-1 py-0.5 rounded text-[#16191f]">web01.example.com.</code>).
      </p>
      <input
        type="text"
        required
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder="server.example.com."
        className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
      />
    </div>
  );
}
