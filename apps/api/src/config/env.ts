import "dotenv/config";

const missing: string[] = [];

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) missing.push(name);
  return value ?? "";
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: required("DATABASE_URL", "file:./dev.db"),
  jwtSecret: required("JWT_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  highExpenseThreshold: Number(process.env.HIGH_EXPENSE_THRESHOLD ?? 500),
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL ?? "",
  ownerEmail: process.env.OWNER_EMAIL ?? "",
  ownerName: process.env.OWNER_NAME ?? "Owner",
  ownerPassword: process.env.OWNER_PASSWORD ?? "",
};

if (missing.length > 0) {
  console.error(
    `\n❌ Faltan variables de entorno requeridas: ${missing.join(", ")}.\n` +
      `Configúralas en Easypanel (App > Environment) y volvé a desplegar.\n`,
  );
  process.exit(1);
}
