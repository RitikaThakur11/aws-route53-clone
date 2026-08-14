"use client";

import React, { useState } from "react";
import { Modal } from "./Modal";
import { AlertTriangle, Loader2 } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmItemName?: string;
  confirmText?: string;
  danger?: boolean;
  requireMatchText?: string;
  isProcessing?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmItemName,
  confirmText = "Delete",
  danger = true,
  requireMatchText,
  isProcessing = false,
}: ConfirmDialogProps) {
  const [typedMatch, setTypedMatch] = useState("");
  const isMatchValid = !requireMatchText || typedMatch === requireMatchText;

  const handleConfirm = async () => {
    if (!isMatchValid || isProcessing) return;
    await onConfirm();
    setTypedMatch("");
  };

  const handleClose = () => {
    setTypedMatch("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isMatchValid || isProcessing}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              danger
                ? "bg-[#d13212] hover:bg-[#b02509]"
                : "bg-[#0972d3] hover:bg-[#033d6b]"
            }`}
          >
            {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmText}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        {danger && (
          <div className="flex items-start gap-2.5 p-3 bg-[#fdf3f2] border border-[#d13212]/30 rounded text-xs text-[#16191f]">
            <AlertTriangle className="w-4 h-4 text-[#d13212] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#d13212]">Permanent Action</p>
              <p className="mt-0.5 text-[#545b64]">
                This action cannot be undone. All associated DNS routing configurations will be permanently removed.
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-[#545b64]">{message}</p>

        {confirmItemName && (
          <div className="p-2.5 bg-[#f2f3f3] border border-[#eaeded] rounded font-mono text-xs text-[#16191f] font-semibold break-all">
            {confirmItemName}
          </div>
        )}

        {requireMatchText && (
          <div className="pt-2 space-y-1.5">
            <label className="block text-xs font-medium text-[#16191f]">
              To confirm, type <span className="font-bold text-[#d13212]">"{requireMatchText}"</span> below:
            </label>
            <input
              type="text"
              value={typedMatch}
              onChange={(e) => setTypedMatch(e.target.value)}
              placeholder={requireMatchText}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#545b64] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
