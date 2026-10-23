"use client";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          fontFamily: "system-ui,sans-serif",
          background: "#080d18",
          color: "#f0f5ff",
        }}
      >
        <main style={{ maxWidth: 520 }}>
          <p>VIEIRA SYSTEMS</p>
          <h1>Ocorreu uma falha temporária.</h1>
          <p>Tente carregar o site novamente.</p>
          <button
            style={{
              padding: "14px 24px",
              borderRadius: 8,
              border: 0,
              background: "#66d7ec",
              color: "#080d18",
              cursor: "pointer",
              fontSize: 16,
            }}
            onClick={retry}
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
