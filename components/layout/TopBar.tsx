"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

function getPageTitle(pathname: string): string {
  if (pathname === "/leagues") return "Leagues";
  if (pathname === "/leagues/new") return "Create League";
  if (pathname.endsWith("/edit")) return "Edit League";
  if (pathname.endsWith("/seasons/new")) return "New Season";
  if (pathname.includes("/seasons/")) return "Season";
  if (pathname.startsWith("/leagues/")) return "League";
  return "Dashboard";
}

export function TopBar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shrink-0">
      {/* Left: mobile menu + page title */}
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden -ml-2 h-8 w-8">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
      </div>

      {/* Right: user */}
      <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700 uppercase shrink-0">
          J
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
          J. Bloggs
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>
    </header>
  );
}
