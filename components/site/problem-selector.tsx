"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Bot,
  Boxes,
  ChartNoAxesCombined,
  FileSpreadsheet,
  GitMerge,
  Globe,
  Lightbulb,
  Layers,
  Puzzle,
  Workflow,
  Wrench,
} from "lucide-react";
import { defaultProblems } from "@/lib/home-content";
const icons: Record<string, typeof Workflow> = {
  "Automação de processos": Workflow,
  "Automação de dados": FileSpreadsheet,
  Integração: GitMerge,
  Sistema: Boxes,
  Site: Globe,
  "Business Intelligence": ChartNoAxesCombined,
  "Inteligência artificial": Bot,
  Aplicativo: Lightbulb,
  Dashboard: ChartNoAxesCombined,
  SaaS: Layers,
  Consultoria: Puzzle,
};
export function ProblemSelector({
  items = defaultProblems,
}: {
  items?: typeof defaultProblems;
}) {
  const [selected, setSelected] = useState(0);
  const item = items[selected] ?? items[0];
  if (!item) return null;
  return (
    <div className="solution-explorer">
      <div
        className="need-grid"
        role="group"
        aria-label="Escolha o que deseja resolver"
      >
        {items.map(({ title, need }, index) => {
          const Icon = icons[need] ?? Puzzle;
          return (
            <button
              key={`${title}-${index}`}
              type="button"
              aria-pressed={selected === index}
              className={`need-card${selected === index ? " need-card-active" : ""}`}
              onClick={() => setSelected(index)}
            >
              <span className="need-icon">
                <Icon size={19} strokeWidth={1.7} />
              </span>
              <span>{title}</span>
              <ArrowRight size={16} className="need-arrow" />
            </button>
          );
        })}
      </div>
      <div className="solution-preview" aria-live="polite">
        <div className="solution-preview-icon">
          <Wrench size={18} />
        </div>
        <div className="solution-preview-copy">
          <span className="eyebrow">UM CAMINHO POSSÍVEL</span>
          <h3>{item.need}</h3>
          <p>{item.description}</p>
        </div>
        <Link
          href={`/orcamento?necessidade=${encodeURIComponent(item.need)}`}
          className="button button-outline"
        >
          Explorar solução <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
