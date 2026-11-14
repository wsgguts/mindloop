// Configuração dos testes. O Next compila o JSX sozinho (tsconfig: "jsx": "preserve"); nos testes, o esbuild do
// vitest precisa do runtime automático do React para renderizar componentes (src/components/**/*.test.tsx).
import { defineConfig } from "vitest/config";

export default defineConfig({ esbuild: { jsx: "automatic" } });
