import { createId } from "@paralleldrive/cuid2";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  accounts,
  dailyLogs,
  logVersions,
  sessions,
  studentProfiles,
  users,
  verificationTokens,
  weeklyLogs,
  type StudentProfile,
} from "@/lib/schema";
import {
  DailyLogEntry,
  sortEntriesByWorkDay,
  toIsoDateString,
  WeeklyLogDetail,
  WeeklyLogHistoryItem,
} from "@/lib/logbook";

export {
  accounts,
  sessions,
  users,
  verificationTokens,
  studentProfiles,
  weeklyLogs,
  dailyLogs,
  logVersions,
};

export async function getStudentProfileByUserId(userId: string) {
  return (
    (await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.userId, userId))
      .get()) ?? null
  );
}

export async function getUserById(userId: string) {
  return (await db.select().from(users).where(eq(users.id, userId)).get()) ?? null;
}

export async function getUserWithProfile(userId: string) {
  const [user, profile] = await Promise.all([
    getUserById(userId),
    getStudentProfileByUserId(userId),
  ]);

  if (!user) {
    return null;
  }

  return { ...user, profile };
}

export async function updateUserUsage(userId: string, usageCount: number, usageResetAt: Date) {
  return db
    .update(users)
    .set({
      usageCount,
      usageResetAt,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()
    .get();
}

export async function upsertStudentProfile(
  userId: string,
  data: {
    fullName: string;
    schoolName: string;
    schoolDepartment: string;
    companyName: string;
    companyDepartment: string;
    jobRole: string;
    startDate: Date;
    endDate: Date;
  }
) {
  const existingProfile = await getStudentProfileByUserId(userId);

  if (existingProfile) {
    return db
      .update(studentProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(studentProfiles.userId, userId))
      .returning()
      .get();
  }

  return db
    .insert(studentProfiles)
    .values({
      id: createId(),
      userId,
      ...data,
      isOnboarded: true,
    })
    .returning()
    .get();
}

export async function listWeeklyLogHistory(
  userId: string,
  limit?: number
): Promise<WeeklyLogHistoryItem[]> {
  const query = db
    .select({
      id: weeklyLogs.id,
      weekNumber: weeklyLogs.weekNumber,
      weekStart: weeklyLogs.weekStart,
      updatedAt: weeklyLogs.updatedAt,
    })
    .from(weeklyLogs)
    .where(eq(weeklyLogs.userId, userId))
    .orderBy(desc(weeklyLogs.weekNumber));

  const rows = limit ? await query.limit(limit).all() : await query.all();

  return rows.map((row) => ({
    id: row.id,
    weekNumber: row.weekNumber,
    weekStart: toIsoDateString(row.weekStart),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

function mapWeeklyLogDetail(
  log: {
    id: string;
    weekNumber: number;
    summary: string;
    weekStart: Date;
    weekEnd: Date;
    updatedAt: Date;
  },
  entries: Array<{ day: string; date: Date; content: string }>
): WeeklyLogDetail {
  return {
    id: log.id,
    weekNumber: log.weekNumber,
    summary: log.summary,
    weekStart: toIsoDateString(log.weekStart),
    weekEnd: toIsoDateString(log.weekEnd),
    updatedAt: log.updatedAt.toISOString(),
    entries: sortEntriesByWorkDay(
      entries.map((entry) => ({
        day: entry.day as DailyLogEntry["day"],
        date: toIsoDateString(entry.date),
        content: entry.content,
      }))
    ),
  };
}

export async function getWeeklyLogDetailByWeekNumber(
  userId: string,
  weekNumber: number
): Promise<WeeklyLogDetail | null> {
  const log =
    (await db
      .select()
      .from(weeklyLogs)
      .where(
        and(eq(weeklyLogs.userId, userId), eq(weeklyLogs.weekNumber, weekNumber))
      )
      .get()) ?? null;

  if (!log) {
    return null;
  }

  const entries = await db
    .select({
      day: dailyLogs.day,
      date: dailyLogs.date,
      content: dailyLogs.content,
    })
    .from(dailyLogs)
    .where(eq(dailyLogs.weeklyLogId, log.id))
    .orderBy(asc(dailyLogs.date))
    .all();

  return mapWeeklyLogDetail(log, entries);
}

export async function saveWeeklyLog({
  userId,
  weekNumber,
  weekStart,
  weekEnd,
  summary,
  entries,
}: {
  userId: string;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  summary: string;
  entries: DailyLogEntry[];
}): Promise<WeeklyLogDetail> {
  return db.transaction(async (tx) => {
    const now = new Date();
    const existingLog =
      (await tx
        .select()
        .from(weeklyLogs)
        .where(
          and(eq(weeklyLogs.userId, userId), eq(weeklyLogs.weekNumber, weekNumber))
        )
        .get()) ?? null;

    if (existingLog) {
      const existingEntries = await tx
        .select()
        .from(dailyLogs)
        .where(eq(dailyLogs.weeklyLogId, existingLog.id))
        .orderBy(asc(dailyLogs.date))
        .all();
      const versionRow = await tx
        .select({ value: count() })
        .from(logVersions)
        .where(eq(logVersions.weeklyLogId, existingLog.id))
        .get();

      await tx.insert(logVersions).values({
        id: createId(),
        weeklyLogId: existingLog.id,
        version: Number(versionRow?.value ?? 0) + 1,
        snapshot: {
          summary: existingLog.summary,
          entries: existingEntries.map((entry) => ({
            id: entry.id,
            weeklyLogId: entry.weeklyLogId,
            day: entry.day,
            date: toIsoDateString(entry.date),
            content: entry.content,
            createdAt: entry.createdAt.toISOString(),
            updatedAt: entry.updatedAt.toISOString(),
          })),
        },
        createdAt: now,
      });

      await tx.delete(dailyLogs).where(eq(dailyLogs.weeklyLogId, existingLog.id));
      await tx
        .update(weeklyLogs)
        .set({
          summary,
          updatedAt: now,
        })
        .where(eq(weeklyLogs.id, existingLog.id))
        .run();

      await tx.insert(dailyLogs).values(
        entries.map((entry) => ({
          id: createId(),
          weeklyLogId: existingLog.id,
          day: entry.day,
          date: new Date(entry.date),
          content: entry.content,
          createdAt: now,
          updatedAt: now,
        }))
      );

      const updatedLog =
        (await tx.select().from(weeklyLogs).where(eq(weeklyLogs.id, existingLog.id)).get()) ??
        existingLog;
      const updatedEntries = await tx
        .select({
          day: dailyLogs.day,
          date: dailyLogs.date,
          content: dailyLogs.content,
        })
        .from(dailyLogs)
        .where(eq(dailyLogs.weeklyLogId, existingLog.id))
        .orderBy(asc(dailyLogs.date))
        .all();

      return mapWeeklyLogDetail(updatedLog, updatedEntries);
    }

    const createdLog = await tx
      .insert(weeklyLogs)
      .values({
        id: createId(),
        userId,
        weekNumber,
        weekStart,
        weekEnd,
        summary,
        createdAt: now,
        updatedAt: now,
      })
      .returning()
      .get();

    if (!createdLog) {
      throw new Error("Failed to create weekly log");
    }

    await tx.insert(dailyLogs).values(
      entries.map((entry) => ({
        id: createId(),
        weeklyLogId: createdLog.id,
        day: entry.day,
        date: new Date(entry.date),
        content: entry.content,
        createdAt: now,
        updatedAt: now,
      }))
    );

    return mapWeeklyLogDetail(
      createdLog,
      entries.map((entry) => ({
        day: entry.day,
        date: new Date(entry.date),
        content: entry.content,
      }))
    );
  });
}

export async function getDashboardLayoutData(userId: string): Promise<{
  profile: StudentProfile | null;
  logs: Array<{
    id: string;
    weekNumber: number;
    weekStart: Date;
    createdAt: Date;
  }>;
}> {
  const [profile, logs] = await Promise.all([
    getStudentProfileByUserId(userId),
    db
      .select({
        id: weeklyLogs.id,
        weekNumber: weeklyLogs.weekNumber,
        weekStart: weeklyLogs.weekStart,
        createdAt: weeklyLogs.createdAt,
      })
      .from(weeklyLogs)
      .where(eq(weeklyLogs.userId, userId))
      .orderBy(desc(weeklyLogs.weekNumber))
      .limit(20)
      .all(),
  ]);

  return { profile, logs };
}
