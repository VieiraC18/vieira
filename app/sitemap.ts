import type { MetadataRoute } from "next";
import { getPublicProjects, getPublicServices } from "@/lib/server/public";
import { getSiteOrigin } from "@/lib/seo";

export const dynamic = "force-dynamic";

const routes = [
  "",
  "servicos",
  "solucoes",
  "automacao",
  "dados",
  "inteligencia-artificial",
  "consultoria",
  "assessoria",
  "projetos",
  "sobre",
  "orcamento",
  "contato",
  "politica-de-privacidade",
  "termos",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await getSiteOrigin();
  if (!origin) return [];
  const [projects, services] = await Promise.all([
    getPublicProjects(),
    getPublicServices(),
  ]);
  return [
    ...routes.map((path) => ({
      url: `${origin}/${path}`,
      changeFrequency: "monthly" as const,
      priority: path ? 0.7 : 1,
    })),
    ...projects.map((project) => ({
      url: `${origin}/projetos/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: project.featured ? 0.8 : 0.6,
    })),
    ...services.map((service) => ({
      url: `${origin}/servicos/${service.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
