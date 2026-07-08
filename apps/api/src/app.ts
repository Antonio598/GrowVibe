import path from "node:path";
import fs from "node:fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

// Ubicación del frontend web compilado (apps/web/dist). __dirname es
// apps/api/{src|dist} tanto en dev (tsx) como en prod (compilado), así que
// "../../web/dist" resuelve correcto en ambos. Se puede sobreescribir con
// WEB_DIST_PATH si el layout de despliegue difiere.
const webDist = process.env.WEB_DIST_PATH ?? path.resolve(__dirname, "../../web/dist");

export function createApp() {
  const app = express();

  // CSP desactivada: el bundle de Vite carga assets del mismo origen y la
  // política por defecto de helmet puede bloquear el SPA. Para un despliegue
  // personal el resto de cabeceras de helmet es suficiente.
  app.use(helmet({ contentSecurityPolicy: false }));
  // CORS permisivo (refleja el origen). El frontend se sirve desde el mismo
  // origen que la API y la auth es por token Bearer (no cookies), así que
  // CORS no es una barrera de seguridad aquí. Importante: nunca lanzar un
  // Error en el callback de origin -> devolvería 500 incluso para assets
  // estáticos que el navegador pide con header Origin (atributo crossorigin).
  app.use(cors());
  app.use(express.json());

  app.use("/api", apiRouter);

  // Sirve el frontend web (si está compilado) desde el mismo servidor:
  // un solo origen, sin CORS, un solo dominio/puerto en producción.
  if (fs.existsSync(webDist)) {
    app.use(express.static(webDist));
    // Fallback SPA: cualquier ruta que no sea /api ni un archivo real
    // devuelve index.html para que react-router-dom maneje el ruteo.
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(webDist, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
