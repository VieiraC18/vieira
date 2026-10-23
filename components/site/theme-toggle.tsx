"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("vs-themechange", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("vs-themechange", callback);
  };
}
function snapshot() {
  return document.documentElement.dataset.theme === "light";
}
function serverSnapshot() {
  return false;
}

export function ThemeToggle() {
  const light = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  function toggle() {
    const theme = light ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("vs-theme", theme);
    } catch {
      /* Theme still works without storage. */
    }
    window.dispatchEvent(new Event("vs-themechange"));
  }
  return (
    <button
      className="icon-button theme-toggle"
      onClick={toggle}
      aria-label={light ? "Ativar modo escuro" : "Ativar modo claro"}
      title={light ? "Modo escuro" : "Modo claro"}
    >
      {light ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
