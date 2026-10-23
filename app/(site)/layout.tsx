import SiteShell from "@/components/site/site-shell";
import { AppEnhancements } from "@/components/site/app-enhancements";
import "./premium.css";

export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      {children}
      <AppEnhancements />
    </SiteShell>
  );
}
