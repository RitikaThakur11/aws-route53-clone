"use client";

import React from "react";
import Link from "next/link";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { Activity, ArrowRight, ShieldAlert, HeartPulse } from "lucide-react";

export default function HealthChecksPage() {
  return (
    <ConsoleLayout breadcrumbs={[{ label: "Health checks" }]}>
      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg border border-[#eaeded] p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ebf6ed] flex items-center justify-center text-[#037f0c]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#16191f]">Health checks</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#eaeded] text-[#545b64] rounded uppercase">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-[#545b64] mt-0.5">
                Automated uptime monitoring and DNS failover health verification.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#eaeded] text-xs text-[#545b64] space-y-3">
            <p>
              Amazon Route 53 health checks monitor the health and performance of your web applications, web servers, and other resources from locations around the world.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#fafafa] rounded border border-[#eaeded]">
                <h3 className="font-semibold text-xs text-[#16191f] mb-1">Endpoint Probing</h3>
                <p className="text-[11px] text-[#545b64]">
                  Regularly test HTTP, HTTPS, and TCP connections across multiple AWS edge regions.
                </p>
              </div>
              <div className="p-3 bg-[#fafafa] rounded border border-[#eaeded]">
                <h3 className="font-semibold text-xs text-[#16191f] mb-1">Automated Failover</h3>
                <p className="text-[11px] text-[#545b64]">
                  Automatically reroute traffic away from unhealthy endpoints to backup servers.
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
