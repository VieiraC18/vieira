import {
  ContentLanding,
  landingMetadata,
} from "@/components/site/content-landing";

export function generateMetadata() {
  return landingMetadata("servicos");
}
export default function Page() {
  return <ContentLanding slug="servicos" />;
}
