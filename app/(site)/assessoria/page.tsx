import {
  ContentLanding,
  landingMetadata,
} from "@/components/site/content-landing";

export function generateMetadata() {
  return landingMetadata("assessoria");
}
export default function Page() {
  return <ContentLanding slug="assessoria" />;
}
