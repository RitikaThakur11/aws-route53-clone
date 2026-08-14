"use client";

import React from "react";

interface CaaRecordFormProps {
  value: string;
  onChangeValue: (val: string) => void;
  flags: number;
  onChangeFlags: (f: number) => void;
  tag: string;
  onChangeTag: (t: string) => void;
}

export function CaaRecordForm({
  value,
  onChangeValue,
  flags,
  onChangeFlags,
  tag,
  onChangeTag,
}: CaaRecordFormProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Flags */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Flags <span className="text-[#d13212]">*</span>
          </label>
          <p className="text-[11px] text-[#545b64]">0 (non-critical) or 128 (critical)</p>
          <select
            value={flags}
            onChange={(e) => onChangeFlags(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
          >
            <option value={0}>0 (Non-critical)</option>
            <option value={128}>128 (Critical - Issuer must understand)</option>
          </select>
        </div>

        {/* Tag */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Tag <span className="text-[#d13212]">*</span>
          </label>
          <p className="text-[11px] text-[#545b64]">Certificate authority authorization type</p>
          <select
            value={tag}
            onChange={(e) => onChangeTag(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
          >
            <option value="issue">issue (Authorize CA for single domain/wildcards)</option>
            <option value="issuewild">issuewild (Authorize CA for wildcards only)</option>
            <option value="iodef">iodef (Incident reporting URL/email)</option>
          </select>
        </div>
      </div>

      {/* Value */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-[#16191f]">
          CA Domain / Value <span className="text-[#d13212]">*</span>
        </label>
        <p className="text-[11px] text-[#545b64]">Authorized CA domain (e.g. "amazon.com" or "letsencrypt.org")</p>
        <input
          type="text"
          required
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder="letsencrypt.org"
          className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
        />
      </div>
    </div>
  );
}
