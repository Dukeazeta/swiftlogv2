"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  User,
  Calendar,
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
  const [isOpen, setIsOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  if (needsOnboarding && pathname !== "/onboarding") {
    return null;
  }

  if (pathname === "/onboarding") {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-semibold text-lg">SwiftLogNG</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Profile Section */}
          <div className="mb-4">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile?.fullName || user.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <Separator className="my-3" />

          {profile && (
            <>
              {/* School Details */}
              <Collapsible open={schoolOpen} onOpenChange={setSchoolOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-gray-500" />
                    <span>School Details</span>
                  </div>
                  {schoolOpen ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pr-2 py-2 space-y-1">
                  <p className="text-xs text-gray-600">{profile.schoolName}</p>
                  <p className="text-xs text-gray-500">{profile.schoolDepartment}</p>
                </CollapsibleContent>
              </Collapsible>

              {/* Company Details */}
              <Collapsible open={companyOpen} onOpenChange={setCompanyOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 size={16} className="text-gray-500" />
                    <span>Company Details</span>
                  </div>
                  {companyOpen ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pr-2 py-2 space-y-1">
                  <p className="text-xs text-gray-600">{profile.companyName}</p>
                  <p className="text-xs text-gray-500">{profile.companyDepartment}</p>
                  <p className="text-xs text-gray-500 italic">{profile.jobRole}</p>
                </CollapsibleContent>
              </Collapsible>

              <Separator className="my-3" />

              {/* SIWES Duration */}
              <div className="p-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>SIWES Duration</span>
                </div>
                <div className="pl-6 text-xs text-gray-500">
                  <p>
                    {new Date(profile.startDate).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}{" "}
                    -{" "}
                    {new Date(profile.endDate).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Chat History */}
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-gray-500" />
                    <span>Log History</span>
                    {logs.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {logs.length}
                      </Badge>
                    )}
                  </div>
                  {historyOpen ? (
                    <ChevronDown size={16} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="py-2 space-y-1">
                  {logs.length === 0 ? (
                    <p className="text-xs text-gray-400 pl-6 py-2">
                      No logs generated yet
                    </p>
                  ) : (
                    logs.map((log) => (
                      <Link
                        key={log.id}
                        href={`/dashboard?week=${log.weekNumber}`}
                        className="flex items-center gap-2 pl-6 pr-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <span>Week {log.weekNumber}</span>
                        <span className="text-gray-400">
                          {new Date(log.weekStart).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </Link>
                    ))
                  )}
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </ScrollArea>

        {/* Logout Button */}
        <div className="p-3 border-t border-gray-200">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
