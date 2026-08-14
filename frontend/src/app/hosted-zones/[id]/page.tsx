"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { ZoneHeaderSummary } from "@/components/hosted-zones/ZoneHeaderSummary";
import { DataTable, Column } from "@/components/common/DataTable";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterDropdown } from "@/components/common/FilterDropdown";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/common/Badge";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { CreateRecordModal } from "@/components/records/CreateRecordModal";
import { EditRecordModal } from "@/components/records/EditRecordModal";
import { RecordDetailsDrawer } from "@/components/records/RecordDetailsDrawer";
import { ImportZoneModal } from "@/components/records/ImportZoneModal";
import { api } from "@/lib/api";
import { HostedZone } from "@/types/hosted-zone";
import { DNSRecord, DNSRecordType } from "@/types/dns-record";
import { formatRecordValue } from "@/lib/dns-utils";
import { useToast } from "@/context/ToastContext";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export default function HostedZoneDetailPage() {
  const params = useParams();
  const router = useRouter();
  const zoneId = params.id as string;
  const { success, error } = useToast();

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Selected Record & Drawer
  const [selectedRecord, setSelectedRecord] = useState<DNSRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchZoneAndRecords = useCallback(async () => {
    if (!zoneId) return;
    setIsLoading(true);
    try {
      const zoneData = await api.getHostedZone(zoneId);
      setZone(zoneData);

      const recordsData = await api.getRecords(zoneId, {
        search: search.trim() || undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        page,
        page_size: pageSize,
      });

      setRecords(recordsData.items);
      setTotal(recordsData.total);
      setTotalPages(recordsData.total_pages);

      // Refresh selected record if open
      if (selectedRecord) {
        const stillPresent = recordsData.items.find((r) => r.id === selectedRecord.id);
        setSelectedRecord(stillPresent || null);
      }
    } catch (err: any) {
      error("Unable to load records", err.message || "Failed to fetch DNS records.");
    } finally {
      setIsLoading(false);
    }
  }, [zoneId, search, typeFilter, page, pageSize, selectedRecord, error]);

  useEffect(() => {
    fetchZoneAndRecords();
  }, [zoneId, search, typeFilter, page, pageSize]);

  const handleCreateSuccess = (newRecord: DNSRecord) => {
    fetchZoneAndRecords();
    setSelectedRecord(newRecord);
    setIsDrawerOpen(true);
  };

  const handleEditSuccess = (updatedRecord: DNSRecord) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
    );
    setSelectedRecord(updatedRecord);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRecord) return;
    setIsDeleting(true);
    try {
      await api.deleteRecord(selectedRecord.id);
      success(
        "DNS record deleted",
        `Record for ${selectedRecord.name} (${selectedRecord.type}) deleted.`
      );
      setSelectedRecord(null);
      setIsDrawerOpen(false);
      setIsDeleteOpen(false);
      fetchZoneAndRecords();
    } catch (err: any) {
      error("Failed to delete record", err.message || "An error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  const typeFilterOptions = [
    { label: "All record types", value: "ALL" },
    { label: "A – IPv4 Address", value: "A" },
    { label: "AAAA – IPv6 Address", value: "AAAA" },
    { label: "CNAME – Canonical Name", value: "CNAME" },
    { label: "TXT – Text / SPF", value: "TXT" },
    { label: "MX – Mail Exchange", value: "MX" },
    { label: "NS – Name Server", value: "NS" },
    { label: "PTR – Pointer", value: "PTR" },
    { label: "SRV – Service Locator", value: "SRV" },
    { label: "CAA – CA Authorization", value: "CAA" },
    { label: "SOA – Start of Authority", value: "SOA" },
  ];

  // Record Table Columns
  const columns: Column<DNSRecord>[] = [
    {
      header: "Record name",
      accessor: "name",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-[#16191f] break-all">
          {row.name}
        </span>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      width: "90px",
      render: (row) => {
        let variant: "blue" | "green" | "purple" | "orange" | "grey" = "grey";
        if (row.type === "A" || row.type === "AAAA") variant = "blue";
        else if (row.type === "CNAME") variant = "purple";
        else if (row.type === "MX" || row.type === "TXT") variant = "green";
        else if (row.type === "NS" || row.type === "SOA") variant = "orange";

        return <Badge variant={variant}>{row.type}</Badge>;
      },
    },
    {
      header: "Value / Route traffic to",
      accessor: "value",
      render: (row) => {
        const formatted = formatRecordValue(row);
        return (
          <div className="font-mono text-xs text-[#16191f] truncate max-w-md" title={formatted}>
            {formatted}
          </div>
        );
      },
    },
    {
      header: "TTL (seconds)",
      accessor: "ttl",
      width: "120px",
      render: (row) => (
        <span className="font-mono text-xs text-[#545b64]">{row.ttl}</span>
      ),
    },
    {
      header: "Routing policy",
      accessor: "routing_policy",
      width: "130px",
      render: (row) => (
        <span className="text-xs text-[#545b64]">{row.routing_policy || "Simple"}</span>
      ),
    },
  ];

  if (!zone && isLoading) {
    return (
      <ConsoleLayout breadcrumbs={[{ label: "Hosted zones", href: "/hosted-zones" }, { label: "Loading..." }]}>
        <LoadingState message="Loading hosted zone configuration..." rows={8} />
      </ConsoleLayout>
    );
  }

  if (!zone && !isLoading) {
    return (
      <ConsoleLayout breadcrumbs={[{ label: "Hosted zones", href: "/hosted-zones" }, { label: "Zone not found" }]}>
        <EmptyState
          title="Hosted zone not found"
          description={`The requested hosted zone '${zoneId}' does not exist or may have been deleted.`}
          actionLabel="Back to Hosted zones"
          onAction={() => router.push("/hosted-zones")}
        />
      </ConsoleLayout>
    );
  }

  return (
    <ConsoleLayout
      breadcrumbs={[
        { label: "Hosted zones", href: "/hosted-zones" },
        { label: zone!.name },
      ]}
    >
      <div className="space-y-4">
        {/* Zone Header Summary Banner */}
        <ZoneHeaderSummary
          zone={zone!}
          onCreateRecord={() => setIsCreateOpen(true)}
          onImportZone={() => setIsImportOpen(true)}
        />

        {/* Records Management Section */}
        <div className="space-y-2">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div>
              <h2 className="text-base font-bold text-[#16191f] tracking-tight flex items-center gap-2">
                Records
                <span className="text-xs font-normal text-[#545b64]">
                  ({total})
                </span>
              </h2>
              <p className="text-xs text-[#545b64]">
                DNS resource records for {zone!.name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchZoneAndRecords}
                className="p-1.5 text-[#545b64] hover:text-[#16191f] hover:bg-[#eaeded] rounded border border-[#d5dbdb] bg-white transition-colors"
                title="Refresh records"
                aria-label="Refresh records"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#ec7211] hover:bg-[#eb5f07] rounded transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create record</span>
              </button>
            </div>
          </div>

          {/* Records Action Bar */}
          <div className="bg-white rounded-t-lg border border-[#eaeded] p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search & Type Filter */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                placeholder="Search records by name, type, or value..."
                className="w-full sm:w-80"
              />

              <FilterDropdown
                label="Type"
                value={typeFilter}
                options={typeFilterOptions}
                onChange={(val) => {
                  setTypeFilter(val);
                  setPage(1);
                }}
              />
            </div>

            {/* Selection Actions */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                disabled={!selectedRecord}
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Eye className="w-3 h-3" />
                <span>View details</span>
              </button>

              <button
                disabled={!selectedRecord}
                onClick={() => setIsEditOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit record</span>
              </button>

              <button
                disabled={!selectedRecord}
                onClick={() => setIsDeleteOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#d13212] bg-white border border-[#d13212]/40 rounded hover:bg-[#fdf3f2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Records Table / Empty / Loading */}
          <div className="bg-white rounded-b-lg border-x border-b border-[#eaeded] overflow-hidden shadow-xs">
            {isLoading ? (
              <LoadingState message="Loading DNS records..." rows={8} />
            ) : records.length === 0 ? (
              search || typeFilter !== "ALL" ? (
                <EmptyState
                  title="No records match your filters"
                  description={`No DNS records found matching query "${search || typeFilter}".`}
                  actionLabel="Clear all filters"
                  actionType="clear"
                  onAction={() => {
                    setSearch("");
                    setTypeFilter("ALL");
                    setPage(1);
                  }}
                />
              ) : (
                <EmptyState
                  title="No records found"
                  description="Add DNS records to route traffic to your servers, load balancers, or email providers."
                  actionLabel="Create record"
                  actionType="create"
                  onAction={() => setIsCreateOpen(true)}
                />
              )
            ) : (
              <>
                <DataTable
                  columns={columns}
                  data={records}
                  keyExtractor={(r) => r.id}
                  selectedId={selectedRecord?.id}
                  onSelectRow={(r) => setSelectedRecord(r)}
                  onRowClick={(r) => {
                    setSelectedRecord(r);
                    setIsDrawerOpen(true);
                  }}
                />
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={total}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                  onPageSizeChange={(sz) => {
                    setPageSize(sz);
                    setPage(1);
                  }}
                  pageSizeOptions={[10, 25, 50, 100]}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Record Inspection Side Drawer */}
      <RecordDetailsDrawer
        record={selectedRecord}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(r) => {
          setSelectedRecord(r);
          setIsEditOpen(true);
        }}
        onDelete={(r) => {
          setSelectedRecord(r);
          setIsDeleteOpen(true);
        }}
      />

      {/* Modals & Dialogs */}
      <CreateRecordModal
        zone={zone!}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditRecordModal
        record={selectedRecord}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${selectedRecord?.type} record`}
        message={`Are you sure you want to permanently delete this ${selectedRecord?.type} record for '${selectedRecord?.name}'?`}
        confirmItemName={`${selectedRecord?.name}   ${selectedRecord?.type}   ${selectedRecord?.value}`}
        confirmText="Delete record"
        isProcessing={isDeleting}
        danger={true}
      />

      <ImportZoneModal
        zone={zone!}
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={fetchZoneAndRecords}
      />
    </ConsoleLayout>
  );
}
