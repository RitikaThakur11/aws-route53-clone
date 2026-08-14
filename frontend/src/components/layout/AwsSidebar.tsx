"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  LayoutDashboard,
  Layers,
  Activity,
  Network,
  Settings2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isComingSoon?: boolean;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Route 53",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Hosted zones", href: "/hosted-zones", icon: Globe },
    ],
  },
  {
    title: "Traffic Management",
    items: [
      { name: "Traffic policies", href: "/traffic-policies", icon: Layers, isComingSoon: true },
      { name: "Health checks", href: "/health-checks", icon: Activity, isComingSoon: true },
    ],
  },
  {
    title: "DNS Firewall & VPC",
    items: [
      { name: "Resolver", href: "/resolver", icon: Network, isComingSoon: true },
      { name: "Profiles", href: "/profiles", icon: Settings2, isComingSoon: true },
    ],
  },
];

interface AwsSidebarProps {
  isOpen?: boolean;
}

export function AwsSidebar({ isOpen = true }: AwsSidebarProps) {
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-[#eaeded] min-h-[calc(100vh-3rem)] flex flex-col justify-between select-none">
      <div className="py-3">
        {/* Route 53 Title Header */}
        <div className="px-5 pb-3 border-b border-[#eaeded]">
          <h1 className="text-xs font-bold uppercase tracking-wider text-[#545b64]">
            Route 53 Console
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="mt-2 space-y-4">
          {navSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <h2 className="px-5 text-[11px] font-bold text-[#879596] uppercase tracking-wider">
                {sec.title}
              </h2>
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/hosted-zones"
                      ? pathname.startsWith("/hosted-zones")
                      : pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center justify-between px-5 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? "text-[#0972d3] bg-[#f1faff] border-l-4 border-[#0972d3] font-semibold"
                          : "text-[#16191f] hover:bg-[#f2f3f3] hover:text-[#0972d3] border-l-4 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? "text-[#0972d3]" : "text-[#545b64] group-hover:text-[#0972d3]"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.isComingSoon && (
                        <span className="px-1.5 py-0.2 text-[9px] font-semibold text-[#545b64] bg-[#eaeded] rounded">
                          Preview
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-[#eaeded] bg-[#fafafa] text-[11px] text-[#545b64] space-y-1">
        <div className="flex items-center justify-between">
          <span>Global Anycast SLA</span>
          <span className="text-[#037f0c] font-semibold">100% SLA</span>
        </div>
        <p className="text-[10px] text-[#879596]">Amazon Route 53 Console v1.0</p>
      </div>
    </aside>
  );
}
