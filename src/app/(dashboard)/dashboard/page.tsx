import { redirect } from "next/navigation";
import { DashboardEditor } from "@/components/dashboard/dashboard-editor";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await db.studentProfile.findUnique({
    where: { userId: session.user.id },
    select: {
      fullName: true,
      schoolName: true,
      schoolDepartment: true,
      companyName: true,
      companyDepartment: true,
      jobRole: true,
      startDate: true,
      endDate: true,
    },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <DashboardEditor
      profile={{
        ...profile,
        startDate: profile.startDate.toISOString(),
        endDate: profile.endDate.toISOString(),
      }}
    />
  );
}
