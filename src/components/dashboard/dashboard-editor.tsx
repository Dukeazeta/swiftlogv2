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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogTable } from "@/components/dashboard/log-table";
import {
  AI_PROVIDER_LABELS,
  type AiProviderId,
} from "@/lib/ai-providers";
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
  preferredAiProvider: AiProviderId | null;
}

interface DashboardEditorProps {
  profile: ProfileData;
  availableProviders: AiProviderId[];
}

type EditorStatus =
  | "empty"
  | "draft"
  | "saved"
  | "saving"
  | "generation-error";

const MIN_SUMMARY_LENGTH = 20;

const statusTheme: Record<EditorStatus, string> = {
  empty: "border-subtle-border bg-cloud-gray text-slate-gray",
  draft: "border-amber-200 bg-amber-50 text-amber-800",
  saved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  saving: "border-blue-200 bg-blue-50 text-blue-800",
  "generation-error": "border-red-200 bg-red-50 text-red-700",
};

interface GenerateErrorResponse {
  error?: string;
  code?: string;
  provider?: AiProviderId | null;
  availableProviders?: AiProviderId[];
}

function getInitialProvider(
  preferredAiProvider: AiProviderId | null,
  availableProviders: AiProviderId[]
): AiProviderId | null {
  if (
    preferredAiProvider &&
    availableProviders.includes(preferredAiProvider)
  ) {
    return preferredAiProvider;
  }

  return availableProviders[0] ?? null;
}

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

function buildGenerationErrorMessage(errorData: GenerateErrorResponse): string {
  const availableProviders = errorData.availableProviders ?? [];
  const availableLabels = availableProviders.map(
    (provider) => AI_PROVIDER_LABELS[provider]
  );

  if (errorData.code === "no_available_providers") {
    return "No AI provider is connected yet. Add an API key first.";
  }

  if (errorData.code === "provider_generation_failed" && errorData.provider) {
    const otherLabels = availableLabels.filter(
      (label) => label !== AI_PROVIDER_LABELS[errorData.provider!]
    );

    return otherLabels.length > 0
      ? `${AI_PROVIDER_LABELS[errorData.provider]} could not generate your draft right now. Try ${otherLabels.join(" or ")}.`
      : `${AI_PROVIDER_LABELS[errorData.provider]} could not generate your draft right now. Please try again soon.`;
  }

  if (errorData.code === "provider_not_configured" && availableLabels.length > 0) {
    return `That AI option is not available right now. Choose ${availableLabels.join(" or ")} instead.`;
  }

  return errorData.error || "Failed to generate logs";
}

export function DashboardEditor({
  profile,
  availableProviders,
}: DashboardEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [summary, setSummary] = useState("");
  const [entries, setEntries] = useState<DailyLogEntry[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingProvider, setIsSavingProvider] = useState(false);
  const [isLoadingSavedWeek, setIsLoadingSavedWeek] = useState(false);
  const [status, setStatus] = useState<EditorStatus>("empty");
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AiProviderId | null>(
    () => getInitialProvider(profile.preferredAiProvider, availableProviders)
  );

  const siwesStartDate = useMemo(() => new Date(profile.startDate), [profile.startDate]);
  const siwesEndDate = useMemo(() => new Date(profile.endDate), [profile.endDate]);
  const totalWeeks = useMemo(
    () => calculateTotalWeeks(siwesStartDate, siwesEndDate),
    [siwesEndDate, siwesStartDate]
  );
  const weekParam = searchParams.get("week");

  useEffect(() => {
    setSelectedProvider(
      getInitialProvider(profile.preferredAiProvider, availableProviders)
    );
  }, [availableProviders, profile.preferredAiProvider]);

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
    if (
      !selectedWeek ||
      !selectedProvider ||
      summary.trim().length < MIN_SUMMARY_LENGTH
    ) {
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
          provider: selectedProvider,
        }),
      });

      if (!response.ok) {
        const errorData: GenerateErrorResponse = await response.json();
        throw new Error(buildGenerationErrorMessage(errorData));
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

  const handleProviderChange = async (nextProvider: AiProviderId) => {
    const previousProvider = selectedProvider;

    setSelectedProvider(nextProvider);
    setError(null);
    setIsSavingProvider(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferredAiProvider: nextProvider,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save AI preference");
      }
    } catch (savePreferenceError) {
      setSelectedProvider(previousProvider);
      setError(
        savePreferenceError instanceof Error
          ? savePreferenceError.message
          : "Failed to save AI preference"
      );
    } finally {
      setIsSavingProvider(false);
    }
  };

  const isGenerateDisabled =
    !selectedWeek ||
    !selectedProvider ||
    summary.trim().length < MIN_SUMMARY_LENGTH ||
    isGenerating ||
    isLoadingSavedWeek;
  const isSaveDisabled =
    !entries ||
    entries.some((entry) => !entry.content.trim()) ||
    isSaving ||
    isGenerating ||
    isLoadingSavedWeek;
  const firstName = profile.fullName.split(" ")[0];
  const providerLabel = selectedProvider ? AI_PROVIDER_LABELS[selectedProvider] : "No AI";

  return (
    <div className="relative flex flex-col h-[100dvh] bg-cloud-gray overflow-hidden">
      {/* ── Scrollable Feed ── */}
      <div className="flex-1 overflow-y-auto pt-16 lg:pt-20 pb-24 lg:pb-32 h-full scroll-smooth">
        <div className="max-w-3xl mx-auto px-5 w-full h-full">
          {/* Empty State / Welcome */}
          {!entries && !isLoadingSavedWeek && (
            <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center animate-fade-up">
              <div className="w-12 h-12 bg-expo-black rounded-[14px] flex items-center justify-center mb-8 shadow-whisper">
                <span className="text-white font-bold text-xl">◇</span>
              </div>
              <h1 className="text-[clamp(2rem,8vw,3.5rem)] font-display font-bold text-expo-black tracking-tight leading-[1.05] max-w-[500px]">
                What are you working on this week, {firstName}?
              </h1>
              <p className="text-[15px] sm:text-[16px] text-slate-gray mt-4 max-w-[340px] leading-relaxed">
                {selectedWeek
                  ? `Entering details for Week ${selectedWeek}. AI will draft your daily logs instantly.`
                  : "Pick a week to get started or just type your summary below."}
              </p>
            </div>
          )}

          {/* Loading Skeleton */}
          {isLoadingSavedWeek && (
            <div className="space-y-6 py-12 max-w-2xl mx-auto">
              <Skeleton className="h-8 w-48 mx-auto rounded-full" />
              <Skeleton className="h-[300px] w-full rounded-[24px]" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-8 max-w-2xl mx-auto p-4 bg-red-50 border border-red-100 rounded-[16px] flex items-start gap-3 text-red-700 text-[14px] animate-fade-up shadow-whisper">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Generated Entries (The Chat "Thread") */}
          {entries && !isLoadingSavedWeek && (
            <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
              <div className="flex items-center justify-between border-b border-subtle-border pb-4">
                <div>
                  <h2 className="text-[18px] font-display font-bold text-expo-black">
                    Week {selectedWeek} Draft
                  </h2>
                  <p className="text-[13px] text-slate-gray mt-0.5 capitalize">
                    Generated with {providerLabel}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                    className="h-9 px-4 text-[13px] gap-2 rounded-[10px] bg-white border-subtle-border font-semibold shadow-whisper hover:bg-cloud-gray transition-all"
                  >
                    {isGenerating ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <RefreshCw size={15} />
                    )}
                    Redo
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                    className="h-9 px-4 text-[13px] gap-2 rounded-[10px] bg-expo-black font-semibold text-white shadow-elevated hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    Save
                  </Button>
                </div>
              </div>

              <div className="bg-white border border-subtle-border rounded-[24px] p-2 shadow-whisper overflow-hidden">
                <LogTable
                  entries={entries}
                  editable
                  onEntryChange={handleEntryChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Floating Chat Interaction Pill ── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 bg-gradient-to-t from-cloud-gray via-cloud-gray to-transparent pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className="relative rounded-[32px] border border-subtle-border bg-white shadow-elevated p-1.5 transition-all focus-within:ring-2 focus-within:ring-expo-black/5">
            <div className="flex items-end gap-1 px-1">
              {/* Tool Button (+) */}
              <div className="pb-1.5">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-10 h-10 rounded-full flex items-center justify-center text-slate-gray hover:bg-cloud-gray hover:text-expo-black transition-colors" title="Select Week">
                      <span className="text-2xl font-light leading-none">+</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[400px] border-none shadow-elevated rounded-[24px] p-6">
                    <DialogHeader>
                      <DialogTitle className="font-display font-bold text-xl">Jump to Week</DialogTitle>
                      <p className="text-sm text-slate-gray">
                        Select a date within your SIWES period.
                      </p>
                    </DialogHeader>
                    <div className="py-6 flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          handleDateSelect(date);
                          // Close dialog would happen automatically if it were a popover, 
                          // but for simplicity we'll just allow multiple picks
                        }}
                        disabled={isDateDisabled}
                        className="rounded-[16px] border border-subtle-border"
                      />
                    </div>
                    <div className="text-center text-xs text-silver">
                      {totalWeeks} weeks available in your period
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Input Area */}
              <div className="flex-1 min-w-0">
                <Textarea
                  placeholder="What are we working on this week?"
                  value={summary}
                  onChange={(event) => handleSummaryChange(event.target.value)}
                  rows={1}
                  className="w-full min-h-[44px] max-h-[200px] resize-none border-none bg-transparent text-[16px] px-3 py-3 focus-visible:ring-0 placeholder:text-silver/50"
                  disabled={isGenerating || isLoadingSavedWeek}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </div>

              {/* Action Button */}
              <div className="pb-1.5 pr-1.5">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerateDisabled}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                    isGenerateDisabled
                      ? "bg-cloud-gray/50 text-silver cursor-not-allowed"
                      : "bg-expo-black text-white shadow-elevated hover:scale-105 active:scale-95"
                  )}
                  aria-label="Generate Draft"
                >
                  {isGenerating ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* AI Provider Switcher Pill */}
            <div className="absolute -top-10 left-4 flex items-center gap-2">
              <div className="bg-white border border-subtle-border rounded-full px-3 py-1.5 shadow-whisper flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-link-cobalt animate-pulse" />
                <select
                  value={selectedProvider ?? ""}
                  onChange={(e) => handleProviderChange(e.target.value as AiProviderId)}
                  className="bg-transparent text-[11px] font-bold text-slate-gray uppercase tracking-wider outline-none cursor-pointer"
                >
                  {availableProviders.map((p) => (
                    <option key={p} value={p}>
                      {AI_PROVIDER_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
              
              {summary.trim().length > 0 && summary.trim().length < MIN_SUMMARY_LENGTH && (
                <div className="bg-white border border-subtle-border rounded-full px-3 py-1.5 shadow-whisper text-[10px] font-bold text-silver">
                  {summary.trim().length}/{MIN_SUMMARY_LENGTH}
                </div>
              )}
            </div>
          </div>
          
          <p className="text-[10px] text-silver text-center mt-3 font-medium uppercase tracking-[0.15em] opacity-80">
            AI can make mistakes. Verify your logbook entries.
          </p>
        </div>
      </div>
    </div>
  );
}


