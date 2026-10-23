import {
  ContentLanding,
  landingMetadata,
} from "@/components/site/content-landing";

export function generateMetadata() {
  return landingMetadata("solucoes");
}
export default function Page() {
  return <ContentLanding slug="solucoes" />;
}
