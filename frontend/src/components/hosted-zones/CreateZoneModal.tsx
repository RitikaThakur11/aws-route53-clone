"use client";

import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { HostedZone } from "@/types/hosted-zone";
import { Globe, Lock, Loader2, AlertCircle } from "lucide-react";

interface CreateZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (zone: HostedZone) => void;
}

export function CreateZoneModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateZoneModalProps) {
  const { success, error } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState<"Public" | "Private">("Public");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanName = name.trim().toLowerCase();
    if (!cleanName) {
      setValidationError("Domain name is required.");
      return;
    }

    // Basic domain validation
    if (!/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(cleanName.replace(/\.$/, ""))) {
      setValidationError("Enter a valid domain name, such as 'example.com'.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newZone = await api.createHostedZone({
        name: cleanName,
        type,
        description: description.trim(),
        is_private: type === "Private",
      });

      success(
        "Hosted zone created",
        `Hosted zone ${newZone.name} was created successfully with default NS and SOA records.`
      );
      onSuccess(newZone);
      handleClose();
    } catch (err: any) {
      error("Failed to create hosted zone", err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setType("Public");
    setDescription("");
    setValidationError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create hosted zone"
      subtitle="A hosted zone tells Route 53 how to respond to DNS queries for a domain."
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#ec7211] hover:bg-[#eb5f07] rounded transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Create hosted zone
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

        {/* Domain Name */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Domain name <span className="text-[#d13212]">*</span>
          </label>
          <p className="text-[11px] text-[#545b64]">
            The name of the domain that you want to route traffic for. Example:{" "}
            <code className="font-mono bg-[#f2f3f3] px-1 py-0.5 rounded text-[#16191f]">
              example.com
            </code>
          </p>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="example.com"
            className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Description <span className="text-[#545b64] font-normal">(Optional)</span>
          </label>
          <p className="text-[11px] text-[#545b64]">
            Any comment or description about the hosted zone.
          </p>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Production domain for public web services"
            className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
          />
        </div>

        {/* Type Selection */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold text-[#16191f]">Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Public Option */}
            <label
              className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
                type === "Public"
                  ? "border-[#0972d3] bg-[#f1faff]"
                  : "border-[#d5dbdb] bg-white hover:bg-[#fafafa]"
              }`}
            >
              <input
                type="radio"
                name="zoneType"
                checked={type === "Public"}
                onChange={() => setType("Public")}
                className="mt-0.5 text-[#0972d3] focus:ring-[#0972d3]"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16191f]">
                  <Globe className="w-3.5 h-3.5 text-[#0972d3]" />
                  <span>Public hosted zone</span>
                </div>
                <p className="text-[11px] text-[#545b64]">
                  Routes traffic on the public internet to your resources.
                </p>
              </div>
            </label>

            {/* Private Option */}
            <label
              className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-all ${
                type === "Private"
                  ? "border-[#0972d3] bg-[#f1faff]"
                  : "border-[#d5dbdb] bg-white hover:bg-[#fafafa]"
              }`}
            >
              <input
                type="radio"
                name="zoneType"
                checked={type === "Private"}
                onChange={() => setType("Private")}
                className="mt-0.5 text-[#0972d3] focus:ring-[#0972d3]"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#16191f]">
                  <Lock className="w-3.5 h-3.5 text-[#8d6605]" />
                  <span>Private hosted zone</span>
                </div>
                <p className="text-[11px] text-[#545b64]">
                  Routes traffic within one or more Amazon VPCs only.
                </p>
              </div>
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}
