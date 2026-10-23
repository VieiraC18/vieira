import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bodyFont = localFont({
  src: "../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2",
  variable: "--font-dm",
  display: "swap",
  weight: "100 1000",
});
const displayFont = localFont({
  src: "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: "VIEIRA SYSTEMS | Tecnologia para processos que precisam evoluir",
    template: "%s | VIEIRA SYSTEMS",
  },
  description:
    "Entendemos processos empresariais e desenvolvemos software, automações, integrações e soluções de dados para fazer o trabalho fluir melhor.",
  applicationName: "VIEIRA SYSTEMS",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "VIEIRA SYSTEMS",
    title: "VIEIRA SYSTEMS | Tecnologia começa entendendo o problema",
    description: "Software, automação, integração e dados para empresas.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "VIEIRA SYSTEMS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIEIRA SYSTEMS | Tecnologia começa entendendo o problema",
    description: "Software, automação, integração e dados para empresas.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/icons/vs-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/vs-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/icons/vs-180.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080d18" },
    { media: "(prefers-color-scheme: light)", color: "#f4f7fb" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${bodyFont.variable} ${displayFont.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.dataset.theme=localStorage.getItem('vs-theme')==='light'?'light':'dark'}catch{document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
