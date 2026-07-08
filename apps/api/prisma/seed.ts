import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.OWNER_EMAIL;
  const name = process.env.OWNER_NAME ?? "Owner";
  const password = process.env.OWNER_PASSWORD;

  if (!email || !password) {
    throw new Error("OWNER_EMAIL y OWNER_PASSWORD deben estar definidos en .env para el seed");
  }

  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    console.log(`El usuario dueño (${email}) ya existe. Nada que hacer.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const profile = await prisma.profile.create({ data: { email, name, passwordHash } });

  console.log(`Usuario dueño creado: ${profile.email} (id: ${profile.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
