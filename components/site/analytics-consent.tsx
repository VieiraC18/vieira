"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { analyticsIds, type AnalyticsSettings } from "@/lib/analytics-config";
import styles from "@/components/site/public-content.module.css";

const storageKey = "vs-cookie-consent-v1";
const changeEvent = "vs:cookie-consent";
const openEvent = "vs:cookie-preferences";
const maxAge = 180 * 24 * 60 * 60 * 1000;
type ConsentRecord = {
  version: number;
  choice: "accepted" | "denied";
  timestamp: number;
  scope: string;
};
let memoryChoice: ConsentRecord | null = null;
let storageUnavailable = false;

function readConsent(scope: string) {
  let value: ConsentRecord | null = storageUnavailable ? memoryChoice : null;
  try {
    if (!storageUnavailable) {
      const raw = localStorage.getItem(storageKey);
      value = raw ? JSON.parse(raw) : null;
    }
  } catch {
    value = memoryChoice;
  }
  if (
    value &&
    value.version === 1 &&
    value.scope === scope &&
    ["accepted", "denied"].includes(value.choice) &&
    typeof value.timestamp === "number" &&
    value.timestamp <= Date.now() &&
    Date.now() - value.timestamp < maxAge
  )
    return value.choice;
  return null;
}

function subscribe(listener: () => void) {
  window.addEventListener(changeEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(changeEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

function saveConsent(choice: "accepted" | "denied", scope: string) {
  memoryChoice = { version: 1, choice, timestamp: Date.now(), scope };
  try {
    localStorage.setItem(storageKey, JSON.stringify(memoryChoice));
  } catch {
    storageUnavailable = true;
  }
  window.dispatchEvent(new Event(changeEvent));
}

function removeAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = [
    "",
    host,
    ...host
      .split(".")
      .map((_, index, parts) => `.${parts.slice(index).join(".")}`),
  ];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!/^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_fbp$|_fbc$|_gcl_)/.test(name))
      continue;
    for (const domain of domains)
      document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ""} SameSite=Lax`;
  }
}

type TrackingWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
};

export function CookiePreferencesButton({
  label = "Preferências de cookies",
}: {
  label?: string;
}) {
  return (
    <button
      type="button"
      className={styles.cookieButton}
      onClick={() => window.dispatchEvent(new Event(openEvent))}
    >
      {label}
    </button>
  );
}

export function AnalyticsConsent({
  settings,
}: {
  settings: AnalyticsSettings;
}) {
  const ids = analyticsIds(settings);
  const scope = `${ids.ga}|${ids.gtm}|${ids.pixel}`;
  const configured = Boolean(ids.ga || ids.gtm || ids.pixel);
  const consent = useSyncExternalStore(
    subscribe,
    () => readConsent(scope),
    () => null,
  );
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const lastPath = useRef(path);
  const wasAccepted = useRef(false);
  const accepted = consent === "accepted";

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(openEvent, show);
    return () => window.removeEventListener(openEvent, show);
  }, []);

  useEffect(() => {
    if (wasAccepted.current && !accepted) {
      const tracking = window as TrackingWindow;
      tracking.gtag?.("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      tracking.fbq?.("consent", "revoke");
      removeAnalyticsCookies();
      window.location.reload();
    }
    wasAccepted.current = accepted;
  }, [accepted]);

  useEffect(() => {
    if (lastPath.current === path) return;
    lastPath.current = path;
    if (!accepted) return;
    const tracking = window as TrackingWindow;
    tracking.gtag?.("event", "page_view", {
      page_path: path,
      page_location: window.location.origin + path,
    });
    tracking.fbq?.("track", "PageView");
  }, [path, accepted]);

  function choose(choice: "accepted" | "denied") {
    if (choice === "denied") {
      const tracking = window as TrackingWindow;
      tracking.gtag?.("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      tracking.fbq?.("consent", "revoke");
      removeAnalyticsCookies();
    }
    saveConsent(choice, scope);
    setOpen(false);
    // Reload after revocation so already-loaded third-party runtimes stop executing.
    if (choice === "denied" && accepted) window.location.reload();
  }

  return (
    <>
      {accepted && ids.ga && (
        <>
          <Script
            id="vs-google-analytics-init"
            strategy="afterInteractive"
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${ids.ga}',{page_location:location.origin+location.pathname,page_path:location.pathname,allow_google_signals:false,allow_ad_personalization_signals:false});`}</Script>
          <Script
            id="vs-google-analytics"
            src={`https://www.googletagmanager.com/gtag/js?id=${ids.ga}`}
            strategy="afterInteractive"
          />
        </>
      )}
      {accepted && ids.gtm && (
        <Script
          id="vs-google-tag-manager"
          strategy="afterInteractive"
        >{`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${ids.gtm}';document.head.appendChild(s);`}</Script>
      )}
      {accepted && ids.pixel && (
        <Script
          id="vs-meta-pixel"
          strategy="afterInteractive"
        >{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('consent','grant');fbq('init','${ids.pixel}');fbq('track','PageView');`}</Script>
      )}
      {(open || (configured && consent === null)) && (
        <section
          id="cookie-preferences"
          className={styles.consent}
          aria-labelledby="cookie-heading"
          role="region"
        >
          <h2 id="cookie-heading">Você decide sobre os cookies</h2>
          <p>
            {configured
              ? "Com sua autorização, usamos ferramentas de medição e marketing para entender o uso do site. Você pode recusar e continuar navegando normalmente."
              : "Nenhuma ferramenta de medição ou publicidade está ativa. Guardamos preferências de tema e cookies, a origem temporária da visita e, para administradores, a sessão de acesso."}{" "}
            <Link href="/politica-de-privacidade">
              Ler a política de privacidade
            </Link>
            .
          </p>
          <div className={styles.consentActions}>
            {configured ? (
              <>
                <button
                  className="button button-ghost"
                  type="button"
                  onClick={() => choose("denied")}
                >
                  {accepted ? "Revogar consentimento" : "Somente necessários"}
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => choose("accepted")}
                >
                  Aceitar opcionais
                </button>
              </>
            ) : (
              <button
                className="button button-primary"
                type="button"
                onClick={() => setOpen(false)}
              >
                Entendi
              </button>
            )}
          </div>
        </section>
      )}
    </>
  );
}
