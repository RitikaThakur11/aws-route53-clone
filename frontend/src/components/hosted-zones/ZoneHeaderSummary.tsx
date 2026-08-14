"use client";

import React, { useState } from "react";
import { HostedZone } from "@/types/hosted-zone";
import { Badge } from "../common/Badge";
import { Copy, Check, Download, Upload, Plus, Globe, Lock, Clock } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";

interface ZoneHeaderSummaryProps {
  zone: HostedZone;
  onCreateRecord: () => void;
  onImportZone: () => void;
}

export function ZoneHeaderSummary({
  zone,
  onCreateRecord,
  onImportZone,
}: ZoneHeaderSummaryProps) {
  const { info, error } = useToast();
  const [copiedId, setCopiedId] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(zone.id);
    setCopiedId(true);
    info("Copied to clipboard", `Hosted Zone ID: ${zone.id}`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleExportBind = async () => {
    setIsExporting(true);
    try {
      const bindContent = await api.exportZoneBind(zone.id);
      const blob = new Blob([bindContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${zone.name.replace(/\.$/, "")}.zone.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      info("Export complete", `Downloaded BIND zone file for ${zone.name}`);
    } catch (err: any) {
      error("Export failed", err.message || "Failed to export zone.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      const jsonData = await api.exportZoneJson(zone.id);
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${zone.name.replace(/\.$/, "")}.route53.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      info("Export complete", `Downloaded JSON zone export for ${zone.name}`);
    } catch (err: any) {
      error("Export failed", err.message || "Failed to export zone.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-[#eaeded] p-5 shadow-xs space-y-4">
      {/* Top row: Title + Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#16191f] tracking-tight flex items-center gap-2">
              {zone.name}
            </h1>
            <Badge variant={zone.type === "Public" ? "blue" : "orange"} size="md">
              {zone.type === "Public" ? (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Public hosted zone
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Private hosted zone
                </span>
              )}
            </Badge>
          </div>
          {zone.description && (
            <p className="text-xs text-[#545b64] mt-1">{zone.description}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onImportZone}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import BIND file</span>
          </button>

          <div className="relative inline-flex rounded shadow-xs">
            <button
              onClick={handleExportBind}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#16191f] bg-white border border-[#545b64] rounded-l hover:bg-[#eaeded] transition-colors border-r-0"
              title="Export as BIND zone file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export BIND</span>
            </button>
            <button
              onClick={handleExportJson}
              disabled={isExporting}
              className="flex items-center px-2.5 py-1.5 text-xs font-semibold text-[#16191f] bg-white border border-[#545b64] rounded-r hover:bg-[#eaeded] transition-colors"
              title="Export as JSON"
            >
              <span>JSON</span>
            </button>
          </div>

          <button
            onClick={onCreateRecord}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#ec7211] hover:bg-[#eb5f07] rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create record</span>
          </button>
        </div>
      </div>

      {/* Zone Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#eaeded] text-xs">
        <div>
          <span className="text-[#545b64] block text-[11px]">Hosted zone ID</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <code className="font-mono text-xs font-semibold text-[#16191f]">{zone.id}</code>
            <button
              onClick={handleCopyId}
              className="text-[#545b64] hover:text-[#0972d3] p-0.5 rounded"
              title="Copy Hosted Zone ID"
              aria-label="Copy Hosted Zone ID"
            >
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-[#037f0c]" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <span className="text-[#545b64] block text-[11px]">Record count</span>
          <span className="font-semibold text-xs text-[#16191f] mt-0.5 block">
            {zone.record_count} {zone.record_count === 1 ? "record" : "records"}
          </span>
        </div>

        <div>
          <span className="text-[#545b64] block text-[11px]">Routing status</span>
          <span className="text-[#037f0c] font-semibold text-xs mt-0.5 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#037f0c]" />
            In sync (Global)
          </span>
        </div>

        <div>
          <span className="text-[#545b64] block text-[11px]">Created</span>
          <span className="text-xs text-[#16191f] mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#545b64]" />
            {new Date(zone.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
