import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { WeeklyLogDetail, WeeklyLogHistoryItem } from "@/lib/logbook";
import {
  getStudentProfileByUserId,
  getWeeklyLogDetailByWeekNumber,
  listWeeklyLogHistory,
  saveWeeklyLog,
} from "@/lib/data";
import { saveLogSchema } from "@/lib/validations";
import { getWeekDates } from "@/lib/utils";

const weekNumberQuerySchema = z.coerce.number().int().min(1);

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
      const log = await getWeeklyLogDetailByWeekNumber(session.user.id, weekNumber);

      if (!log) {
        return NextResponse.json(
          { error: "Saved log not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(log);
    }

    const historyItems: WeeklyLogHistoryItem[] = await listWeeklyLogHistory(
      session.user.id
    );

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
    const profile = await getStudentProfileByUserId(session.user.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 400 }
      );
    }

    const { weekStart, weekEnd } = getWeekDates(weekNumber, profile.startDate);

    const newLog: WeeklyLogDetail = await saveWeeklyLog({
      userId: session.user.id,
      weekNumber,
      weekStart,
      weekEnd,
      summary,
      entries,
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
