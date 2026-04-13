"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DailyLogEntry } from "@/lib/logbook";

interface LogTableProps {
  entries: DailyLogEntry[];
  editable?: boolean;
  onEntryChange?: (day: DailyLogEntry["day"], content: string) => void;
}

const dayColors: Record<string, string> = {
  MONDAY: "bg-webflow-blue/10 text-webflow-blue border-webflow-blue/20",
  TUESDAY: "bg-accent-green/10 text-accent-green border-accent-green/20",
  WEDNESDAY: "bg-accent-purple/10 text-accent-purple border-accent-purple/20",
  THURSDAY: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
  FRIDAY: "bg-accent-pink/10 text-accent-pink border-accent-pink/20",
};

export function LogTable({
  entries,
  editable = false,
  onEntryChange,
}: LogTableProps) {
  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-md border border-border-gray bg-canvas">
        <table className="w-full">
          <thead className="bg-surface border-b border-border-gray">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-[1.5px] w-32">
                Day
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-[1.5px] w-28">
                Date
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-[1.5px]">
                Activities
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-gray">
            {entries.map((entry) => (
              <tr key={entry.day} className="hover:bg-surface transition-colors">
                <td className="px-4 py-4 align-top">
                  <Badge
                    variant="outline"
                    className={cn("font-semibold text-[11px] uppercase tracking-[0.5px]", dayColors[entry.day])}
                  >
                    {entry.day}
                  </Badge>
                </td>
                <td className="px-4 py-4 align-top text-sm text-mid-gray">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-4">
                  {editable ? (
                    <Textarea
                      value={entry.content}
                      onChange={(event) =>
                        onEntryChange?.(entry.day, event.target.value)
                      }
                      rows={Math.max(6, entry.content.split("\n").length + 2)}
                      className="min-h-[180px] bg-surface text-sm leading-relaxed rounded-md border-border-gray focus-visible:ring-webflow-blue"
                    />
                  ) : (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {entry.content}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {entries.map((entry) => (
          <Card key={entry.day} className="overflow-hidden rounded-md border-border-gray">
            <div
              className={cn(
                "px-4 py-2.5 border-b border-border-gray flex items-center justify-between",
                dayColors[entry.day]?.split(" ")[0] || "bg-surface"
              )}
            >
              <Badge
                variant="outline"
                className={cn("font-semibold text-[11px] uppercase tracking-[0.5px]", dayColors[entry.day])}
              >
                {entry.day}
              </Badge>
              <span className="text-[12px] text-mid-gray">{formatDate(entry.date)}</span>
            </div>
            <CardContent className="pt-4">
              {editable ? (
                <Textarea
                  value={entry.content}
                  onChange={(event) =>
                    onEntryChange?.(entry.day, event.target.value)
                  }
                  rows={Math.max(6, entry.content.split("\n").length + 2)}
                  className="min-h-[180px] bg-surface text-sm leading-relaxed rounded-md border-border-gray focus-visible:ring-webflow-blue"
                />
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
