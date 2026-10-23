"use client";

import { useEffect, useRef } from "react";

const steps = [
  "Entendimento",
  "Mapeamento",
  "Diagnóstico",
  "Planejamento",
  "Desenvolvimento",
  "Validação",
  "Implantação",
  "Evolução",
];

export function MethodTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    element.classList.add("method-enhanced");
    let progress = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const item = entry.target as HTMLElement;
          item.classList.add("method-visible");
          progress = Math.max(
            progress,
            (Number(item.dataset.step) + 1) / steps.length,
          );
          element.style.setProperty("--method-progress", String(progress));
          observer.unobserve(item);
        }
      },
      { threshold: 0.7, rootMargin: "0px 0px -10% 0px" },
    );
    element.querySelectorAll("li").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="method-line">
      <div className="method-track" aria-hidden="true" />
      <ol>
        {steps.map((step, index) => (
          <li
            data-step={index}
            key={step}
            style={{ transitionDelay: `${index * 45}ms` }}
          >
            <span className="method-number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="method-dot" aria-hidden="true" />
            <span className="method-name">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
