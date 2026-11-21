import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./features.css";
import "./journeys.css";
import "./cases.css";
import "./cases-areas.css";
import "./ui.css";
import "./astros.css";
import "./cases-theme.css";

// Fontes servidas pelo próprio site (next/font): baixadas no build, pré-carregadas e sem pedidos ao Google
// a cada visita — mais rápido e sem enviar dados dos jovens a terceiros. As variáveis alimentam
// --font-body e --font-title em globals.css.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--ff-body", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--ff-title", display: "swap" });

export const metadata: Metadata = {
  title: "MindLoop — Lógica sem mistério",
  description: "Jogos de raciocínio lógico para jovens: Mini Sudoku, Zip, Tango e Patches, com jornadas de 100 níveis cada.",
  appleWebApp: { title: "MindLoop", statusBarStyle: "black-translucent" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#26104D" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${grotesk.variable}`}>
      <head>
        {/* A arte do Início é a primeira coisa que aparece: começa a baixar junto com o resto da página.
            Só a arte da tela atual (a mesma regra de globals.css, "16:10 ou mais largo"): o computador não baixa a
            arte do celular, nem o celular a do computador. */}
        <link rel="preload" as="image" href="/home-art.webp" type="image/webp" fetchPriority="high"
          media="not all and (min-width: 900px) and (min-height: 541px) and (min-aspect-ratio: 8/5)" />
        <link rel="preload" as="image" href="/home-art-desktop.webp" type="image/webp" fetchPriority="high"
          media="(min-width: 900px) and (min-height: 541px) and (min-aspect-ratio: 8/5)" />
      </head>
      <body>{children}</body>
    </html>
  );
}
