"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "lg",
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0f141a]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative z-10 w-full ${maxWidthClasses} bg-white rounded-lg shadow-2xl border border-[#d5dbdb] flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#eaeded] bg-[#fafafa]">
          <div>
            <h2 id="modal-title" className="text-base font-semibold text-[#16191f]">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-[#545b64] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-[#545b64] hover:text-[#16191f] p-1 rounded-md hover:bg-[#eaeded] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 overflow-y-auto text-sm text-[#16191f] space-y-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-[#eaeded] bg-[#fafafa]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
