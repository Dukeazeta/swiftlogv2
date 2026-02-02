"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addWeeks, differenceInWeeks, isWithinInterval, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LogTable } from "@/components/dashboard/log-table";
import { 
  CalendarDays, 
  Send, 
  RefreshCw, 
  Save,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyLogEntry {
  day: string;
  date: string;
  content: string;
}

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

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [summary, setSummary] = useState("");
  const [generatedLogs, setGeneratedLogs] = useState<DailyLogEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setProfileLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Calculate week number when date is selected
  useEffect(() => {
    if (selectedDate && profile) {
      const startDate = new Date(profile.startDate);
      const weekNum = differenceInWeeks(selectedDate, startDate) + 1;
      setSelectedWeek(weekNum > 0 ? weekNum : 1);
    }
  }, [selectedDate, profile]);

  const handleGenerate = async () => {
    if (!summary.trim() || !selectedWeek || !profile) return;

    setIsLoading(true);
    setError(null);
    setGeneratedLogs(null);

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

      const data = await response.json();
      setGeneratedLogs(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedLogs || !selectedWeek) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekNumber: selectedWeek,
          summary,
          entries: generatedLogs,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save logs");
      }

      // Show success - could add a toast here
      alert("Logs saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = () => {
    setGeneratedLogs(null);
    handleGenerate();
  };

  // Get week date range for display
  const getWeekRange = () => {
    if (!selectedDate) return null;
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = addDays(weekStart, 4);
    return {
      start: format(weekStart, "MMM d"),
      end: format(weekEnd, "MMM d, yyyy"),
    };
  };

  // Disable dates outside SIWES period
  const isDateDisabled = (date: Date) => {
    if (!profile) return true;
    const start = new Date(profile.startDate);
    const end = new Date(profile.endDate);
    return !isWithinInterval(date, { start, end });
  };

  if (profileLoading) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Complete Your Profile</h2>
            <p className="text-muted-foreground mb-4">
              Please complete your profile to start generating logs.
            </p>
            <Button asChild>
              <a href="/onboarding">Complete Profile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const weekRange = getWeekRange();

  return (
    <div className="p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {profile.fullName.split(" ")[0]}
            </h1>
            <p className="text-gray-500">Generate your weekly logbook entries</p>
          </div>
          {selectedWeek && (
            <Badge variant="outline" className="text-sm px-3 py-1 self-start">
              Week {selectedWeek}
              {weekRange && (
                <span className="ml-2 text-muted-foreground">
                  ({weekRange.start} - {weekRange.end})
                </span>
              )}
            </Badge>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Picker */}
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
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className="rounded-md border"
              />
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Select any day to fill that week&apos;s log
              </p>
            </CardContent>
          </Card>

          {/* Chat Box */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe what you did this week... (e.g., 'This week I worked on the user authentication module, attended a training session on React, and helped debug the payment integration.')"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={6}
                className="resize-none"
                disabled={!selectedWeek || isLoading}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {summary.length}/2000 characters
                </p>
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedWeek || summary.length < 20 || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Generate Logs
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 size={32} className="animate-spin text-gray-400" />
                <p className="text-gray-500">Generating your daily logs...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generated Logs */}
        {generatedLogs && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Generated Logs</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={isLoading || isSaving}
                  className="gap-2"
                >
                  <RefreshCw size={16} />
                  Regenerate
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
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
                      Save Logs
                    </>
                  )}
                </Button>
              </div>
            </div>

            <LogTable entries={generatedLogs} />
          </div>
        )}
      </div>
    </div>
  );
}
