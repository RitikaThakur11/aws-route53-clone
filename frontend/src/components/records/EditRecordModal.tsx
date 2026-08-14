"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { DNSRecord } from "@/types/dns-record";
import { TTL_PRESETS, ROUTING_POLICIES } from "@/lib/constants";
import { RECORD_TYPE_METADATA } from "@/lib/dns-utils";
import { ARecordForm } from "./forms/ARecordForm";
import { AAAARecordForm } from "./forms/AAAARecordForm";
import { CNameRecordForm } from "./forms/CNameRecordForm";
import { TxtRecordForm } from "./forms/TxtRecordForm";
import { MxRecordForm } from "./forms/MxRecordForm";
import { NsRecordForm } from "./forms/NsRecordForm";
import { PtrRecordForm } from "./forms/PtrRecordForm";
import { SrvRecordForm } from "./forms/SrvRecordForm";
import { CaaRecordForm } from "./forms/CaaRecordForm";
import { Loader2, AlertCircle, AlertTriangle } from "lucide-react";

interface EditRecordModalProps {
  record: DNSRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRecord: DNSRecord) => void;
}

export function EditRecordModal({
  record,
  isOpen,
  onClose,
  onSuccess,
}: EditRecordModalProps) {
  const { success, error } = useToast();
  const [ttl, setTtl] = useState(300);
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState(10);
  const [weight, setWeight] = useState(50);
  const [port, setPort] = useState(5060);
  const [flags, setFlags] = useState(0);
  const [tag, setTag] = useState("issue");
  const [routingPolicy, setRoutingPolicy] = useState("Simple");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setTtl(record.ttl);
      setValue(record.value);
      setPriority(record.priority ?? 10);
      setWeight(record.weight ?? 50);
      setPort(record.port ?? 5060);
      setFlags(record.flags ?? 0);
      setTag(record.tag ?? "issue");
      setRoutingPolicy(record.routing_policy || "Simple");
      setValidationError(null);
    }
  }, [record]);

  if (!record) return null;

  const meta = RECORD_TYPE_METADATA[record.type];
  const isSystemRecord = record.type === "SOA";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanVal = value.trim();
    if (!cleanVal) {
      setValidationError("Record value cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatePayload: any = {
        ttl: Number(ttl),
        value: cleanVal,
        routing_policy: routingPolicy,
      };

      if (record.type === "MX") {
        updatePayload.priority = priority;
      } else if (record.type === "SRV") {
        updatePayload.priority = priority;
        updatePayload.weight = weight;
        updatePayload.port = port;
      } else if (record.type === "CAA") {
        updatePayload.flags = flags;
        updatePayload.tag = tag;
      }

      const updated = await api.updateRecord(record.id, updatePayload);
      success("DNS record updated", `Record for ${updated.name} updated successfully.`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      error("Failed to update DNS record", err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${record.type} record`}
      subtitle={`Modify DNS routing parameters for ${record.name}`}
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
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0972d3] hover:bg-[#033d6b] rounded transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save changes
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

        {isSystemRecord && (
          <div className="flex items-start gap-2 p-3 bg-[#fff9e6] border border-[#8d6605]/30 rounded text-xs text-[#16191f]">
            <AlertTriangle className="w-4 h-4 text-[#8d6605] shrink-0 mt-0.5" />
            <p>
              This is the zone's Start of Authority (SOA) record. Modifying these parameters affects DNS caching and zone authority globally.
            </p>
          </div>
        )}

        {/* Read-only Record Summary */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-[#f2f3f3] rounded border border-[#eaeded] text-xs">
          <div>
            <span className="text-[#545b64] block text-[11px]">Record name</span>
            <span className="font-mono font-semibold text-[#16191f] break-all">{record.name}</span>
          </div>
          <div>
            <span className="text-[#545b64] block text-[11px]">Type</span>
            <span className="font-mono font-semibold text-[#0972d3]">{record.type}</span>
          </div>
        </div>

        {/* Dynamic Form per Type */}
        <div className="p-3.5 bg-[#fafafa] rounded border border-[#eaeded]">
          {record.type === "A" && (
            <ARecordForm value={value} onChangeValue={setValue} />
          )}
          {record.type === "AAAA" && (
            <AAAARecordForm value={value} onChangeValue={setValue} />
          )}
          {record.type === "CNAME" && (
            <CNameRecordForm value={value} onChangeValue={setValue} />
          )}
          {record.type === "TXT" && (
            <TxtRecordForm value={value} onChangeValue={setValue} />
          )}
          {record.type === "MX" && (
            <MxRecordForm
              value={value}
              onChangeValue={setValue}
              priority={priority}
              onChangePriority={setPriority}
            />
          )}
          {record.type === "NS" && (
            <NsRecordForm value={value} onChangeValue={setValue} />
          )}
          {record.type === "PTR" && (
            <PtrRecordForm value={value} onChangeValue={setValue} />
          )}
          {record.type === "SRV" && (
            <SrvRecordForm
              value={value}
              onChangeValue={setValue}
              priority={priority}
              onChangePriority={setPriority}
              weight={weight}
              onChangeWeight={setWeight}
              port={port}
              onChangePort={setPort}
            />
          )}
          {record.type === "CAA" && (
            <CaaRecordForm
              value={value}
              onChangeValue={setValue}
              flags={flags}
              onChangeFlags={setFlags}
              tag={tag}
              onChangeTag={setTag}
            />
          )}
          {record.type === "SOA" && (
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#16191f]">SOA Value</label>
              <textarea
                rows={2}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3]"
              />
            </div>
          )}
        </div>

        {/* TTL & Routing Policy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#16191f]">TTL (Seconds)</label>
            <input
              type="number"
              min={1}
              value={ttl}
              onChange={(e) => setTtl(parseInt(e.target.value, 10) || 300)}
              className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#16191f]">Routing policy</label>
            <select
              value={routingPolicy}
              onChange={(e) => setRoutingPolicy(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3]"
            >
              {ROUTING_POLICIES.map((rp) => (
                <option key={rp.value} value={rp.value}>
                  {rp.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
