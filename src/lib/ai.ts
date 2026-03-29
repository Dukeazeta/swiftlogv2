import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import {
  DailyLogEntry,
  isWorkDay,
  toIsoDateString,
  WORK_DAYS,
} from "@/lib/logbook";
import { generatedLogsResponseSchema } from "@/lib/validations";
import { getWorkWeekDates } from "@/lib/utils";

// Initialize providers
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Models
const groqModel = groq("llama-3.3-70b-versatile");
const geminiModel = google("gemini-2.5-flash");

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

export async function generateWeeklyLogs(
  context: StudentContext,
  summary: string
): Promise<GeneratedLogs> {
  const userPrompt = buildUserPrompt(context, summary);

  try {
    // Try Groq first
    const result = await generateText({
      model: groqModel,
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      maxTokens: 4000,
      temperature: 0.7,
    });

    return parseAIResponse(result.text, context);
  } catch (groqError) {
    console.error("Groq API failed, falling back to Gemini:", groqError);

    try {
      // Fallback to Gemini
      const result = await generateText({
        model: geminiModel,
        system: SYSTEM_PROMPT,
        prompt: userPrompt,
        maxTokens: 4000,
        temperature: 0.7,
      });

      return parseAIResponse(result.text, context);
    } catch (geminiError) {
      console.error("Gemini API also failed:", geminiError);
      throw new Error("Failed to generate logs. Please try again later.");
    }
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
