import "../admin.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Workspace | VIEIRA SYSTEMS",
    template: "%s | VIEIRA SYSTEMS",
  },
  robots: { index: false, follow: false },
};
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
