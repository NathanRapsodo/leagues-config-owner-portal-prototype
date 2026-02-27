import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Toaster } from "@/components/ui/toaster";
import { SpaRedirectHandler } from "@/components/SpaRedirectHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Leagues Admin Portal",
  description: "Leagues Administration",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen overflow-hidden bg-gray-100">
          {/* Sidebar (desktop only) */}
          <div className="hidden lg:flex lg:flex-shrink-0">
            <Sidebar />
          </div>

          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
        <Toaster />
        <SpaRedirectHandler />
      </body>
    </html>
  );
}
