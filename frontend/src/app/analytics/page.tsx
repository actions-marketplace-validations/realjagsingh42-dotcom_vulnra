import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

export const metadata = {
  title: "Analytics — VULNRA",
  description: "Security posture analytics and vulnerability trends across your scanned endpoints.",
};

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return <AnalyticsDashboard user={data.user} />;
}
