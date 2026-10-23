"use client";

import { useState } from "react";
import { BrandIcon } from "@/components/brand/brand";
import {
  Activity,
  Braces,
  Database,
  FileSpreadsheet,
  Files,
  GitMerge,
  Workflow,
  Pause,
  Play,
} from "lucide-react";

const inputs = [
  { label: "Planilhas", Icon: FileSpreadsheet, className: "flow-input-a" },
  { label: "Sistemas", Icon: Database, className: "flow-input-b" },
  { label: "Documentos", Icon: Files, className: "flow-input-c" },
  { label: "APIs", Icon: Braces, className: "flow-input-d" },
];
const outputs = [
  { label: "Software", Icon: Braces, className: "flow-output-a" },
  { label: "Automação", Icon: Workflow, className: "flow-output-b" },
  { label: "Dados", Icon: Activity, className: "flow-output-c" },
  { label: "Integração", Icon: GitMerge, className: "flow-output-d" },
];

export function HeroFlow() {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className={`hero-flow${paused ? " motion-paused" : ""}`}
      role="group"
      aria-label="Processos, dados e sistemas convergem para soluções da VIEIRA SYSTEMS"
    >
      <div className="flow-orbit flow-orbit-one" />
      <div className="flow-orbit flow-orbit-two" />
      <svg
        className="flow-lines"
        viewBox="0 0 700 520"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="flow-in" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#19dcff" stopOpacity=".08" />
            <stop offset="1" stopColor="#2e71ff" stopOpacity=".86" />
          </linearGradient>
          <linearGradient id="flow-out" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#2e71ff" stopOpacity=".86" />
            <stop offset="1" stopColor="#19dcff" stopOpacity=".08" />
          </linearGradient>
        </defs>
        <path
          className="flow-path flow-path-in"
          d="M86 104 C 188 104, 204 206, 305 247"
          stroke="url(#flow-in)"
        />
        <path
          className="flow-path flow-path-in path-delay-a"
          d="M80 206 C 176 206, 220 232, 305 254"
          stroke="url(#flow-in)"
        />
        <path
          className="flow-path flow-path-in path-delay-b"
          d="M78 314 C 174 314, 222 276, 305 262"
          stroke="url(#flow-in)"
        />
        <path
          className="flow-path flow-path-in path-delay-c"
          d="M88 416 C 188 416, 220 313, 305 270"
          stroke="url(#flow-in)"
        />
        <path
          className="flow-path flow-path-out"
          d="M394 254 C 480 234, 500 103, 612 103"
          stroke="url(#flow-out)"
        />
        <path
          className="flow-path flow-path-out path-delay-a"
          d="M394 257 C 482 250, 506 206, 618 206"
          stroke="url(#flow-out)"
        />
        <path
          className="flow-path flow-path-out path-delay-b"
          d="M394 261 C 482 269, 506 313, 618 313"
          stroke="url(#flow-out)"
        />
        <path
          className="flow-path flow-path-out path-delay-c"
          d="M394 264 C 480 285, 502 417, 612 417"
          stroke="url(#flow-out)"
        />
      </svg>
      <svg
        className="flow-lines-mobile"
        viewBox="0 0 400 440"
        fill="none"
        aria-hidden="true"
      >
        <path
          className="flow-path"
          d="M95 135 C95 180 170 175 200 216 M305 135 C305 180 230 175 200 216 M200 230 C170 268 95 255 95 302 M200 230 C230 268 305 255 305 302"
          stroke="currentColor"
        />
      </svg>
      <div className="flow-label flow-label-left">ENTRADAS</div>
      <div className="flow-label flow-label-right">SOLUÇÕES</div>
      <div className="flow-nodes flow-inputs">
        {inputs.map(({ label, Icon, className }) => (
          <div className={`flow-node ${className}`} key={label}>
            <span className="flow-node-icon">
              <Icon size={17} />
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="flow-core">
        <span className="core-light core-light-a" />
        <span className="core-light core-light-b" />
        <div className="core-mark">
          <BrandIcon size={82} priority className="core-logo" />
        </div>
        <span className="core-caption">VIEIRA SYSTEMS</span>
      </div>
      <div className="flow-nodes flow-outputs">
        {outputs.map(({ label, Icon, className }) => (
          <div className={`flow-node ${className}`} key={label}>
            <span className="flow-node-icon">
              <Icon size={17} />
            </span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="flow-footnote">
        <span className="flow-live-dot" /> FLUXOS PENSADOS PARA O SEU NEGÓCIO
      </div>
      <button
        className="flow-pause icon-button"
        onClick={() => setPaused(!paused)}
        aria-label={paused ? "Reproduzir animação" : "Pausar animação"}
        title={paused ? "Reproduzir animação" : "Pausar animação"}
      >
        {paused ? <Play size={14} /> : <Pause size={14} />}
      </button>
    </div>
  );
}
