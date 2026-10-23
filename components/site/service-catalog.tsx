import Link from "next/link";
import {
  ArrowUpRight,
  Braces,
  BrainCircuit,
  ChartNoAxesCombined,
  Code2,
  Compass,
  Database,
  GitBranch,
  Globe,
  Handshake,
  Layers,
  Link2,
  Monitor,
  Network,
  ScanSearch,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";
import type { getPublicServices } from "@/lib/server/public";
import { SectionHeading } from "@/components/site/section-heading";
import styles from "@/components/site/public-content.module.css";

const icons = {
  Braces,
  BrainCircuit,
  ChartNoAxesCombined,
  Code2,
  Compass,
  Database,
  GitBranch,
  Globe,
  Handshake,
  Layers,
  Link2,
  Monitor,
  Network,
  ScanSearch,
  Smartphone,
  Sparkles,
  Workflow,
};

export function ServiceCatalog({
  services,
}: {
  services: Awaited<ReturnType<typeof getPublicServices>>;
}) {
  if (!services.length) return null;
  return (
    <section className="section">
      <div className="page-wrap">
        <SectionHeading
          eyebrow="ÁREAS DE ATUAÇÃO"
          title="O que podemos construir juntos."
          description="Explore cada especialidade e veja como ela se conecta ao trabalho da sua empresa."
        />
        <div className={styles.catalog}>
          {services.map((service) => {
            const Icon = icons[service.icon as keyof typeof icons] || Braces;
            return (
              <Link
                href={`/servicos/${service.slug}`}
                key={service.id}
                className={styles.service}
              >
                <Icon size={25} aria-hidden="true" />
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.summary}</p>
                </div>
                <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
