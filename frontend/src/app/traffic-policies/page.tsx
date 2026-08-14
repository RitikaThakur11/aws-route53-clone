"use client";

import React from "react";
import Link from "next/link";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { Layers, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function TrafficPoliciesPage() {
  return (
    <ConsoleLayout breadcrumbs={[{ label: "Traffic policies" }]}>
      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg border border-[#eaeded] p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f1faff] flex items-center justify-center text-[#0972d3]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#16191f]">Traffic policies</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#eaeded] text-[#545b64] rounded uppercase">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-[#545b64] mt-0.5">
                Visual DNS routing policy engine and versioned traffic flows.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#eaeded] text-xs text-[#545b64] space-y-3">
            <p>
              Traffic policies let you visually construct complex routing configurations using a combination of failover, geolocation, latency-based, weighted, and multiview rules across global endpoints.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#fafafa] rounded border border-[#eaeded]">
                <h3 className="font-semibold text-xs text-[#16191f] mb-1">Visual Policy Canvas</h3>
                <p className="text-[11px] text-[#545b64]">
                  Create branching trees of routing decisions that adapt in real time to network performance.
                </p>
              </div>
              <div className="p-3 bg-[#fafafa] rounded border border-[#eaeded]">
                <h3 className="font-semibold text-xs text-[#16191f] mb-1">Policy Versioning</h3>
                <p className="text-[11px] text-[#545b64]">
                  Safely test and stage traffic policies before applying them to production hosted zones.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/hosted-zones"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0972d3] hover:bg-[#033d6b] rounded transition-colors"
            >
              <span>Manage Hosted Zones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}
