"use client";

import React, { useState } from "react";
import { DNSRecord } from "@/types/dns-record";
import { Badge } from "../common/Badge";
import { formatRecordValue, formatBindSnippet, RECORD_TYPE_METADATA } from "@/lib/dns-utils";
import { useToast } from "@/context/ToastContext";
import {
  X,
  Copy,
  Check,
  Edit2,
  Trash2,
  Globe,
  Clock,
  ShieldCheck,
  FileCode,
  Terminal,
} from "lucide-react";

interface RecordDetailsDrawerProps {
  record: DNSRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: DNSRecord) => void;
  onDelete: (record: DNSRecord) => void;
}

export function RecordDetailsDrawer({
  record,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: RecordDetailsDrawerProps) {
  const { info } = useToast();
  const [copiedValue, setCopiedValue] = useState(false);
  const [copiedBind, setCopiedBind] = useState(false);

  if (!isOpen || !record) return null;

  const formattedVal = formatRecordValue(record);
  const bindSnippet = formatBindSnippet(record);
  const meta = RECORD_TYPE_METADATA[record.type];

  const handleCopyValue = () => {
    navigator.clipboard.writeText(formattedVal);
    setCopiedValue(true);
    info("Copied to clipboard", "Record value copied.");
    setTimeout(() => setCopiedValue(false), 2000);
  };

  const handleCopyBind = () => {
    navigator.clipboard.writeText(bindSnippet);
    setCopiedBind(true);
    info("Copied to clipboard", "BIND record snippet copied.");
    setTimeout(() => setCopiedBind(false), 2000);
  };

  // Convert TTL to readable string
  const ttlReadable = () => {
    if (record.ttl < 60) return `${record.ttl} seconds`;
    if (record.ttl < 3600) return `${record.ttl} seconds (${Math.round(record.ttl / 60)} minutes)`;
    if (record.ttl < 86400) return `${record.ttl} seconds (${Math.round(record.ttl / 3600)} hours)`;
    return `${record.ttl} seconds (${Math.round(record.ttl / 86400)} days)`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0f141a]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-[#d5dbdb] flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#eaeded] bg-[#fafafa] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#545b64]">
                Record details
              </span>
              <Badge variant="blue" size="sm">
                {record.type}
              </Badge>
            </div>
            <button
              onClick={onClose}
              className="text-[#545b64] hover:text-[#16191f] p-1 rounded hover:bg-[#eaeded] transition-colors"
              aria-label="Close details drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-[#16191f]">
            {/* Record Name / Title */}
            <div>
              <span className="text-[11px] font-semibold text-[#545b64] uppercase tracking-wider block mb-1">
                Record name
              </span>
              <div className="p-2.5 bg-[#f2f3f3] border border-[#eaeded] rounded font-mono font-bold text-sm text-[#16191f] break-all">
                {record.name}
              </div>
            </div>

            {/* Type & Specification */}
            <div>
              <span className="text-[11px] font-semibold text-[#545b64] uppercase tracking-wider block mb-1">
                Record type specification
              </span>
              <div className="p-3 bg-[#f1faff] border border-[#0972d3]/20 rounded text-xs space-y-1">
                <p className="font-semibold text-[#0972d3]">{meta.title}</p>
                <p className="text-[#545b64] text-[11px]">{meta.description}</p>
                <span className="inline-block mt-1 text-[10px] font-mono text-[#0972d3] bg-white px-1.5 py-0.5 rounded border border-[#0972d3]/30">
                  {meta.rfc}
                </span>
              </div>
            </div>

            {/* Value / Routing Target */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#545b64] uppercase tracking-wider">
                  Routing Target / Value
                </span>
                <button
                  onClick={handleCopyValue}
                  className="flex items-center gap-1 text-[11px] text-[#0972d3] hover:underline"
                >
                  {copiedValue ? (
                    <Check className="w-3 h-3 text-[#037f0c]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedValue ? "Copied" : "Copy value"}</span>
                </button>
              </div>
              <div className="p-3 bg-[#f2f3f3] border border-[#eaeded] rounded font-mono text-xs text-[#16191f] break-all select-all">
                {formattedVal}
              </div>
            </div>

            {/* Technical Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#eaeded]">
              <div>
                <span className="text-[#545b64] block text-[11px]">TTL (Time to live)</span>
                <span className="font-semibold text-xs text-[#16191f] mt-0.5 block">
                  {ttlReadable()}
                </span>
              </div>

              <div>
                <span className="text-[#545b64] block text-[11px]">Routing policy</span>
                <span className="font-semibold text-xs text-[#16191f] mt-0.5 block">
                  {record.routing_policy}
                </span>
              </div>

              {record.priority !== null && record.priority !== undefined && (
                <div>
                  <span className="text-[#545b64] block text-[11px]">Priority</span>
                  <span className="font-mono font-semibold text-xs text-[#16191f] mt-0.5 block">
                    {record.priority}
                  </span>
                </div>
              )}

              {record.port !== null && record.port !== undefined && (
                <div>
                  <span className="text-[#545b64] block text-[11px]">Port</span>
                  <span className="font-mono font-semibold text-xs text-[#16191f] mt-0.5 block">
                    {record.port}
                  </span>
                </div>
              )}

              {record.tag && (
                <div>
                  <span className="text-[#545b64] block text-[11px]">CAA Tag</span>
                  <span className="font-mono font-semibold text-xs text-[#0972d3] mt-0.5 block">
                    {record.tag}
                  </span>
                </div>
              )}
            </div>

            {/* Raw BIND Zone Snippet */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#545b64] uppercase tracking-wider flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  BIND Zone format
                </span>
                <button
                  onClick={handleCopyBind}
                  className="flex items-center gap-1 text-[11px] text-[#0972d3] hover:underline"
                >
                  {copiedBind ? (
                    <Check className="w-3 h-3 text-[#037f0c]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedBind ? "Copied" : "Copy BIND"}</span>
                </button>
              </div>
              <div className="p-3 bg-[#161e2e] text-green-400 font-mono text-[11px] rounded border border-gray-700 overflow-x-auto whitespace-pre">
                {bindSnippet}
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-3 border-t border-[#eaeded] space-y-1 text-[11px] text-[#879596]">
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span>{new Date(record.created_at).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Record ID:</span>
                <span className="font-mono">{record.id.substring(0, 12)}...</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-[#eaeded] bg-[#fafafa] flex items-center justify-between">
            <button
              onClick={() => onDelete(record)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#d13212] hover:bg-[#fdf3f2] rounded border border-[#d13212]/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => onEdit(record)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0972d3] hover:bg-[#033d6b] rounded transition-colors shadow-xs"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
