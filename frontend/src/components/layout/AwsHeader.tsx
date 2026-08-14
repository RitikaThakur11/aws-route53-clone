"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Globe,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Menu,
} from "lucide-react";

interface AwsHeaderProps {
  onToggleSidebar?: () => void;
}

export function AwsHeader({ onToggleSidebar }: AwsHeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#232f3e] text-white border-b border-[#161e2e] h-12 flex items-center justify-between px-3 select-none">
      {/* Left: AWS Logo & Service Launcher */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 text-gray-300 hover:text-white hover:bg-[#161e2e] rounded transition-colors"
            aria-label="Toggle navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* AWS Brand / Service Title */}
        <Link href="/hosted-zones" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-7 h-7 bg-[#ec7211] rounded text-white font-black text-xs tracking-tighter">
            AWS
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-[#ec7211] transition-colors">
              Route 53
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Console</span>
          </div>
        </Link>

        {/* Services Dropdown Mockup */}
        <div className="hidden md:flex items-center gap-1 ml-4 px-2.5 py-1 text-xs text-gray-300 hover:text-white hover:bg-[#161e2e] rounded cursor-pointer transition-colors">
          <Layers className="w-3.5 h-3.5 text-[#ec7211]" />
          <span>Services</span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden lg:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search for services, features, docs (e.g. Route53, Hosted Zone)"
            className="w-full pl-8 pr-4 py-1 text-xs bg-[#161e2e] text-white placeholder-gray-400 border border-gray-700 rounded focus:outline-none focus:border-[#ec7211] transition-colors"
          />
          <div className="absolute right-2 top-1.5 px-1.5 py-0.2 text-[10px] font-mono text-gray-400 bg-gray-800 rounded border border-gray-700">
            [Alt+S]
          </div>
        </div>
      </div>

      {/* Right: Region, Notifications, Account */}
      <div className="flex items-center gap-2">
        {/* Global DNS Region Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-gray-300 hover:text-white bg-[#161e2e] border border-gray-700 rounded cursor-default">
          <Globe className="w-3.5 h-3.5 text-[#ec7211]" />
          <span className="font-medium">Global</span>
          <span className="text-[10px] text-gray-400">(DNS)</span>
        </div>

        {/* Notifications Icon */}
        <button
          className="p-1.5 text-gray-300 hover:text-white hover:bg-[#161e2e] rounded transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#ec7211] rounded-full" />
        </button>

        {/* User Account Menu */}
        {isAuthenticated && user ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1 text-xs text-gray-200 hover:text-white hover:bg-[#161e2e] rounded border border-transparent hover:border-gray-700 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-white text-[10px] font-bold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="font-semibold text-xs text-gray-100">{user.email}</span>
                <span className="text-[10px] text-gray-400 font-mono">{user.account_id}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white text-[#16191f] rounded shadow-xl border border-[#d5dbdb] py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-[#eaeded]">
                  <div className="flex items-center gap-1.5 text-xs text-[#545b64]">
                    <Shield className="w-3.5 h-3.5 text-[#037f0c]" />
                    <span>AWS Account (Mock IAM)</span>
                  </div>
                  <p className="font-semibold text-xs text-[#16191f] mt-1 truncate">{user.email}</p>
                  <p className="text-[11px] font-mono text-[#545b64] mt-0.5">Account ID: {user.account_id}</p>
                </div>

                <div className="py-1 text-xs">
                  <div className="px-4 py-1.5 text-[#545b64] flex items-center justify-between">
                    <span>Role</span>
                    <span className="font-mono text-[#16191f]">AdministratorAccess</span>
                  </div>
                  <div className="px-4 py-1.5 text-[#545b64] flex items-center justify-between">
                    <span>Region</span>
                    <span className="font-mono text-[#16191f]">Global (Route 53)</span>
                  </div>
                </div>

                <div className="border-t border-[#eaeded] pt-1 mt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-[#d13212] hover:bg-[#fdf3f2] flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out of AWS Console</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="px-3 py-1 text-xs font-semibold text-white bg-[#ec7211] hover:bg-[#eb5f07] rounded transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
