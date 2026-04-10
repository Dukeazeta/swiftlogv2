"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Building2,
  History,
  LogOut,
  Menu,
  X,
  Calendar,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  profile: {
    fullName: string;
    schoolName: string;
    schoolDepartment: string;
    companyName: string;
    companyDepartment: string;
    jobRole: string;
    startDate: Date;
    endDate: Date;
  } | null;
  logs: {
    id: string;
    weekNumber: number;
    weekStart: Date;
    createdAt: Date;
  }[];
  needsOnboarding: boolean;
}

export function Sidebar({ user, profile, logs, needsOnboarding }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);
  const selectedWeek = searchParams.get("week");

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const firstName = (profile?.fullName || user.name || "User").split(" ")[0];

  if (needsOnboarding && pathname !== "/onboarding") {
    return null;
  }

  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <>
      {/* ═══ Mobile Toggle Button ═══ */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-white border border-subtle-border rounded-[10px] shadow-whisper"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* ═══ Mobile Full-Screen Sidebar ═══ */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-expo-black/20 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />

        {/* Panel */}
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-full max-w-[320px] bg-white flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-elevated",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Header */}
          <div className="shrink-0 px-5 pt-5 pb-4 border-b border-subtle-border">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-[15px] text-expo-black uppercase tracking-[0.04em]">
                Menu
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-cloud-gray transition-colors"
              >
                <X size={16} className="text-slate-gray" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 py-5">
            {/* Weekly Logs History */}
            <p className="text-[11px] font-bold text-silver uppercase tracking-[0.08em] mb-3 px-1">
              Weekly Logs History
            </p>

            <div className="space-y-1">
              {logs.length === 0 ? (
                <p className="text-[13px] text-silver px-3 py-6 text-center">
                  No logs generated yet
                </p>
              ) : (
                logs.map((log) => (
                  <Link
                    key={log.id}
                    href={`/dashboard?week=${log.weekNumber}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-[8px] text-[14px] transition-colors",
                      selectedWeek === String(log.weekNumber)
                        ? "bg-expo-black text-white"
                        : "text-near-black hover:bg-cloud-gray"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="font-medium">Week {log.weekNumber}</span>
                    <span className={cn(
                      "text-[12px]",
                      selectedWeek === String(log.weekNumber) ? "text-white/60" : "text-silver"
                    )}>
                      {new Date(log.weekStart).toLocaleDateString("en-NG", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Bottom — User + Logout */}
          <div className="shrink-0 px-4 py-4 border-t border-subtle-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image || undefined} alt={firstName} />
                  <AvatarFallback className="bg-cloud-gray text-expo-black text-[13px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[14px] font-semibold text-expo-black">{firstName}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-8 h-8 flex items-center justify-center rounded-[6px] text-silver hover:text-expo-black hover:bg-cloud-gray transition-colors"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ═══ Desktop Sidebar ═══ */}
      <aside className="hidden lg:flex fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-subtle-border flex-col shadow-whisper overflow-hidden transition-all">
        {/* Header */}
        <div className="p-6 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group transition-transform active:scale-95">
            <div className="w-10 h-10 bg-expo-black rounded-[12px] flex items-center justify-center shadow-whisper group-hover:shadow-elevated transition-all">
              <span className="text-white font-bold text-lg">◇</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-[16px] text-expo-black leading-tight">SwiftLogNG</span>
              <span className="text-[11px] text-silver font-bold uppercase tracking-widest mt-0.5">Dashboard</span>
            </div>
          </Link>
        </div>

        {/* Navigation / History */}
        <div className="flex-1 flex flex-col min-h-0 px-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 mb-6 rounded-[14px] bg-cloud-gray hover:bg-cloud-gray/80 text-near-black transition-all group active:scale-[0.98]"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-subtle-border flex items-center justify-center text-expo-black group-hover:scale-110 transition-transform shadow-whisper">
              <span className="text-xl font-light leading-none">+</span>
            </div>
            <span className="text-[14px] font-semibold">New Log Draft</span>
          </Link>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="text-[11px] font-bold text-silver uppercase tracking-[0.1em] px-4 mb-3">
              History
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-4">
                {logs.length === 0 ? (
                  <div className="px-4 py-8 text-center bg-cloud-gray/50 rounded-[14px] border border-dashed border-subtle-border">
                    <p className="text-[13px] text-silver">No logs yet</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <Link
                      key={log.id}
                      href={`/dashboard?week=${log.weekNumber}`}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-[12px] text-[14px] transition-all group",
                        selectedWeek === String(log.weekNumber)
                          ? "bg-expo-black text-white shadow-elevated"
                          : "text-slate-gray hover:bg-cloud-gray hover:text-expo-black"
                      )}
                    >
                      <span className="font-semibold">Week {log.weekNumber}</span>
                      <span className={cn(
                        "text-[11px] font-medium opacity-60",
                        selectedWeek === String(log.weekNumber) ? "text-white" : "text-silver"
                      )}>
                        {new Date(log.weekStart).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* User Footer */}
        <div className="shrink-0 p-4 border-t border-subtle-border mt-auto">
          <div className="flex items-center justify-between p-2 rounded-[16px] hover:bg-cloud-gray transition-all group cursor-default">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-subtle-border">
                <AvatarImage src={user.image || undefined} alt={firstName} />
                <AvatarFallback className="bg-expo-black text-white text-[12px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-bold text-expo-black truncate">{firstName}</span>
                <span className="text-[11px] text-silver truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-8 h-8 flex items-center justify-center rounded-full text-silver hover:text-expo-black hover:bg-white hover:shadow-whisper transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
