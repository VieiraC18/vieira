import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLogin } from "@/components/admin/login";
import { databaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");
  return (
    <AdminLogin
      configured={
        databaseConfigured() && (process.env.AUTH_SECRET?.length ?? 0) >= 32
      }
    />
  );
}
