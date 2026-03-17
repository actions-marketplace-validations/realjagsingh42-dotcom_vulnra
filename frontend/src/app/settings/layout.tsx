import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SettingsShell from "@/components/settings/SettingsShell";

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  return <SettingsShell user={data.user}>{children}</SettingsShell>;
}
