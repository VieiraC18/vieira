import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SystemOverview } from "@/components/admin/system";
export default async function Page() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/admin");
  return <SystemOverview />;
}
