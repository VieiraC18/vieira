import { LeadDetail } from "@/components/admin/leads";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getSession()]);
  if (!user) redirect("/admin/login");
  return <LeadDetail id={id} canDelete={user.role === "admin"} />;
}
