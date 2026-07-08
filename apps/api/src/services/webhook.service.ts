import { env } from "../config/env";

export interface WebhookPayload {
  event: string;
  userId: string;
  userEmail: string;
  message: string;
  metadata: Record<string, unknown> | null;
  notificationId: string;
  createdAt: string;
}

const TIMEOUT_MS = 5000;
const RETRY_DELAY_MS = 2000;

async function postWithTimeout(url: string, payload: WebhookPayload): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fire-and-forget: nunca debe hacer fallar la request que originó el evento.
// 1 reintento con backoff fijo; si ambos fallan, solo se loguea (la
// notificación ya quedó persistida en la tabla `notifications`).
export async function sendToN8n(payload: WebhookPayload): Promise<void> {
  if (!env.n8nWebhookUrl) return;

  try {
    const res = await postWithTimeout(env.n8nWebhookUrl, payload);
    if (res.ok) return;
    throw new Error(`Webhook respondió ${res.status}`);
  } catch (firstError) {
    await delay(RETRY_DELAY_MS);
    try {
      const res = await postWithTimeout(env.n8nWebhookUrl, payload);
      if (!res.ok) throw new Error(`Webhook respondió ${res.status}`);
    } catch (secondError) {
      console.error("[webhook] Falló el envío a n8n tras reintento", {
        notificationId: payload.notificationId,
        firstError,
        secondError,
      });
    }
  }
}
