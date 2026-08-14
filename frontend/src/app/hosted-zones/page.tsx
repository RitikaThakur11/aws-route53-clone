"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { SearchBar } from "@/components/common/SearchBar";
import { FilterDropdown } from "@/components/common/FilterDropdown";
import { Pagination } from "@/components/common/Pagination";
import { Badge } from "@/components/common/Badge";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { CreateZoneModal } from "@/components/hosted-zones/CreateZoneModal";
import { EditZoneModal } from "@/components/hosted-zones/EditZoneModal";
import { DeleteZoneDialog } from "@/components/hosted-zones/DeleteZoneDialog";
import { api } from "@/lib/api";
import { HostedZone } from "@/types/hosted-zone";
import { useToast } from "@/context/ToastContext";
import {
  Globe,
  Lock,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  Info,
} from "lucide-react";

export default function HostedZonesPage() {
  const router = useRouter();
  const { error } = useToast();

  const [zones, setZones] = useState<HostedZone[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Selected Hosted Zone for Row Actions
  const [selectedZone, setSelectedZone] = useState<HostedZone | null>(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await api.getHostedZones({
        search: search.trim() || undefined,
        type: typeFilter !== "ALL" ? typeFilter : undefined,
        page,
        page_size: pageSize,
      });
      setZones(resp.items);
      setTotal(resp.total);
      setTotalPages(resp.total_pages);

      // Keep selection if exists in new data
      if (selectedZone) {
        const stillPresent = resp.items.find((z) => z.id === selectedZone.id);
        setSelectedZone(stillPresent || null);
      }
    } catch (err: any) {
      error("Unable to load hosted zones", err.message || "API request failed.");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, page, pageSize, selectedZone, error]);

  useEffect(() => {
    fetchZones();
  }, [search, typeFilter, page, pageSize]);

  const handleCreateSuccess = (newZone: HostedZone) => {
    fetchZones();
    router.push(`/hosted-zones/${newZone.id}`);
  };

  const handleEditSuccess = (updatedZone: HostedZone) => {
    setZones((prev) =>
      prev.map((z) => (z.id === updatedZone.id ? updatedZone : z))
    );
    setSelectedZone(updatedZone);
  };

  const handleDeleteSuccess = () => {
    setSelectedZone(null);
    fetchZones();
  };

  // Table Columns
  const columns: Column<HostedZone>[] = [
    {
      header: "Hosted zone name",
      accessor: "name",
      render: (row) => (
        <div className="flex items-center gap-1.5 font-semibold">
          <Link
            href={`/hosted-zones/${row.id}`}
            className="text-[#0972d3] hover:underline font-mono text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            {row.name}
          </Link>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      width: "160px",
      render: (row) => (
        <Badge variant={row.type === "Public" ? "blue" : "orange"} size="sm">
          {row.type === "Public" ? (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" /> Public
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private
            </span>
          )}
        </Badge>
      ),
    },
    {
      header: "Record count",
      accessor: "record_count",
      width: "120px",
      render: (row) => (
        <span className="font-mono text-xs text-[#16191f]">
          {row.record_count}
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      render: (row) => (
        <span className="text-xs text-[#545b64] truncate max-w-xs block">
          {row.description || "—"}
        </span>
      ),
    },
    {
      header: "Hosted zone ID",
      accessor: "id",
      width: "180px",
      render: (row) => (
        <span className="font-mono text-xs text-[#545b64]">{row.id}</span>
      ),
    },
    {
      header: "Created date",
      accessor: "created_at",
      width: "140px",
      render: (row) => (
        <span className="text-xs text-[#545b64]">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <ConsoleLayout breadcrumbs={[{ label: "Hosted zones" }]}>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#16191f] tracking-tight flex items-center gap-2">
              Hosted zones
              <span className="text-sm font-normal text-[#545b64]">
                ({total})
              </span>
            </h1>
            <p className="text-xs text-[#545b64] mt-0.5">
              A hosted zone is a container for records that tell DNS how you want to route traffic for a domain.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchZones}
              className="p-1.5 text-[#545b64] hover:text-[#16191f] hover:bg-[#eaeded] rounded border border-[#d5dbdb] bg-white transition-colors"
              title="Refresh"
              aria-label="Refresh hosted zones"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#ec7211] hover:bg-[#eb5f07] rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create hosted zone</span>
            </button>
          </div>
        </div>

        {/* Action Bar / Controls */}
        <div className="bg-white rounded-t-lg border border-[#eaeded] p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              placeholder="Search hosted zones by name, ID, or description..."
              className="w-full sm:w-80"
            />

            <FilterDropdown
              label="Type"
              value={typeFilter}
              options={[
                { label: "All types", value: "ALL" },
                { label: "Public hosted zones", value: "Public" },
                { label: "Private hosted zones", value: "Private" },
              ]}
              onChange={(val) => {
                setTypeFilter(val);
                setPage(1);
              }}
            />
          </div>

          {/* Row Actions (Enabled when a zone is selected) */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              disabled={!selectedZone}
              onClick={() => {
                if (selectedZone) router.push(`/hosted-zones/${selectedZone.id}`);
              }}
              className="px-3 py-1.5 text-xs font-medium text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              View records
            </button>

            <button
              disabled={!selectedZone}
              onClick={() => setIsEditOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#16191f] bg-white border border-[#545b64] rounded hover:bg-[#eaeded] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit details</span>
            </button>

            <button
              disabled={!selectedZone}
              onClick={() => setIsDeleteOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#d13212] bg-white border border-[#d13212]/40 rounded hover:bg-[#fdf3f2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Content Table / States */}
        <div className="bg-white rounded-b-lg border-x border-b border-[#eaeded] overflow-hidden shadow-xs">
          {isLoading ? (
            <LoadingState message="Loading hosted zones from SQLite..." rows={6} />
          ) : zones.length === 0 ? (
            search || typeFilter !== "ALL" ? (
              <EmptyState
                title="No hosted zones match your current filters"
                description={`No results found matching search "${search || typeFilter}".`}
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
                title="No hosted zones found"
                description="Get started by creating your first public or private hosted zone."
                actionLabel="Create hosted zone"
                actionType="create"
                onAction={() => setIsCreateOpen(true)}
              />
            )
          ) : (
            <>
              <DataTable
                columns={columns}
                data={zones}
                keyExtractor={(z) => z.id}
                selectedId={selectedZone?.id}
                onSelectRow={(z) => setSelectedZone(z)}
                onRowClick={(z) => setSelectedZone(z)}
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
              />
            </>
          )}
        </div>
      </div>

      {/* Modals & Dialogs */}
      <CreateZoneModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditZoneModal
        zone={selectedZone}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <DeleteZoneDialog
        zone={selectedZone}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={handleDeleteSuccess}
      />
    </ConsoleLayout>
  );
}
