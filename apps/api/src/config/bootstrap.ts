import { prisma } from "./database";
import { env } from "./env";
import { hashPassword } from "../utils/password";

// Crea el usuario dueño inicial si no existe. Idempotente: seguro de correr
// en cada arranque del contenedor. Necesario porque el registro es solo por
// invitación (no hay signup público), así que sin esto no habría forma de
// entrar a una base recién creada.
export async function ensureOwner(): Promise<void> {
  if (!env.ownerEmail || !env.ownerPassword) {
    console.warn(
      "[bootstrap] OWNER_EMAIL/OWNER_PASSWORD no configurados: se omite la creación del usuario dueño.",
    );
    return;
  }

  const existing = await prisma.profile.findUnique({ where: { email: env.ownerEmail } });
  if (existing) {
    console.log(`[bootstrap] Usuario dueño (${env.ownerEmail}) ya existe.`);
    return;
  }

  const passwordHash = await hashPassword(env.ownerPassword);
  const profile = await prisma.profile.create({
    data: { email: env.ownerEmail, name: env.ownerName, passwordHash },
  });

  console.log(`[bootstrap] Usuario dueño creado: ${profile.email}`);
}
