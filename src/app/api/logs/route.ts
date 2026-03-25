import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  DailyLogEntry,
  sortEntriesByWorkDay,
  toIsoDateString,
  WeeklyLogDetail,
  WeeklyLogHistoryItem,
} from "@/lib/logbook";
import { saveLogSchema } from "@/lib/validations";
import { getWeekDates } from "@/lib/utils";

const weekNumberQuerySchema = z.coerce.number().int().min(1);

function toWeeklyLogDetail(log: {
  id: string;
  weekNumber: number;
  summary: string;
  weekStart: Date;
  weekEnd: Date;
  updatedAt: Date;
  entries: { day: string; date: Date; content: string }[];
}): WeeklyLogDetail {
  const entries = sortEntriesByWorkDay(
    log.entries.map((entry) => ({
      day: entry.day as DailyLogEntry["day"],
      date: toIsoDateString(entry.date),
      content: entry.content,
    }))
  );

  return {
    id: log.id,
    weekNumber: log.weekNumber,
    summary: log.summary,
    weekStart: toIsoDateString(log.weekStart),
    weekEnd: toIsoDateString(log.weekEnd),
    updatedAt: log.updatedAt.toISOString(),
    entries,
  };
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekNumberParam = searchParams.get("weekNumber");

    if (weekNumberParam) {
      const weekNumber = weekNumberQuerySchema.parse(weekNumberParam);
      const log = await db.weeklyLog.findUnique({
        where: {
          userId_weekNumber: {
            userId: session.user.id,
            weekNumber,
          },
        },
        include: {
          entries: {
            orderBy: { date: "asc" },
          },
        },
      });

      if (!log) {
        return NextResponse.json(
          { error: "Saved log not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(toWeeklyLogDetail(log));
    }

    const logs = await db.weeklyLog.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        weekNumber: true,
        weekStart: true,
        updatedAt: true,
      },
      orderBy: { weekNumber: "desc" },
    });
    const historyItems: WeeklyLogHistoryItem[] = logs.map((log) => ({
      id: log.id,
      weekNumber: log.weekNumber,
      weekStart: toIsoDateString(log.weekStart),
      updatedAt: log.updatedAt.toISOString(),
    }));

    return NextResponse.json(historyItems);
  } catch (error) {
    console.error("Error fetching logs:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid week number provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { weekNumber, summary, entries } = saveLogSchema.parse(body);

    // Get user profile for week dates
    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 400 }
      );
    }

    const { weekStart, weekEnd } = getWeekDates(weekNumber, profile.startDate);

    // Check if log already exists
    const existingLog = await db.weeklyLog.findUnique({
      where: {
        userId_weekNumber: {
          userId: session.user.id,
          weekNumber,
        },
      },
      include: { entries: true },
    });

    if (existingLog) {
      // Get current version count
      const versionCount = await db.logVersion.count({
        where: { weeklyLogId: existingLog.id },
      });

      // Create version history before updating
      await db.logVersion.create({
        data: {
          weeklyLogId: existingLog.id,
          version: versionCount + 1,
          snapshot: {
            summary: existingLog.summary,
            entries: existingLog.entries,
          },
        },
      });

      // Delete old entries
      await db.dailyLog.deleteMany({
        where: { weeklyLogId: existingLog.id },
      });

      // Update the log
      const updatedLog = await db.weeklyLog.update({
        where: { id: existingLog.id },
        data: {
          summary,
          entries: {
            create: entries.map((entry) => ({
              day: entry.day,
              date: new Date(entry.date),
              content: entry.content,
            })),
          },
        },
        include: {
          entries: {
            orderBy: { date: "asc" },
          },
        },
      });

      return NextResponse.json(toWeeklyLogDetail(updatedLog));
    }

    // Create new log
    const newLog = await db.weeklyLog.create({
      data: {
        userId: session.user.id,
        weekNumber,
        weekStart,
        weekEnd,
        summary,
        entries: {
          create: entries.map((entry) => ({
            day: entry.day,
            date: new Date(entry.date),
            content: entry.content,
          })),
        },
      },
      include: {
        entries: {
          orderBy: { date: "asc" },
        },
      },
    });

    return NextResponse.json(toWeeklyLogDetail(newLog), { status: 201 });
  } catch (error) {
    console.error("Error saving logs:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
