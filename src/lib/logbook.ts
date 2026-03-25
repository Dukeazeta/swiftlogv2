export const WORK_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

export type WorkDay = (typeof WORK_DAYS)[number];

export interface DailyLogEntry {
  day: WorkDay;
  date: string;
  content: string;
}

export interface WeeklyLogHistoryItem {
  id: string;
  weekNumber: number;
  weekStart: string;
  updatedAt: string;
}

export interface WeeklyLogDetail {
  id: string;
  weekNumber: number;
  summary: string;
  weekStart: string;
  weekEnd: string;
  entries: DailyLogEntry[];
  updatedAt: string;
}

const workDayOrder = new Map(WORK_DAYS.map((day, index) => [day, index]));

export function isWorkDay(day: string): day is WorkDay {
  return WORK_DAYS.includes(day as WorkDay);
}

export function sortEntriesByWorkDay<T extends { day: string }>(entries: T[]): T[] {
  return [...entries].sort((left, right) => {
    const leftOrder = workDayOrder.get(left.day as WorkDay) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = workDayOrder.get(right.day as WorkDay) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });
}

export function toIsoDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
