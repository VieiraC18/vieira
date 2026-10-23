/* next/og renders its own image tree; next/image is not supported in this route. */
/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brandAssets } from "@/components/brand/brand";

export const alt = "VIEIRA SYSTEMS — Software, automação e dados";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public", brandAssets.full.slice(1)),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px 72px",
        color: "#eff5ff",
        background: "#080d18",
        backgroundImage:
          "radial-gradient(ellipse at 95% 90%, #103465, #080d18 65%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "10px 18px",
            borderRadius: 14,
            background: "#0e1727",
            border: "1px solid #21334f",
          }}
        >
          <img
            src={`data:image/png;base64,${logo.toString("base64")}`}
            width={360}
            height={120}
            alt="VIEIRA SYSTEMS"
          />
        </div>
        <div
          style={{
            display: "flex",
            color: "#8cabd4",
            fontSize: 16,
            letterSpacing: 3,
          }}
        >
          SOFTWARE · AUTOMAÇÃO · DADOS
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            maxWidth: 980,
            fontSize: 58,
            fontWeight: 700,
            letterSpacing: -2.5,
            lineHeight: 1.13,
          }}
        >
          Transformamos processos, dados e ideias em soluções digitais.
        </div>
        <div style={{ display: "flex", color: "#a6b9d4", fontSize: 24 }}>
          Você explica o problema. Nós construímos o próximo passo.
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          color: "#2be4ff",
          fontSize: 17,
          letterSpacing: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            width: 50,
            height: 2,
            background: "#2be4ff",
          }}
        />{" "}
        ENTENDER. AUTOMATIZAR. INTEGRAR. DESENVOLVER. EVOLUIR.
      </div>
    </div>,
    size,
  );
}
