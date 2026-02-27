"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart2, TrendingUp, SlidersHorizontal,
  ClipboardList, Clock, MapPin, Users, Trophy, ChevronDown, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Dashboard",  href: "#",       icon: LayoutDashboard,  disabled: true },
  { label: "Performance",  href: "#",       icon: TrendingUp,        disabled: true },
  { label: "Bays",       href: "#",       icon: SlidersHorizontal, disabled: true },
  { label: "Sessions",   href: "#",       icon: ClipboardList,     disabled: true },
  { label: "Leagues",    href: "/leagues", icon: Trophy },
  { label: "Site Hours", href: "#",       icon: Clock,             disabled: true },
];

const bottomNav = [
  { label: "Sites",    href: "#", icon: Building2, disabled: true },
  { label: "Managers", href: "#", icon: Users,    disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => href !== "#" && pathname.startsWith(href);

  return (
    <aside className="flex h-full w-60 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-gray-100 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black shrink-0">
          <Trophy className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight uppercase">Golf</span>
      </div>

      {/* Venue selector */}
      <div className="px-3 py-3 border-b border-gray-100 shrink-0">
        <button className="w-full flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left hover:bg-gray-50 transition-colors">
          <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="flex-1 text-sm font-medium text-gray-700 truncate">Test Range</span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {mainNav.map((item) => {
          const active = isActive(item.href);
          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-default select-none"
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-2 border-t border-gray-100 space-y-0.5 shrink-0">
        {bottomNav.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 cursor-default select-none"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
