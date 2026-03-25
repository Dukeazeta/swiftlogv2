import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DAY_IN_MS = 1000 * 60 * 60 * 24;

function startOfDay(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

export function getFirstWorkWeekStart(siwesStartDate: Date): Date {
  const startDate = startOfDay(siwesStartDate);
  const dayOfWeek = startDate.getDay();
  const daysToMonday =
    dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;

  startDate.setDate(startDate.getDate() + daysToMonday);
  return startDate;
}

/**
 * Calculate the week number within the SIWES period
 */
export function calculateWeekNumber(
  currentDate: Date,
  startDate: Date
): number {
  const firstWeekStart = getFirstWorkWeekStart(startDate);
  const selectedDate = startOfDay(currentDate);
  const diffDays = Math.floor(
    (selectedDate.getTime() - firstWeekStart.getTime()) / DAY_IN_MS
  );

  return diffDays < 0 ? 1 : Math.floor(diffDays / 7) + 1;
}

/**
 * Get the start (Monday) and end (Friday) dates for a given week number
 */
export function getWeekDates(
  weekNumber: number,
  siwesStartDate: Date
): { weekStart: Date; weekEnd: Date } {
  const weekStart = getFirstWorkWeekStart(siwesStartDate);
  weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4); // Friday

  return { weekStart, weekEnd };
}

/**
 * Get all dates for a work week (Monday to Friday)
 */
export function getWorkWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: "short" | "long" = "short"): string {
  if (format === "long") {
    return date.toLocaleDateString("en-NG", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Get day name from date
 */
export function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
}

/**
 * Check if user has exceeded monthly usage limit
 */
export function hasExceededUsageLimit(
  usageCount: number,
  usageResetAt: Date,
  limit: number = 4
): boolean {
  const now = new Date();
  const resetDate = new Date(usageResetAt);
  
  // If we're in a new month, reset count
  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    return false;
  }
  
  return usageCount >= limit;
}

/**
 * Calculate total weeks in SIWES duration
 */
export function calculateTotalWeeks(startDate: Date, endDate: Date): number {
  const firstWeekStart = getFirstWorkWeekStart(startDate);
  const finalDate = startOfDay(endDate);

  if (finalDate < firstWeekStart) {
    return 0;
  }

  const diffDays = Math.floor(
    (finalDate.getTime() - firstWeekStart.getTime()) / DAY_IN_MS
  );

  return Math.floor(diffDays / 7) + 1;
}

export function clampWeekNumber(
  weekNumber: number,
  startDate: Date,
  endDate: Date
): number | null {
  const totalWeeks = calculateTotalWeeks(startDate, endDate);

  if (totalWeeks < 1) {
    return null;
  }

  return Math.min(Math.max(weekNumber, 1), totalWeeks);
}
