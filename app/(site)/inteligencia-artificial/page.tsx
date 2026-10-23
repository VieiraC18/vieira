import {
  ContentLanding,
  landingMetadata,
} from "@/components/site/content-landing";

export function generateMetadata() {
  return landingMetadata("inteligencia-artificial");
}
export default function Page() {
  return <ContentLanding slug="inteligencia-artificial" />;
}
