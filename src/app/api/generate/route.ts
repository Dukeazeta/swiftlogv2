import { NextResponse } from "next/server";
import {
  AiProviderError,
  generateWeeklyLogs,
  getConfiguredAiProviders,
  getDefaultAiProvider,
  type StudentContext,
} from "@/lib/ai";
import { generateLogSchema } from "@/lib/validations";
import { getWeekDates, hasExceededUsageLimit } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { auth } = await import("@/lib/auth");
    const { getUserWithProfile, updateUserUsage } = await import("@/lib/data");

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user with profile
    const user = await getUserWithProfile(session.user.id);

    if (!user?.profile) {
      return NextResponse.json(
        { error: "Please complete your profile first" },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (hasExceededUsageLimit(user.usageCount, user.usageResetAt, 4)) {
      return NextResponse.json(
        {
          error: "You've reached your monthly limit of 4 weeks. Upgrade to continue.",
        },
        { status: 429 }
      );
    }

    // Validate request body
    const body = await request.json();
    const { weekNumber, summary, provider: requestedProvider } =
      generateLogSchema.parse(body);
    const availableProviders = getConfiguredAiProviders();
    const provider =
      requestedProvider ??
      user.profile.preferredAiProvider ??
      getDefaultAiProvider(availableProviders);

    if (!provider) {
      return NextResponse.json(
        {
          error: "No AI provider is connected yet. Add an API key first.",
          code: "no_available_providers",
          provider: null,
          availableProviders,
        },
        { status: 503 }
      );
    }

    // Get week dates
    const { weekStart, weekEnd } = getWeekDates(
      weekNumber,
      user.profile.startDate
    );

    // Build student context
    const context: StudentContext = {
      fullName: user.profile.fullName,
      schoolName: user.profile.schoolName,
      schoolDepartment: user.profile.schoolDepartment,
      companyName: user.profile.companyName,
      companyDepartment: user.profile.companyDepartment,
      jobRole: user.profile.jobRole,
      weekNumber,
      weekStart,
      weekEnd,
    };

    // Generate logs using AI
    const generatedLogs = await generateWeeklyLogs(context, summary, provider);

    // Update usage count (reset if new month)
    const now = new Date();
    const usageResetAt = new Date(user.usageResetAt);
    const isNewMonth =
      now.getMonth() !== usageResetAt.getMonth() ||
      now.getFullYear() !== usageResetAt.getFullYear();

    await updateUserUsage(
      user.id,
      isNewMonth ? 1 : user.usageCount + 1,
      isNewMonth ? now : user.usageResetAt
    );

    return NextResponse.json(generatedLogs);
  } catch (error) {
    console.error("Error generating logs:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid data provided" },
        { status: 400 }
      );
    }

    if (error instanceof AiProviderError) {
      const status =
        error.code === "no_available_providers"
          ? 503
          : error.code === "provider_not_configured"
          ? 400
          : 502;

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          provider: error.provider,
          availableProviders: error.availableProviders,
        },
        { status }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate logs. Please try again." },
      { status: 500 }
    );
  }
}
