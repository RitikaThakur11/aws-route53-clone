"use client";

import React, { useState } from "react";
import { AwsHeader } from "./AwsHeader";
import { AwsSidebar } from "./AwsSidebar";
import { Breadcrumbs, BreadcrumbItem } from "./Breadcrumbs";
import { AuthGuard } from "./AuthGuard";

interface ConsoleLayoutProps {
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function ConsoleLayout({ breadcrumbs = [], children }: ConsoleLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-[#f2f3f3]">
        <AwsHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 relative overflow-x-hidden">
          <AwsSidebar isOpen={sidebarOpen} />
          <main className="flex-1 flex flex-col min-w-0">
            {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
            <div className="p-6 flex-1">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
