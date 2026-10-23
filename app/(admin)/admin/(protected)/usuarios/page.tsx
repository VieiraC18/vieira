import { CollectionManager } from "@/components/admin/collections";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
export default async function Page() {
  const user = await getSession();
  if (!user) redirect("/admin/login");
  if (user.role !== "admin") redirect("/admin");
  return <CollectionManager collection="users" />;
}
