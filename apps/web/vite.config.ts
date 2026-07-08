import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En producción el frontend se sirve desde el mismo Express que la API
// (un solo origen), así que el cliente usa rutas relativas /api/*.
// En desarrollo, Vite corre en :5173 y proxea /api al backend en :4000
// para que esas mismas rutas relativas funcionen sin CORS.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resuelve el paquete compartido a su fuente TS para que Vite/Rollup
      // lo compile directamente (el dist CommonJS no expone named exports
      // analizables estáticamente por el bundler).
      shared: fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
});
