import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Route 53 Management Console | Amazon Web Services",
  description: "Scalable Domain Name System (DNS) web service and cloud DNS management console.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#f2f3f3] text-[#16191f] antialiased min-h-screen">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
