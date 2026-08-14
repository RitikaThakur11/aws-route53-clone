"use client";

import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { HostedZone } from "@/types/hosted-zone";
import { DNSRecord, DNSRecordType } from "@/types/dns-record";
import { RECORD_TYPES, TTL_PRESETS, ROUTING_POLICIES } from "@/lib/constants";
import { RECORD_TYPE_METADATA, getFullDomainPreview } from "@/lib/dns-utils";
import { ARecordForm } from "./forms/ARecordForm";
import { AAAARecordForm } from "./forms/AAAARecordForm";
import { CNameRecordForm } from "./forms/CNameRecordForm";
import { TxtRecordForm } from "./forms/TxtRecordForm";
import { MxRecordForm } from "./forms/MxRecordForm";
import { NsRecordForm } from "./forms/NsRecordForm";
import { PtrRecordForm } from "./forms/PtrRecordForm";
import { SrvRecordForm } from "./forms/SrvRecordForm";
import { CaaRecordForm } from "./forms/CaaRecordForm";
import { Loader2, Info, AlertCircle } from "lucide-react";

interface CreateRecordModalProps {
  zone: HostedZone;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRecord: DNSRecord) => void;
}

export function CreateRecordModal({
  zone,
  isOpen,
  onClose,
  onSuccess,
}: CreateRecordModalProps) {
  const { success, error } = useToast();
  const [selectedType, setSelectedType] = useState<DNSRecordType>("A");
  const [name, setName] = useState("");
  const [ttl, setTtl] = useState(300);
  const [customTtl, setCustomTtl] = useState(false);
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState(10);
  const [weight, setWeight] = useState(50);
  const [port, setPort] = useState(5060);
  const [flags, setFlags] = useState(0);
  const [tag, setTag] = useState("issue");
  const [routingPolicy, setRoutingPolicy] = useState("Simple");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const meta = RECORD_TYPE_METADATA[selectedType];
  const domainPreview = getFullDomainPreview(name, zone.name);

  const handleTypeChange = (type: DNSRecordType) => {
    setSelectedType(type);
    setValue("");
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanVal = value.trim();
    if (!cleanVal) {
      setValidationError("Record value cannot be empty.");
      return;
    }

    if (ttl < 1) {
      setValidationError("TTL must be a positive integer.");
      return;
    }

    setIsSubmitting(true);
    try {
      const recordPayload: any = {
        name: name.trim() || "@",
        type: selectedType,
        ttl: Number(ttl),
        value: cleanVal,
        routing_policy: routingPolicy,
      };

      if (selectedType === "MX") {
        recordPayload.priority = priority;
      } else if (selectedType === "SRV") {
        recordPayload.priority = priority;
        recordPayload.weight = weight;
        recordPayload.port = port;
      } else if (selectedType === "CAA") {
        recordPayload.flags = flags;
        recordPayload.tag = tag;
      }

      const created = await api.createRecord(zone.id, recordPayload);
      success(
        "DNS record created",
        `Created ${created.type} record for ${created.name} successfully.`
      );
      onSuccess(created);
      handleClose();
    } catch (err: any) {
      error("Failed to create DNS record", err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setValue("");
    setSelectedType("A");
    setTtl(300);
    setCustomTtl(false);
    setPriority(10);
    setWeight(50);
    setPort(5060);
    setFlags(0);
    setTag("issue");
    setRoutingPolicy("Simple");
    setValidationError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create record"
      subtitle={`Define a DNS routing record for ${zone.name}`}
      maxWidth="xl"
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
            Create record
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

        {/* Record Type Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#16191f]">Record type</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {RECORD_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`py-1.5 px-2 text-xs font-mono font-semibold rounded border transition-all ${
                  selectedType === t
                    ? "bg-[#0972d3] text-white border-[#0972d3] shadow-xs"
                    : "bg-white text-[#16191f] border-[#d5dbdb] hover:bg-[#f2f3f3]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Type Info Banner */}
          <div className="flex items-start gap-2 p-2.5 bg-[#f1faff] border border-[#0972d3]/20 rounded text-xs text-[#16191f]">
            <Info className="w-4 h-4 text-[#0972d3] shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px]">
              <p className="font-semibold text-[#0972d3]">{meta.title}</p>
              <p className="text-[#545b64]">{meta.description}</p>
            </div>
          </div>
        </div>

        {/* Record Name (Subdomain) & Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#16191f]">
              Record name <span className="text-[#545b64] font-normal">(Subdomain)</span>
            </label>
            <p className="text-[11px] text-[#545b64]">Leave empty or '@' for apex domain</p>
            <div className="flex items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="api, www, or leave empty"
                className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3] focus:border-[#0972d3]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#545b64]">
              Fully qualified domain name (FQDN)
            </label>
            <p className="text-[11px] text-[#879596]">Generated DNS target name</p>
            <div className="font-mono text-xs text-[#16191f] bg-[#f2f3f3] border border-[#eaeded] px-3 py-2 rounded truncate">
              {domainPreview}
            </div>
          </div>
        </div>

        {/* Dynamic Type-Specific Form Component */}
        <div className="p-3.5 bg-[#fafafa] rounded border border-[#eaeded]">
          {selectedType === "A" && (
            <ARecordForm value={value} onChangeValue={setValue} />
          )}
          {selectedType === "AAAA" && (
            <AAAARecordForm value={value} onChangeValue={setValue} />
          )}
          {selectedType === "CNAME" && (
            <CNameRecordForm value={value} onChangeValue={setValue} />
          )}
          {selectedType === "TXT" && (
            <TxtRecordForm value={value} onChangeValue={setValue} />
          )}
          {selectedType === "MX" && (
            <MxRecordForm
              value={value}
              onChangeValue={setValue}
              priority={priority}
              onChangePriority={setPriority}
            />
          )}
          {selectedType === "NS" && (
            <NsRecordForm value={value} onChangeValue={setValue} />
          )}
          {selectedType === "PTR" && (
            <PtrRecordForm value={value} onChangeValue={setValue} />
          )}
          {selectedType === "SRV" && (
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
          {selectedType === "CAA" && (
            <CaaRecordForm
              value={value}
              onChangeValue={setValue}
              flags={flags}
              onChangeFlags={setFlags}
              tag={tag}
              onChangeTag={setTag}
            />
          )}
        </div>

        {/* TTL & Routing Policy Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* TTL Configuration */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#16191f]">
                TTL (Seconds)
              </label>
              <button
                type="button"
                onClick={() => setCustomTtl(!customTtl)}
                className="text-[11px] text-[#0972d3] hover:underline"
              >
                {customTtl ? "Use presets" : "Custom TTL"}
              </button>
            </div>
            {customTtl ? (
              <input
                type="number"
                min={1}
                max={2147483647}
                value={ttl}
                onChange={(e) => setTtl(parseInt(e.target.value, 10) || 300)}
                className="w-full font-mono px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3]"
              />
            ) : (
              <select
                value={ttl}
                onChange={(e) => setTtl(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-[#aab7b8] rounded focus:outline-none focus:ring-1 focus:ring-[#0972d3]"
              >
                {TTL_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Routing Policy */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-[#16191f]">
              Routing policy
            </label>
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
