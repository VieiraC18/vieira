"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { getAttribution } from "@/lib/attribution";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function AppEnhancements() {
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    getAttribution();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => undefined);
    }
    const available = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    const installed = () => setInstall(null);
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", installed);
    return () => {
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);
  if (!install || dismissed) return null;
  return (
    <aside className="install-prompt" aria-label="Instalar aplicativo">
      <button
        type="button"
        onClick={async () => {
          await install.prompt();
          await install.userChoice;
          setInstall(null);
        }}
      >
        <Download size={17} /> Adicionar à tela inicial
      </button>
      <button
        type="button"
        aria-label="Fechar sugestão de instalação"
        onClick={() => setDismissed(true)}
      >
        <X size={17} />
      </button>
    </aside>
  );
}
