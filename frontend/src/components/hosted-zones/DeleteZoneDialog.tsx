"use client";

import React, { useState } from "react";
import { ConfirmDialog } from "../common/ConfirmDialog";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { HostedZone } from "@/types/hosted-zone";

interface DeleteZoneDialogProps {
  zone: HostedZone | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (deletedId: string) => void;
}

export function DeleteZoneDialog({
  zone,
  isOpen,
  onClose,
  onSuccess,
}: DeleteZoneDialogProps) {
  const { success, error } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!zone) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteHostedZone(zone.id);
      success("Hosted zone deleted", `Hosted zone ${zone.name} and all associated records were deleted.`);
      onSuccess(zone.id);
      onClose();
    } catch (err: any) {
      error("Failed to delete hosted zone", err.message || "An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete hosted zone"
      message={`Are you sure you want to delete hosted zone '${zone.name}'? This will immediately delete all ${zone.record_count} associated DNS records.`}
      confirmItemName={`${zone.name} (${zone.id})`}
      confirmText="Delete hosted zone"
      requireMatchText="delete"
      isProcessing={isDeleting}
      danger={true}
    />
  );
}
