import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Permite requests sin Origin (curl, health checks, apps móviles
        // nativas) y los orígenes explícitamente listados en CORS_ORIGIN.
        if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
        callback(new Error("Origen no permitido por CORS"));
      },
    }),
  );
  app.use(express.json());

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
