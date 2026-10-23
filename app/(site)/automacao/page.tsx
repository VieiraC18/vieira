import {
  ContentLanding,
  landingMetadata,
} from "@/components/site/content-landing";

export function generateMetadata() {
  return landingMetadata("automacao");
}
export default function Page() {
  return <ContentLanding slug="automacao" />;
}
