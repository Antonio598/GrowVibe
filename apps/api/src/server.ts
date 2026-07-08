import { createApp } from "./app";
import { env } from "./config/env";
import { startNotificationCron } from "./services/cron";

const app = createApp();

// Bind explícito a 0.0.0.0: sin esto, en algunos contenedores Docker/Alpine
// Node puede quedar escuchando solo en IPv6 (::1), haciendo que conexiones
// desde el proxy del host (o el propio HEALTHCHECK vía "localhost") fallen
// de forma intermitente.
app.listen(env.port, "0.0.0.0", () => {
  console.log(`API escuchando en http://0.0.0.0:${env.port}`);
  startNotificationCron();
});
