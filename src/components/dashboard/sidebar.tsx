"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center bg-canvas border border-border-gray rounded-lg shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-near-black/20 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />

        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-full max-w-[320px] bg-canvas flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-elevated",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="shrink-0 px-5 pt-5 pb-4 border-b border-border-gray">
            <div className="flex items-center justify-between">
              <span className="font-display font-semibold text-[13px] text-near-black uppercase tracking-[1px]">
                Menu
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surface transition-colors"
              >
                <X size={16} className="text-mid-gray" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[1.5px] mb-3 px-1">
              Weekly Logs History
            </p>

            <div className="space-y-1">
              {logs.length === 0 ? (
                <p className="text-[13px] text-gray-300 px-3 py-6 text-center">
                  No logs generated yet
                </p>
              ) : (
                logs.map((log) => (
                  <Link
                    key={log.id}
                    href={`/dashboard?week=${log.weekNumber}`}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-md text-[14px] transition-colors",
                      selectedWeek === String(log.weekNumber)
                        ? "bg-webflow-blue text-white"
                        : "text-near-black hover:bg-surface"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="font-medium">Week {log.weekNumber}</span>
                    <span className={cn(
                      "text-[12px]",
                      selectedWeek === String(log.weekNumber) ? "text-white/60" : "text-gray-300"
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

          <div className="shrink-0 px-4 py-4 border-t border-border-gray">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image || undefined} alt={firstName} />
                  <AvatarFallback className="bg-webflow-blue text-white text-[13px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[14px] font-semibold text-near-black">{firstName}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-8 h-8 flex items-center justify-center rounded-md text-gray-300 hover:text-near-black hover:bg-surface transition-colors"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      <aside className="hidden lg:flex fixed lg:static inset-y-0 left-0 z-40 w-72 bg-canvas border-r border-border-gray flex-col shadow-sm overflow-hidden transition-all">
        <div className="p-6 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group transition-transform active:scale-95">
            <div className="w-10 h-10 bg-webflow-blue rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-card transition-all">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-[16px] text-near-black leading-tight">SwiftLogNG</span>
              <span className="text-[10px] text-gray-300 font-semibold uppercase tracking-[1.5px] mt-0.5">Dashboard</span>
            </div>
          </Link>
        </div>

        <div className="flex-1 flex flex-col min-h-0 px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 mb-6 rounded-lg bg-surface hover:bg-cloud-gray text-near-black transition-all group active:scale-[0.98] border border-border-gray"
          >
            <div className="w-8 h-8 rounded-md bg-canvas border border-border-gray flex items-center justify-center text-near-black group-hover:scale-110 transition-transform shadow-sm">
              <span className="text-xl font-light leading-none">+</span>
            </div>
            <span className="text-[14px] font-semibold">New Log Draft</span>
          </Link>

          <div className="flex-1 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-semibold text-gray-300 uppercase tracking-[1.5px] px-4 mb-3">
              History
            </h3>
            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-4">
                {logs.length === 0 ? (
                  <div className="px-4 py-8 text-center bg-surface rounded-lg border border-dashed border-border-gray">
                    <p className="text-[13px] text-gray-300">No logs yet</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <Link
                      key={log.id}
                      href={`/dashboard?week=${log.weekNumber}`}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-md text-[14px] transition-all group",
                        selectedWeek === String(log.weekNumber)
                          ? "bg-webflow-blue text-white shadow-sm"
                          : "text-mid-gray hover:bg-surface hover:text-near-black"
                      )}
                    >
                      <span className="font-semibold">Week {log.weekNumber}</span>
                      <span className={cn(
                        "text-[11px] font-medium opacity-60",
                        selectedWeek === String(log.weekNumber) ? "text-white" : "text-gray-300"
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

        <div className="shrink-0 p-4 border-t border-border-gray mt-auto">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface transition-all group cursor-default">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 border border-border-gray">
                <AvatarImage src={user.image || undefined} alt={firstName} />
                <AvatarFallback className="bg-webflow-blue text-white text-[12px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-near-black truncate">{firstName}</span>
                <span className="text-[11px] text-gray-300 truncate">{user.email}</span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-8 h-8 flex items-center justify-center rounded-md text-gray-300 hover:text-near-black hover:bg-canvas hover:shadow-sm transition-all"
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
