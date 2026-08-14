"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/hosted-zones");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2f3f3]">
      <div className="flex items-center gap-2.5 p-6 bg-white rounded border border-[#eaeded] shadow-xs">
        <Loader2 className="w-5 h-5 animate-spin text-[#0972d3]" />
        <span className="text-xs font-semibold text-[#16191f]">
          Loading AWS Route 53 Console...
        </span>
      </div>
    </div>
  );
}
