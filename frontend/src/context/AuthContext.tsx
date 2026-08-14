"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, AuthContextType } from "@/types/auth";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load session from localStorage on initial render
  useEffect(() => {
    async function loadSession() {
      const storedToken = localStorage.getItem("route53_token");
      const storedUser = localStorage.getItem("route53_user");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          // Verify with backend
          const me = await api.getCurrentUser().catch(() => null);
          if (me) {
            setUser(me);
            localStorage.setItem("route53_user", JSON.stringify(me));
          }
        } catch {
          // Token invalid or expired
          localStorage.removeItem("route53_token");
          localStorage.removeItem("route53_user");
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    loadSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const resp = await api.login(email, password);
      setToken(resp.access_token);
      setUser(resp.user);
      localStorage.setItem("route53_token", resp.access_token);
      localStorage.setItem("route53_user", JSON.stringify(resp.user));
      router.push("/hosted-zones");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      localStorage.removeItem("route53_token");
      localStorage.removeItem("route53_user");
      setToken(null);
      setUser(null);
      router.push("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
