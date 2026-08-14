"use client";

import React from "react";

interface MxRecordFormProps {
  value: string;
  onChangeValue: (val: string) => void;
  priority: number;
  onChangePriority: (p: number) => void;
}

export function MxRecordForm({
  value,
  onChangeValue,
  priority,
  onChangePriority,
}: MxRecordFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Priority */}
      <div className="space-y-1 sm:col-span-1">
        <label className="block text-xs font-semibold text-[#16191f]">
          Priority <span className="text-[#d13212]">*</span>
        </label>
        <p className="text-[11px] text-[#545b64]">0 to 65535 (lower has preference)</p>
        <input
          type="number"
          min={0}
          max={65535}
          required
          value={priority}
          onChange={(e) => onChangePriority(parseInt(e.target.value, 10) || 0)}
          placeholder="10"
          className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
        />
      </div>

      {/* Mail Server */}
      <div className="space-y-1 sm:col-span-2">
        <label className="block text-xs font-semibold text-[#16191f]">
          Mail server domain <span className="text-[#d13212]">*</span>
        </label>
        <p className="text-[11px] text-[#545b64]">Host name of incoming mail server</p>
        <input
          type="text"
          required
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder="mail.example.com."
          className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
        />
      </div>
    </div>
  );
}
