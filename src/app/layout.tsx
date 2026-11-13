import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "./features.css";
import "./journeys.css";
import "./cases.css";

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
        {/* A arte do Início é a primeira coisa que aparece: começa a baixar junto com o resto da página. */}
        <link rel="preload" as="image" href="/home-art.webp" type="image/webp" fetchPriority="high" />
      </head>
      <body>{children}</body>
    </html>
  );
}
