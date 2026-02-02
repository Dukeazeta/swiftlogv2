import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate the week number within the SIWES period
 */
export function calculateWeekNumber(
  currentDate: Date,
  startDate: Date
): number {
  const diffTime = currentDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 7) + 1;
}

/**
 * Get the start (Monday) and end (Friday) dates for a given week number
 */
export function getWeekDates(
  weekNumber: number,
  siwesStartDate: Date
): { weekStart: Date; weekEnd: Date } {
  const startDate = new Date(siwesStartDate);
  
  // Adjust to Monday of that week
  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  startDate.setDate(startDate.getDate() + daysToMonday);
  
  // Add weeks
  const weekStart = new Date(startDate);
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
  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}
