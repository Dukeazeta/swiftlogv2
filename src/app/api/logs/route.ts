import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const saveLogSchema = z.object({
  weekNumber: z.number().min(1),
  summary: z.string().min(1),
  entries: z.array(
    z.object({
      day: z.string(),
      date: z.string(),
      content: z.string(),
    })
  ),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db.weeklyLog.findMany({
      where: { userId: session.user.id },
      include: {
        entries: {
          orderBy: { day: "asc" },
        },
      },
      orderBy: { weekNumber: "desc" },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
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

    // Calculate week dates
    const startDate = new Date(profile.startDate);
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);
    
    // Adjust to Monday
    const dayOfWeek = weekStart.getDay();
    const daysToMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    weekStart.setDate(weekStart.getDate() + daysToMonday);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 4);

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
        include: { entries: true },
      });

      return NextResponse.json(updatedLog);
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
      include: { entries: true },
    });

    return NextResponse.json(newLog, { status: 201 });
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
