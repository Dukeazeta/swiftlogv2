import { z } from "zod";
import { WORK_DAYS } from "@/lib/logbook";

export const onboardingSchema = z.object({
  fullName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  schoolName: z
    .string()
    .min(2, "School name is required")
    .max(200, "School name must be less than 200 characters"),
  
  schoolDepartment: z
    .string()
    .min(2, "Department is required")
    .max(100, "Department must be less than 100 characters"),
  
  companyName: z
    .string()
    .min(2, "Company name is required")
    .max(200, "Company name must be less than 200 characters"),
  
  companyDepartment: z
    .string()
    .min(2, "Company department/field is required")
    .max(100, "Department must be less than 100 characters"),
  
  jobRole: z
    .string()
    .min(2, "Job role is required")
    .max(200, "Job role must be less than 200 characters"),
  
  startDate: z.coerce.date({
    required_error: "Start date is required",
  }),
  
  endDate: z.coerce.date({
    required_error: "End date is required",
  }),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const generateLogSchema = z.object({
  weekNumber: z.number().min(1, "Invalid week number"),
  summary: z
    .string()
    .min(20, "Summary must be at least 20 characters")
    .max(2000, "Summary must be less than 2000 characters"),
});

export type GenerateLogFormData = z.infer<typeof generateLogSchema>;

export const workDaySchema = z.enum(WORK_DAYS);

export const editableDailyLogEntrySchema = z.object({
  day: workDaySchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  content: z
    .string()
    .trim()
    .min(1, "Each daily entry must have content")
    .max(5000, "Each daily entry must be less than 5000 characters"),
});

export const generatedDailyLogEntrySchema = editableDailyLogEntrySchema.extend({
  content: z
    .string()
    .trim()
    .min(40, "Generated content is too short")
    .max(5000, "Generated content must be less than 5000 characters"),
});

export const generatedLogsResponseSchema = z.object({
  entries: z.array(generatedDailyLogEntrySchema).length(5),
});

export const saveLogSchema = z.object({
  weekNumber: z.number().int().min(1),
  summary: z
    .string()
    .trim()
    .min(1, "Summary is required")
    .max(2000, "Summary must be less than 2000 characters"),
  entries: z.array(editableDailyLogEntrySchema).length(5),
});
