import "dotenv/config";
import { Client as PgClient } from "pg";
import { createClient as createTursoClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import {
  accounts,
  dailyLogs,
  logVersions,
  schema,
  sessions,
  studentProfiles,
  users,
  verificationTokens,
  weeklyLogs,
} from "../src/lib/schema";

const sourceUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL ?? "";
const targetUrl = process.env.TURSO_DATABASE_URL ?? "";

if (!sourceUrl) {
  throw new Error("NEON_DATABASE_URL or DATABASE_URL is required.");
}

if (!targetUrl) {
  throw new Error("TURSO_DATABASE_URL is required.");
}

const allowClear = process.argv.includes("--force-clear");

type TableCheck = { name: string; count: number };

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  email_verified: Date | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
  usage_count: number;
  usage_reset_at: Date;
};

type AccountRow = {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};

type SessionRow = {
  id: string;
  session_token: string;
  user_id: string;
  expires: Date;
};

type VerificationTokenRow = {
  identifier: string;
  token: string;
  expires: Date;
};

type StudentProfileRow = {
  id: string;
  user_id: string;
  full_name: string;
  school_name: string;
  school_department: string;
  company_name: string;
  company_department: string;
  job_role: string;
  start_date: Date;
  end_date: Date;
  is_onboarded: boolean;
  created_at: Date;
  updated_at: Date;
};

type WeeklyLogRow = {
  id: string;
  user_id: string;
  week_number: number;
  week_start: Date;
  week_end: Date;
  summary: string;
  created_at: Date;
  updated_at: Date;
};

type DailyLogRow = {
  id: string;
  weekly_log_id: string;
  day: string;
  date: Date;
  content: string;
  created_at: Date;
  updated_at: Date;
};

type LogVersionRow = {
  id: string;
  weekly_log_id: string;
  version: number;
  snapshot: unknown;
  created_at: Date;
};

async function main() {
  const pg = new PgClient({ connectionString: sourceUrl });
  await pg.connect();

  const tursoClient = createTursoClient({
    url: targetUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const tursoDb = drizzle(tursoClient, { schema });

  const existingUsers = await tursoDb.select().from(users).limit(1).all();

  if (existingUsers.length > 0 && !allowClear) {
    throw new Error(
      "Target Turso database is not empty. Rerun with --force-clear if you really want to overwrite it."
    );
  }

  if (allowClear) {
    await tursoDb.delete(dailyLogs);
    await tursoDb.delete(logVersions);
    await tursoDb.delete(weeklyLogs);
    await tursoDb.delete(studentProfiles);
    await tursoDb.delete(accounts);
    await tursoDb.delete(sessions);
    await tursoDb.delete(verificationTokens);
    await tursoDb.delete(users);
  }

  const usersResult = await pg.query('select * from "users" order by created_at asc');
  const accountsResult = await pg.query('select * from "accounts"');
  const sessionsResult = await pg.query('select * from "sessions"');
  const verificationTokensResult = await pg.query(
    'select * from "verification_tokens"'
  );
  const profilesResult = await pg.query('select * from "student_profiles"');
  const weeklyLogsResult = await pg.query(
    'select * from "weekly_logs" order by created_at asc'
  );
  const dailyLogsResult = await pg.query(
    'select * from "daily_logs" order by created_at asc'
  );
  const logVersionsResult = await pg.query(
    'select * from "log_versions" order by created_at asc'
  );

  const userRows = usersResult.rows as UserRow[];
  const accountRows = accountsResult.rows as AccountRow[];
  const sessionRows = sessionsResult.rows as SessionRow[];
  const verificationTokenRows =
    verificationTokensResult.rows as VerificationTokenRow[];
  const profileRows = profilesResult.rows as StudentProfileRow[];
  const weeklyLogRows = weeklyLogsResult.rows as WeeklyLogRow[];
  const dailyLogRows = dailyLogsResult.rows as DailyLogRow[];
  const logVersionRows = logVersionsResult.rows as LogVersionRow[];

  if (userRows.length > 0) {
    await tursoDb.insert(users).values(
      userRows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.email_verified,
        image: row.image,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        usageCount: row.usage_count,
        usageResetAt: row.usage_reset_at,
      }))
    );
  }

  if (accountRows.length > 0) {
    await tursoDb.insert(accounts).values(
      accountRows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        provider: row.provider,
        providerAccountId: row.provider_account_id,
        refresh_token: row.refresh_token,
        access_token: row.access_token,
        expires_at: row.expires_at,
        token_type: row.token_type,
        scope: row.scope,
        id_token: row.id_token,
        session_state: row.session_state,
      }))
    );
  }

  if (sessionRows.length > 0) {
    await tursoDb.insert(sessions).values(
      sessionRows.map((row) => ({
        id: row.id,
        sessionToken: row.session_token,
        userId: row.user_id,
        expires: row.expires,
      }))
    );
  }

  if (verificationTokenRows.length > 0) {
    await tursoDb.insert(verificationTokens).values(
      verificationTokenRows.map((row) => ({
        identifier: row.identifier,
        token: row.token,
        expires: row.expires,
      }))
    );
  }

  if (profileRows.length > 0) {
    await tursoDb.insert(studentProfiles).values(
      profileRows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        fullName: row.full_name,
        schoolName: row.school_name,
        schoolDepartment: row.school_department,
        companyName: row.company_name,
        companyDepartment: row.company_department,
        jobRole: row.job_role,
        startDate: row.start_date,
        endDate: row.end_date,
        isOnboarded: row.is_onboarded,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    );
  }

  if (weeklyLogRows.length > 0) {
    await tursoDb.insert(weeklyLogs).values(
      weeklyLogRows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        weekNumber: row.week_number,
        weekStart: row.week_start,
        weekEnd: row.week_end,
        summary: row.summary,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    );
  }

  if (dailyLogRows.length > 0) {
    await tursoDb.insert(dailyLogs).values(
      dailyLogRows.map((row) => ({
        id: row.id,
        weeklyLogId: row.weekly_log_id,
        day: row.day,
        date: row.date,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    );
  }

  if (logVersionRows.length > 0) {
    await tursoDb.insert(logVersions).values(
      logVersionRows.map((row) => ({
        id: row.id,
        weeklyLogId: row.weekly_log_id,
        version: row.version,
        snapshot:
          typeof row.snapshot === "string" ? JSON.parse(row.snapshot) : row.snapshot,
        createdAt: row.created_at,
      }))
    );
  }

  const sourceCounts: TableCheck[] = [
    { name: "users", count: userRows.length },
    { name: "accounts", count: accountRows.length },
    { name: "sessions", count: sessionRows.length },
    {
      name: "verification_tokens",
      count: verificationTokenRows.length,
    },
    { name: "student_profiles", count: profileRows.length },
    { name: "weekly_logs", count: weeklyLogRows.length },
    { name: "daily_logs", count: dailyLogRows.length },
    { name: "log_versions", count: logVersionRows.length },
  ];

  const targetCounts: TableCheck[] = [
    { name: "users", count: (await tursoDb.select().from(users).all()).length },
    { name: "accounts", count: (await tursoDb.select().from(accounts).all()).length },
    { name: "sessions", count: (await tursoDb.select().from(sessions).all()).length },
    {
      name: "verification_tokens",
      count: (await tursoDb.select().from(verificationTokens).all()).length,
    },
    {
      name: "student_profiles",
      count: (await tursoDb.select().from(studentProfiles).all()).length,
    },
    {
      name: "weekly_logs",
      count: (await tursoDb.select().from(weeklyLogs).all()).length,
    },
    {
      name: "daily_logs",
      count: (await tursoDb.select().from(dailyLogs).all()).length,
    },
    {
      name: "log_versions",
      count: (await tursoDb.select().from(logVersions).all()).length,
    },
  ];

  console.table(
    sourceCounts.map((sourceRow) => ({
      table: sourceRow.name,
      source: sourceRow.count,
      target:
        targetCounts.find((targetRow) => targetRow.name === sourceRow.name)?.count ?? 0,
    }))
  );

  await pg.end();
  await tursoClient.close();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
