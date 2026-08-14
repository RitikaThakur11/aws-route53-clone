"use client";

import React from "react";

interface CNameRecordFormProps {
  value: string;
  onChangeValue: (val: string) => void;
}

export function CNameRecordForm({ value, onChangeValue }: CNameRecordFormProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#16191f]">
        Target domain name (Value) <span className="text-[#d13212]">*</span>
      </label>
      <p className="text-[11px] text-[#545b64]">
        Enter the fully-qualified domain name (FQDN) that this alias points to (e.g.{" "}
        <code className="font-mono bg-[#f2f3f3] px-1 py-0.5 rounded text-[#16191f]">app.production.net.</code>).
      </p>
      <input
        type="text"
        required
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder="target.example.com."
        className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
      />
    </div>
  );
}
