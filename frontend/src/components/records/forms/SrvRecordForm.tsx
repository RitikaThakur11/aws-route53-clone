"use client";

import React from "react";

interface SrvRecordFormProps {
  value: string;
  onChangeValue: (val: string) => void;
  priority: number;
  onChangePriority: (p: number) => void;
  weight: number;
  onChangeWeight: (w: number) => void;
  port: number;
  onChangePort: (pt: number) => void;
}

export function SrvRecordForm({
  value,
  onChangeValue,
  priority,
  onChangePriority,
  weight,
  onChangeWeight,
  port,
  onChangePort,
}: SrvRecordFormProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {/* Priority */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Priority <span className="text-[#d13212]">*</span>
          </label>
          <p className="text-[11px] text-[#545b64]">0 to 65535</p>
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

        {/* Weight */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Weight <span className="text-[#d13212]">*</span>
          </label>
          <p className="text-[11px] text-[#545b64]">0 to 65535</p>
          <input
            type="number"
            min={0}
            max={65535}
            required
            value={weight}
            onChange={(e) => onChangeWeight(parseInt(e.target.value, 10) || 0)}
            placeholder="50"
            className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
          />
        </div>

        {/* Port */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Port <span className="text-[#d13212]">*</span>
          </label>
          <p className="text-[11px] text-[#545b64]">1 to 65535</p>
          <input
            type="number"
            min={1}
            max={65535}
            required
            value={port}
            onChange={(e) => onChangePort(parseInt(e.target.value, 10) || 1)}
            placeholder="5060"
            className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
          />
        </div>
      </div>

      {/* Target Server */}
      <div className="space-y-1">
        <label className="block text-xs font-semibold text-[#16191f]">
          Target host <span className="text-[#d13212]">*</span>
        </label>
        <p className="text-[11px] text-[#545b64]">Domain name of server providing this service</p>
        <input
          type="text"
          required
          value={value}
          onChange={(e) => onChangeValue(e.target.value)}
          placeholder="sipserver.example.com."
          className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
        />
      </div>
    </div>
  );
}
