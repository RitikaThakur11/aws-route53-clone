"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-[#545b64] py-2.5 px-6 bg-white border-b border-[#eaeded] select-none">
      <Link href="/hosted-zones" className="hover:text-[#0972d3] transition-colors">
        Route 53
      </Link>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-[#879596] shrink-0" />
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-[#0972d3] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={`truncate max-w-xs ${isLast ? "font-semibold text-[#16191f]" : ""}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
