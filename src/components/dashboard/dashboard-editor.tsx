"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  PencilLine,
  RefreshCw,
  Save,
  Send,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { LogTable } from "@/components/dashboard/log-table";
import {
  calculateTotalWeeks,
  calculateWeekNumber,
  clampWeekNumber,
  cn,
  getWeekDates,
} from "@/lib/utils";
import { DailyLogEntry, WeeklyLogDetail } from "@/lib/logbook";

interface ProfileData {
  fullName: string;
  schoolName: string;
  schoolDepartment: string;
  companyName: string;
  companyDepartment: string;
  jobRole: string;
  startDate: string;
  endDate: string;
}

interface DashboardEditorProps {
  profile: ProfileData;
}

type EditorStatus =
  | "empty"
  | "draft"
  | "saved"
  | "saving"
  | "generation-error";

const MIN_SUMMARY_LENGTH = 20;

const statusTheme: Record<EditorStatus, string> = {
  empty: "border-gray-200 bg-gray-50 text-gray-700",
  draft: "border-amber-200 bg-amber-50 text-amber-800",
  saved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  saving: "border-blue-200 bg-blue-50 text-blue-800",
  "generation-error": "border-red-200 bg-red-50 text-red-700",
};

function getStatusCopy(status: EditorStatus, selectedWeek: number | null): string {
  const weekLabel = selectedWeek ? `Week ${selectedWeek}` : "This week";

  switch (status) {
    case "draft":
      return `${weekLabel} has unsaved changes. Review the text and save when ready.`;
    case "saved":
      return `${weekLabel} is saved. You can still edit it and save a new version later.`;
    case "saving":
      return `Saving ${weekLabel.toLowerCase()} now. Please wait a moment.`;
    case "generation-error":
      return "The AI could not return a clean weekday draft. Please try again.";
    case "empty":
    default:
      return selectedWeek
        ? `${weekLabel} does not have a saved log yet. Write a short summary and generate a draft.`
        : "Choose a week to start writing your SIWES logbook.";
  }
}

export function DashboardEditor({ profile }: DashboardEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [summary, setSummary] = useState("");
  const [entries, setEntries] = useState<DailyLogEntry[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSavedWeek, setIsLoadingSavedWeek] = useState(false);
  const [status, setStatus] = useState<EditorStatus>("empty");
  const [error, setError] = useState<string | null>(null);

  const siwesStartDate = useMemo(() => new Date(profile.startDate), [profile.startDate]);
  const siwesEndDate = useMemo(() => new Date(profile.endDate), [profile.endDate]);
  const totalWeeks = useMemo(
    () => calculateTotalWeeks(siwesStartDate, siwesEndDate),
    [siwesEndDate, siwesStartDate]
  );
  const weekParam = searchParams.get("week");

  useEffect(() => {
    if (!weekParam) {
      setSelectedWeek(null);
      setSelectedDate(undefined);
      setSummary("");
      setEntries(null);
      setStatus("empty");
      setError(null);
      return;
    }

    const parsedWeek = Number(weekParam);

    if (!Number.isInteger(parsedWeek) || totalWeeks < 1) {
      return;
    }

    const clampedWeek = clampWeekNumber(parsedWeek, siwesStartDate, siwesEndDate);

    if (!clampedWeek) {
      return;
    }

    const { weekStart } = getWeekDates(clampedWeek, siwesStartDate);

    setSelectedWeek((currentWeek) =>
      currentWeek === clampedWeek ? currentWeek : clampedWeek
    );
    setSelectedDate((currentDate) =>
      currentDate?.getTime() === weekStart.getTime() ? currentDate : weekStart
    );
  }, [siwesEndDate, siwesStartDate, totalWeeks, weekParam]);

  useEffect(() => {
    if (!selectedWeek) {
      return;
    }

    let cancelled = false;

    async function loadSavedWeek() {
      setIsLoadingSavedWeek(true);
      setError(null);

      try {
        const response = await fetch(`/api/logs?weekNumber=${selectedWeek}`);

        if (cancelled) {
          return;
        }

        if (response.status === 404) {
          setSummary("");
          setEntries(null);
          setStatus("empty");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load this week");
        }

        const savedWeek: WeeklyLogDetail = await response.json();

        setSummary(savedWeek.summary);
        setEntries(savedWeek.entries);
        setStatus("saved");
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load this week"
        );
      } finally {
        if (!cancelled) {
          setIsLoadingSavedWeek(false);
        }
      }
    }

    loadSavedWeek();

    return () => {
      cancelled = true;
    };
  }, [selectedWeek]);

  const weekRange = useMemo(() => {
    if (!selectedWeek) {
      return null;
    }

    const { weekStart, weekEnd } = getWeekDates(selectedWeek, siwesStartDate);

    return {
      start: format(weekStart, "MMM d"),
      end: format(weekEnd, "MMM d, yyyy"),
    };
  }, [selectedWeek, siwesStartDate]);

  const isDateDisabled = (date: Date) => {
    return date < siwesStartDate || date > siwesEndDate;
  };

  const selectWeek = (weekNumber: number) => {
    const nextWeek = clampWeekNumber(weekNumber, siwesStartDate, siwesEndDate);

    if (!nextWeek) {
      return;
    }

    const { weekStart } = getWeekDates(nextWeek, siwesStartDate);

    setSelectedWeek(nextWeek);
    setSelectedDate(weekStart);
    setError(null);
    router.replace(`/dashboard?week=${nextWeek}`, { scroll: false });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    const weekNumber = calculateWeekNumber(date, siwesStartDate);
    selectWeek(weekNumber);
  };

  const handleSummaryChange = (nextSummary: string) => {
    setSummary(nextSummary);
    setError(null);

    if (entries && status === "saved") {
      setStatus("draft");
    }
  };

  const handleEntryChange = (day: DailyLogEntry["day"], content: string) => {
    setEntries((currentEntries) =>
      currentEntries?.map((entry) =>
        entry.day === day ? { ...entry, content } : entry
      ) ?? null
    );
    setError(null);
    setStatus((currentStatus) =>
      currentStatus === "saved" ? "draft" : currentStatus
    );
  };

  const handleGenerate = async () => {
    if (!selectedWeek || summary.trim().length < MIN_SUMMARY_LENGTH) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber: selectedWeek,
          summary: summary.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate logs");
      }

      const data: { entries: DailyLogEntry[] } = await response.json();
      setEntries(data.entries);
      setStatus("draft");
    } catch (generationError) {
      setStatus("generation-error");
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Something went wrong while generating logs"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!selectedWeek || !entries) {
      return;
    }

    setIsSaving(true);
    setStatus("saving");
    setError(null);

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber: selectedWeek,
          summary: summary.trim(),
          entries,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save logs");
      }

      const savedWeek: WeeklyLogDetail = await response.json();
      setSummary(savedWeek.summary);
      setEntries(savedWeek.entries);
      setStatus("saved");
    } catch (saveError) {
      setStatus(entries ? "draft" : "empty");
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save logs"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const isGenerateDisabled =
    !selectedWeek ||
    summary.trim().length < MIN_SUMMARY_LENGTH ||
    isGenerating ||
    isLoadingSavedWeek;
  const isSaveDisabled =
    !entries ||
    entries.some((entry) => !entry.content.trim()) ||
    isSaving ||
    isGenerating ||
    isLoadingSavedWeek;

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {profile.fullName.split(" ")[0]}
            </h1>
            <p className="text-gray-500">
              Turn your weekly summary into a clean SIWES logbook draft.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {selectedWeek && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                Week {selectedWeek}
                {weekRange && (
                  <span className="ml-2 text-muted-foreground">
                    ({weekRange.start} - {weekRange.end})
                  </span>
                )}
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn("px-3 py-1 text-sm capitalize", statusTheme[status])}
            >
              {status === "draft"
                ? "Draft"
                : status === "generation-error"
                ? "Generation error"
                : status}
            </Badge>
          </div>
        </div>

        <Card className={cn("border", statusTheme[status])}>
          <CardContent className="flex items-start gap-3 py-4">
            {status === "saved" ? (
              <CheckCircle2 size={20} className="mt-0.5" />
            ) : status === "saving" ? (
              <Loader2 size={20} className="mt-0.5 animate-spin" />
            ) : status === "draft" ? (
              <PencilLine size={20} className="mt-0.5" />
            ) : (
              <AlertCircle size={20} className="mt-0.5" />
            )}
            <p className="text-sm leading-6">{getStatusCopy(status, selectedWeek)}</p>
          </CardContent>
        </Card>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays size={20} />
                Select Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="rounded-md border"
              />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Pick any day inside your SIWES period to open that week.
              </p>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {totalWeeks > 0
                  ? `${totalWeeks} week${totalWeeks === 1 ? "" : "s"} available`
                  : "No valid SIWES weeks found yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe what you did this week in simple words. The AI will turn it into a proper Monday-to-Friday logbook draft."
                value={summary}
                onChange={(event) => handleSummaryChange(event.target.value)}
                rows={6}
                className="resize-none"
                disabled={!selectedWeek || isGenerating || isLoadingSavedWeek}
              />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  {summary.trim().length}/{MIN_SUMMARY_LENGTH} minimum characters to generate
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                    className="gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} />
                        {entries ? "Regenerate Draft" : "Generate Draft"}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Week
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoadingSavedWeek && (
          <Card>
            <CardContent className="py-8 space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-44 w-full" />
            </CardContent>
          </Card>
        )}

        {!isLoadingSavedWeek && !entries && selectedWeek && (
          <Card>
            <CardContent className="py-10 text-center">
              <Send className="mx-auto h-10 w-10 text-gray-300 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900">
                No saved log for Week {selectedWeek}
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                Write a short summary for this week, generate a draft, edit each
                day if needed, then save it.
              </p>
            </CardContent>
          </Card>
        )}

        {entries && !isLoadingSavedWeek && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Week Editor</h2>
              <p className="text-sm text-gray-500">
                Edit each day directly before you save or update this week.
              </p>
            </div>

            <LogTable
              entries={entries}
              editable
              onEntryChange={handleEntryChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
