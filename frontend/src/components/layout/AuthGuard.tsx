"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f2f3f3]">
        <div className="flex items-center gap-3 p-6 bg-white rounded-lg border border-[#eaeded] shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-[#0972d3]" />
          <span className="text-xs font-semibold text-[#16191f]">
            Authenticating AWS Route 53 Console session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
