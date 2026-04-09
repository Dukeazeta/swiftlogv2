import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  getStudentProfileByUserId,
  updatePreferredAiProvider,
  upsertStudentProfile,
} from "@/lib/data";
import { onboardingSchema, updateAiPreferenceSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getStudentProfileByUserId(session.user.id);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
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
    const validatedData = onboardingSchema.parse(body);

    const existingProfile = await getStudentProfileByUserId(session.user.id);
    const profile = await upsertStudentProfile(session.user.id, validatedData);

    return NextResponse.json(profile, { status: existingProfile ? 200 : 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    
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

export async function PUT(request: Request) {
  return POST(request);
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingProfile = await getStudentProfileByUserId(session.user.id);

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const { preferredAiProvider } = updateAiPreferenceSchema.parse(body);
    const profile = await updatePreferredAiProvider(
      session.user.id,
      preferredAiProvider
    );

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating profile preference:", error);

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
