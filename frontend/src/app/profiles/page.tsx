"use client";

import React from "react";
import Link from "next/link";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { Settings2, ArrowRight } from "lucide-react";

export default function ProfilesPage() {
  return (
    <ConsoleLayout breadcrumbs={[{ label: "Profiles" }]}>
      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg border border-[#eaeded] p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f4f1fb] flex items-center justify-center text-[#4d27aa]">
              <Settings2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#16191f]">Route 53 Profiles</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#eaeded] text-[#545b64] rounded uppercase">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-[#545b64] mt-0.5">
                Centralized DNS configurations across multiple VPCs and AWS accounts.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#eaeded] text-xs text-[#545b64] space-y-3">
            <p>
              Profiles allow you to define standard DNS configurations—including private hosted zones, Resolver rules, and DNS Firewall rule groups—and associate them with thousands of VPCs in AWS Organizations.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/hosted-zones"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0972d3] hover:bg-[#033d6b] rounded transition-colors"
            >
              <span>Back to Hosted Zones</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}
