import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VIEIRA SYSTEMS",
    short_name: "VIEIRA SYSTEMS",
    description: "Software, automação e inteligência de dados para empresas.",
    start_url: "/",
    display: "standalone",
    background_color: "#080d18",
    theme_color: "#080d18",
    icons: [
      { src: "/icons/vs-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/vs-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/vs-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
