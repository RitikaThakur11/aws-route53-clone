"use client";

import React from "react";

interface TxtRecordFormProps {
  value: string;
  onChangeValue: (val: string) => void;
}

export function TxtRecordForm({ value, onChangeValue }: TxtRecordFormProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#16191f]">
        Text value <span className="text-[#d13212]">*</span>
      </label>
      <p className="text-[11px] text-[#545b64]">
        Enter text or verification records (e.g. SPF, DKIM). Values with spaces are automatically wrapped in quotes.
      </p>
      <textarea
        rows={3}
        required
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        placeholder='v=spf1 include:_spf.google.com ~all'
        className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
      />
    </div>
  );
}
