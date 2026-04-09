import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { type AiProviderId } from "@/lib/ai-providers";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
    usageCount: integer("usage_count").notNull().default(0),
    usageResetAt: integer("usage_reset_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    emailIndex: uniqueIndex("users_email_unique").on(table.email),
  })
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    providerAccountIndex: uniqueIndex("accounts_provider_provider_account_id_unique").on(
      table.provider,
      table.providerAccountId
    ),
    userIdIndex: index("accounts_user_id_idx").on(table.userId),
  })
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").$defaultFn(createId).notNull().unique(),
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    idIndex: uniqueIndex("sessions_id_unique").on(table.id),
    userIdIndex: index("sessions_user_id_idx").on(table.userId),
  })
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.identifier, table.token],
    }),
  })
);

export const studentProfiles = sqliteTable(
  "student_profiles",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    schoolName: text("school_name").notNull(),
    schoolDepartment: text("school_department").notNull(),
    companyName: text("company_name").notNull(),
    companyDepartment: text("company_department").notNull(),
    jobRole: text("job_role").notNull(),
    preferredAiProvider: text("preferred_ai_provider").$type<AiProviderId | null>(),
    startDate: integer("start_date", { mode: "timestamp_ms" }).notNull(),
    endDate: integer("end_date", { mode: "timestamp_ms" }).notNull(),
    isOnboarded: integer("is_onboarded", { mode: "boolean" })
      .notNull()
      .default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdIndex: uniqueIndex("student_profiles_user_id_unique").on(table.userId),
  })
);

export const weeklyLogs = sqliteTable(
  "weekly_logs",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weekNumber: integer("week_number").notNull(),
    weekStart: integer("week_start", { mode: "timestamp_ms" }).notNull(),
    weekEnd: integer("week_end", { mode: "timestamp_ms" }).notNull(),
    summary: text("summary").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userWeekIndex: uniqueIndex("weekly_logs_user_id_week_number_unique").on(
      table.userId,
      table.weekNumber
    ),
    userIdIndex: index("weekly_logs_user_id_idx").on(table.userId),
  })
);

export const dailyLogs = sqliteTable(
  "daily_logs",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    weeklyLogId: text("weekly_log_id")
      .notNull()
      .references(() => weeklyLogs.id, { onDelete: "cascade" }),
    day: text("day").notNull(),
    date: integer("date", { mode: "timestamp_ms" }).notNull(),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    weeklyDayIndex: uniqueIndex("daily_logs_weekly_log_id_day_unique").on(
      table.weeklyLogId,
      table.day
    ),
    weeklyLogIdIndex: index("daily_logs_weekly_log_id_idx").on(table.weeklyLogId),
  })
);

export const logVersions = sqliteTable(
  "log_versions",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    weeklyLogId: text("weekly_log_id")
      .notNull()
      .references(() => weeklyLogs.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    snapshot: text("snapshot", { mode: "json" })
      .$type<{
        summary: string;
        entries: Array<{
          id?: string;
          weeklyLogId?: string;
          day: string;
          date: string | Date;
          content: string;
          createdAt?: string | Date;
          updatedAt?: string | Date;
        }>;
      }>()
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    weeklyLogIdIndex: index("log_versions_weekly_log_id_idx").on(table.weeklyLogId),
  })
);

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  logs: many(weeklyLogs),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const weeklyLogsRelations = relations(weeklyLogs, ({ one, many }) => ({
  user: one(users, {
    fields: [weeklyLogs.userId],
    references: [users.id],
  }),
  entries: many(dailyLogs),
  versions: many(logVersions),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  weeklyLog: one(weeklyLogs, {
    fields: [dailyLogs.weeklyLogId],
    references: [weeklyLogs.id],
  }),
}));

export const logVersionsRelations = relations(logVersions, ({ one }) => ({
  weeklyLog: one(weeklyLogs, {
    fields: [logVersions.weeklyLogId],
    references: [weeklyLogs.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const schema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  studentProfiles,
  weeklyLogs,
  dailyLogs,
  logVersions,
};

export type User = typeof users.$inferSelect;
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type WeeklyLog = typeof weeklyLogs.$inferSelect;
export type DailyLog = typeof dailyLogs.$inferSelect;
