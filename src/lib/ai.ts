import { createMistral } from "@ai-sdk/mistral";
import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_IDS,
  type AiProviderId,
} from "@/lib/ai-providers";
import {
  DailyLogEntry,
  isWorkDay,
  toIsoDateString,
  WORK_DAYS,
} from "@/lib/logbook";
import { generatedLogsResponseSchema } from "@/lib/validations";
import { getWorkWeekDates } from "@/lib/utils";

export interface StudentContext {
  fullName: string;
  schoolName: string;
  schoolDepartment: string;
  companyName: string;
  companyDepartment: string;
  jobRole: string;
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
}

export interface GeneratedLogs {
  entries: DailyLogEntry[];
}

export type AiProviderErrorCode =
  | "no_available_providers"
  | "provider_not_configured"
  | "provider_generation_failed";

export class AiProviderError extends Error {
  constructor(
    message: string,
    public code: AiProviderErrorCode,
    public provider: AiProviderId | null,
    public availableProviders: AiProviderId[]
  ) {
    super(message);
    this.name = "AiProviderError";
  }
}

const SYSTEM_PROMPT = `You are an AI assistant helping Nigerian IT/SIWES students write professional logbook entries. 
Your task is to take a brief weekly summary and turn it into short, clear daily log entries for Monday through Friday.

Guidelines:
- Write in first person perspective
- Each day should be 1-2 clear, natural-sounding sentences only
- Keep it concise and human — like a real student would write
- Stay very close to the student's weekly summary and role
- Do not invent major tasks, meetings, tools, or achievements the student did not mention
- Make each day distinct but cohesive with the weekly theme
- Do NOT use markdown formatting in the content - use plain text only

You must respond with a valid JSON object containing an "entries" array with exactly 5 objects (one for each weekday).
Each entry must have: "day" (e.g., "MONDAY"), "date" (the actual date), and "content" (the short log).`;

function buildUserPrompt(context: StudentContext, summary: string): string {
  const weekStartStr = context.weekStart.toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekEndStr = context.weekEnd.toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const expectedEntries = getWorkWeekDates(context.weekStart)
    .map((date, index) => `- ${WORK_DAYS[index]}: ${toIsoDateString(date)}`)
    .join("\n");

  return `
Student Information:
- Name: ${context.fullName}
- School: ${context.schoolName} (${context.schoolDepartment})
- Company: ${context.companyName} (${context.companyDepartment})
- Role: ${context.jobRole}
- Week: ${context.weekNumber} (${weekStartStr} to ${weekEndStr})

Weekly Summary:
${summary}

Expected Days and Dates:
${expectedEntries}

Generate detailed daily log entries for this week. Return a JSON object with this exact structure:
{
  "entries": [
    {"day": "MONDAY", "date": "YYYY-MM-DD", "content": "detailed log content..."},
    {"day": "TUESDAY", "date": "YYYY-MM-DD", "content": "detailed log content..."},
    {"day": "WEDNESDAY", "date": "YYYY-MM-DD", "content": "detailed log content..."},
    {"day": "THURSDAY", "date": "YYYY-MM-DD", "content": "detailed log content..."},
    {"day": "FRIDAY", "date": "YYYY-MM-DD", "content": "detailed log content..."}
  ]
}`;
}

function hasApiKey(provider: AiProviderId): boolean {
  switch (provider) {
    case "mistral":
      return Boolean(process.env.MISTRAL_API_KEY);
    case "groq":
      return Boolean(process.env.GROQ_API_KEY);
    case "gemini":
      return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
  }
}

export function getConfiguredAiProviders(): AiProviderId[] {
  return AI_PROVIDER_IDS.filter((provider) => hasApiKey(provider));
}

export function getDefaultAiProvider(
  availableProviders = getConfiguredAiProviders()
): AiProviderId | null {
  return availableProviders[0] ?? null;
}

function getModel(provider: AiProviderId) {
  switch (provider) {
    case "mistral":
      return createMistral({
        apiKey: process.env.MISTRAL_API_KEY,
      })("mistral-small-latest");
    case "groq":
      return createGroq({
        apiKey: process.env.GROQ_API_KEY,
      })("llama-3.3-70b-versatile");
    case "gemini":
      return createGoogleGenerativeAI({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      })("gemini-2.5-flash");
  }
}

export async function generateWeeklyLogs(
  context: StudentContext,
  summary: string,
  provider: AiProviderId
): Promise<GeneratedLogs> {
  const userPrompt = buildUserPrompt(context, summary);
  const availableProviders = getConfiguredAiProviders();

  if (availableProviders.length === 0) {
    throw new AiProviderError(
      "No AI provider is connected yet. Add an API key first.",
      "no_available_providers",
      null,
      []
    );
  }

  if (!availableProviders.includes(provider)) {
    throw new AiProviderError(
      `${AI_PROVIDER_LABELS[provider]} is not available right now.`,
      "provider_not_configured",
      provider,
      availableProviders
    );
  }

  try {
    const result = await generateText({
      model: getModel(provider),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      maxTokens: 4000,
      temperature: 0.7,
    });

    return parseAIResponse(result.text, context);
  } catch (error) {
    console.error(`${AI_PROVIDER_LABELS[provider]} generation failed:`, error);
    throw new AiProviderError(
      `${AI_PROVIDER_LABELS[provider]} could not generate your draft right now.`,
      "provider_generation_failed",
      provider,
      availableProviders
    );
  }
}

function parseAIResponse(text: string, context: StudentContext): GeneratedLogs {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*"entries"[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Invalid AI response format");
  }

  try {
    const parsed = generatedLogsResponseSchema.parse(JSON.parse(jsonMatch[0]));
    const normalizedEntries = parsed.entries.map((entry) => ({
      day: entry.day.trim().toUpperCase(),
      date: entry.date,
      content: entry.content.trim(),
    }));
    const entriesByDay = new Map<DailyLogEntry["day"], DailyLogEntry>();

    for (const entry of normalizedEntries) {
      if (!isWorkDay(entry.day) || entriesByDay.has(entry.day)) {
        throw new Error("Invalid day structure");
      }

      entriesByDay.set(entry.day, {
        day: entry.day,
        date: entry.date,
        content: entry.content,
      });
    }

    const expectedEntries = getWorkWeekDates(context.weekStart).map((date, index) => ({
      day: WORK_DAYS[index],
      date: toIsoDateString(date),
    }));
    const validatedEntries = expectedEntries.map(({ day, date }) => {
      const entry = entriesByDay.get(day);

      if (!entry || entry.date !== date) {
        throw new Error("Generated dates do not match the selected week");
      }

      return {
        day,
        date,
        content: entry.content,
      };
    });

    return { entries: validatedEntries };
  } catch {
    throw new Error("Failed to parse AI response");
  }
}
