import "dotenv/config";
import { prisma } from "../src/config/database";
import { ensureOwner } from "../src/config/bootstrap";

// El servidor ya ejecuta ensureOwner() en el arranque (ver src/server.ts),
// así que este seed es opcional/manual. Se mantiene por conveniencia para
// poblar una base local sin levantar el server.
ensureOwner()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
