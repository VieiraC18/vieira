import {
  ContentLanding,
  landingMetadata,
} from "@/components/site/content-landing";

export function generateMetadata() {
  return landingMetadata("dados");
}
export default function Page() {
  return <ContentLanding slug="dados" />;
}
