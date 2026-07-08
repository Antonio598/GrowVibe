import cron from "node-cron";
import { runNotificationChecks } from "./notification-jobs.service";

// Corre cada hora. TODO: deduplicar notificaciones repetidas (ej. no
// re-notificar la misma tarea atrasada en cada corrida) — fuera de alcance
// del esqueleto, donde se prioriza tener el flujo end-to-end funcionando.
export function startNotificationCron() {
  cron.schedule("0 * * * *", () => {
    runNotificationChecks().catch((err) => console.error("[cron] Error en notification checks", err));
  });
}
