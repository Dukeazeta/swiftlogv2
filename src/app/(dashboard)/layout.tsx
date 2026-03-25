import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      redirect("/login");
    }

    // Check if user has completed onboarding
    const profile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Get user's weekly logs for history
    const logs = await db.weeklyLog.findMany({
      where: { userId: session.user.id },
      orderBy: { weekNumber: "desc" },
      take: 20,
    });

    // If no profile and not on onboarding page, redirect to onboarding
    const isOnboarding = false; // Will be set by the page

    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          user={session.user}
          profile={profile}
          logs={logs}
          needsOnboarding={!profile}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    );
  } catch (error) {
    console.error("Dashboard layout failed to initialize:", error);

    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Database connection unavailable
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            SwiftLogNG could not connect to its database while loading your
            dashboard. This is usually an environment or network issue, not a
            problem with your account.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/dashboard">Retry</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Go to login</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }
}
