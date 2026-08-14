"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { HostedZone } from "@/types/hosted-zone";
import { Loader2 } from "lucide-react";

interface EditZoneModalProps {
  zone: HostedZone | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedZone: HostedZone) => void;
}

export function EditZoneModal({
  zone,
  isOpen,
  onClose,
  onSuccess,
}: EditZoneModalProps) {
  const { success, error } = useToast();
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (zone) {
      setDescription(zone.description || "");
    }
  }, [zone]);

  if (!zone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await api.updateHostedZone(zone.id, {
        description: description.trim(),
      });
      success("Hosted zone updated", `Details for ${zone.name} updated successfully.`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      error("Failed to update hosted zone", err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit hosted zone details"
      subtitle={`Modify metadata for ${zone.name}`}
      maxWidth="md"
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
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0972d3] hover:bg-[#033d6b] rounded transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save changes
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Domain name read-only info */}
        <div>
          <label className="block text-xs font-semibold text-[#545b64]">Hosted zone name</label>
          <p className="font-mono text-xs text-[#16191f] mt-0.5 bg-[#f2f3f3] p-2 rounded border border-[#eaeded]">
            {zone.name}
          </p>
        </div>

        {/* Hosted zone ID */}
        <div>
          <label className="block text-xs font-semibold text-[#545b64]">Hosted zone ID</label>
          <p className="font-mono text-xs text-[#16191f] mt-0.5 bg-[#f2f3f3] p-2 rounded border border-[#eaeded]">
            {zone.id}
          </p>
        </div>

        {/* Description Field */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#16191f]">
            Description / Comment
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
            placeholder="Add description..."
          />
        </div>
      </form>
    </Modal>
  );
}
