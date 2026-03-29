import { redirect } from "next/navigation";
import { DashboardEditor } from "@/components/dashboard/dashboard-editor";
import { auth } from "@/lib/auth";
import { getStudentProfileByUserId } from "@/lib/data";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getStudentProfileByUserId(session.user.id);

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
