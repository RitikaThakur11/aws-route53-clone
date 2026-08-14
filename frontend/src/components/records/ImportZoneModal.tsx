"use client";

import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { HostedZone } from "@/types/hosted-zone";
import { Loader2, Upload, FileText, AlertCircle } from "lucide-react";

interface ImportZoneModalProps {
  zone: HostedZone;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ImportZoneModal({
  zone,
  isOpen,
  onClose,
  onSuccess,
}: ImportZoneModalProps) {
  const { success, error } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setContent(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setValidationError("Zone content cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await api.importZoneBind(zone.id, content);
      success("Import successful", resp.message);
      onSuccess();
      onClose();
    } catch (err: any) {
      error("Import failed", err.message || "Failed to import records.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import BIND zone file"
      subtitle={`Import DNS resource records into ${zone.name}`}
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#ec7211] hover:bg-[#eb5f07] rounded transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Import records
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-[#fdf3f2] border border-[#d13212]/30 rounded text-xs text-[#d13212]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* File Upload Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#16191f] mb-1">
            Choose zone file (.txt, .zone)
          </label>
          <input
            type="file"
            accept=".txt,.zone,.bind"
            onChange={handleFileUpload}
            className="block w-full text-xs text-[#545b64] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[#545b64] file:text-xs file:font-semibold file:bg-white file:text-[#16191f] hover:file:bg-[#eaeded] cursor-pointer"
          />
        </div>

        {/* Raw Text Content */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Or paste BIND zone file contents
          </label>
          <p className="text-[11px] text-[#545b64]">
            Paste standard RFC 1035 zone records format.
          </p>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`$ORIGIN ${zone.name}\n$TTL 300\n@   IN  A     198.51.100.1\nwww IN  CNAME example.com.\nmail IN MX    10 mail.example.com.`}
            className="w-full font-mono text-xs p-3 bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3]"
          />
        </div>
      </form>
    </Modal>
  );
}
