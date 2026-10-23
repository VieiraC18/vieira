import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SettingsManager } from "@/components/admin/settings";
export default async function Page() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/admin");
  return <SettingsManager />;
}
