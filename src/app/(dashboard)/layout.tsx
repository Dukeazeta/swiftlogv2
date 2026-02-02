import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
}
