import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDashboardLayoutData } from "@/lib/data";
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

    const { profile, logs } = await getDashboardLayoutData(session.user.id);

    return (
      <div className="flex h-[100dvh] bg-surface">
        <Sidebar
          user={session.user}
          profile={profile}
          logs={logs}
          needsOnboarding={!profile}
        />
        <main className="flex-1 overflow-auto lg:overflow-auto">{children}</main>
      </div>
    );
  } catch (error) {
    console.error("Dashboard layout failed to initialize:", error);

    return (
      <main className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg border border-border-gray bg-canvas p-6 shadow-card">
          <h1 className="text-xl font-semibold text-near-black">
            Database connection unavailable
          </h1>
          <p className="mt-2 text-sm text-mid-gray">
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
