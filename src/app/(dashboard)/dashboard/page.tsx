import { redirect } from "next/navigation";
import { DashboardEditor } from "@/components/dashboard/dashboard-editor";
import { getConfiguredAiProviders } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { getStudentProfileByUserId } from "@/lib/data";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await getStudentProfileByUserId(session.user.id);
  const availableProviders = getConfiguredAiProviders();

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
      availableProviders={availableProviders}
    />
  );
}
