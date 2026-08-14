"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { api } from "@/lib/api";
import { HostedZone } from "@/types/hosted-zone";
import {
  Globe,
  Plus,
  Shield,
  Activity,
  Layers,
  Network,
  ExternalLink,
  ArrowRight,
  Server,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [zones, setZones] = useState<HostedZone[]>([]);
  const [totalZones, setTotalZones] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.getHostedZones({ page_size: 5 });
        setZones(data.items);
        setTotalZones(data.total);
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <ConsoleLayout breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="space-y-6 max-w-6xl">
        {/* Header Hero Banner */}
        <div className="bg-white rounded-lg border border-[#eaeded] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-[#16191f] tracking-tight">
              Amazon Route 53 Console
            </h1>
            <p className="text-xs text-[#545b64] max-w-2xl">
              Amazon Route 53 is a highly available and scalable Domain Name System (DNS) web service. Use Route 53 to manage DNS routing, perform domain registration, configure health checking, and monitor network availability globally.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/hosted-zones"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#ec7211] hover:bg-[#eb5f07] rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create hosted zone</span>
            </Link>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-[#eaeded] p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#545b64]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Hosted Zones
              </span>
              <Globe className="w-4 h-4 text-[#0972d3]" />
            </div>
            <p className="text-2xl font-bold text-[#16191f] font-mono">
              {isLoading ? "..." : totalZones}
            </p>
            <Link
              href="/hosted-zones"
              className="text-[11px] text-[#0972d3] hover:underline flex items-center gap-1 font-medium pt-1"
            >
              <span>View hosted zones</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-[#eaeded] p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#545b64]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Health Checks
              </span>
              <Activity className="w-4 h-4 text-[#037f0c]" />
            </div>
            <p className="text-2xl font-bold text-[#16191f] font-mono">
              Active (0)
            </p>
            <Link
              href="/health-checks"
              className="text-[11px] text-[#0972d3] hover:underline flex items-center gap-1 font-medium pt-1"
            >
              <span>Configure health checks</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-[#eaeded] p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#545b64]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Global SLA Status
              </span>
              <Shield className="w-4 h-4 text-[#037f0c]" />
            </div>
            <p className="text-2xl font-bold text-[#037f0c] font-mono">
              100.00%
            </p>
            <p className="text-[11px] text-[#545b64] pt-1">
              Global Anycast edge servers active
            </p>
          </div>
        </div>

        {/* Recent Hosted Zones Table */}
        <div className="bg-white rounded-lg border border-[#eaeded] overflow-hidden shadow-xs">
          <div className="px-5 py-3 border-b border-[#eaeded] flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#16191f]">Recent hosted zones</h2>
            <Link
              href="/hosted-zones"
              className="text-xs text-[#0972d3] hover:underline font-semibold"
            >
              View all zones
            </Link>
          </div>

          <div className="divide-y divide-[#eaeded] text-xs">
            {zones.length === 0 ? (
              <div className="p-6 text-center text-[#545b64]">
                No hosted zones created yet. Click "Create hosted zone" above.
              </div>
            ) : (
              zones.map((z) => (
                <div
                  key={z.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-[#fafafa] transition-colors"
                >
                  <div className="space-y-0.5">
                    <Link
                      href={`/hosted-zones/${z.id}`}
                      className="font-mono font-semibold text-[#0972d3] hover:underline text-xs"
                    >
                      {z.name}
                    </Link>
                    <p className="text-[11px] text-[#545b64]">
                      {z.type} zone • {z.record_count} records
                    </p>
                  </div>
                  <Link
                    href={`/hosted-zones/${z.id}`}
                    className="px-3 py-1 text-xs border border-[#545b64] rounded text-[#16191f] hover:bg-[#eaeded]"
                  >
                    Manage records
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}
