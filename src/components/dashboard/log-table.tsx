"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DailyLogEntry {
  day: string;
  date: string;
  content: string;
}

interface LogTableProps {
  entries: DailyLogEntry[];
}

const dayColors: Record<string, string> = {
  MONDAY: "bg-blue-100 text-blue-800 border-blue-200",
  TUESDAY: "bg-green-100 text-green-800 border-green-200",
  WEDNESDAY: "bg-purple-100 text-purple-800 border-purple-200",
  THURSDAY: "bg-orange-100 text-orange-800 border-orange-200",
  FRIDAY: "bg-pink-100 text-pink-800 border-pink-200",
};

export function LogTable({ entries }: LogTableProps) {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-32">
                Day
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-28">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                Activities
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {entries.map((entry) => (
              <tr key={entry.day} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 align-top">
                  <Badge
                    variant="outline"
                    className={cn("font-medium", dayColors[entry.day])}
                  >
                    {entry.day}
                  </Badge>
                </td>
                <td className="px-4 py-4 align-top text-sm text-gray-500">
                  {formatDate(entry.date)}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {entries.map((entry) => (
          <Card key={entry.day} className="overflow-hidden">
            <div
              className={cn(
                "px-4 py-2 border-b flex items-center justify-between",
                dayColors[entry.day]?.replace("text-", "bg-").split(" ")[0] || "bg-gray-100"
              )}
            >
              <Badge
                variant="outline"
                className={cn("font-medium", dayColors[entry.day])}
              >
                {entry.day}
              </Badge>
              <span className="text-xs text-gray-600">{formatDate(entry.date)}</span>
            </div>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
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
