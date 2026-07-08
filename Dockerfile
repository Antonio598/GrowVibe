# Dockerfile de la raíz = servicio de la API (apps/api). Easypanel, por
# defecto, busca "Dockerfile" en la raíz del repo con contexto ".", así que
# este archivo existe para que la app "crm" en Easypanel construya sin
# necesidad de configurar una ruta de Dockerfile custom.
#
# El frontend web (apps/web) necesita una app SEPARADA en Easypanel que
# apunte a apps/web/Dockerfile (ver instrucciones en ese archivo) — un
# mismo Dockerfile no puede servir dos contenedores/puertos distintos.
#
# Este archivo es una copia intencional de apps/api/Dockerfile: mantenlos
# en sync si cambias uno.

FROM node:20-alpine AS build
WORKDIR /repo

# Prisma necesita openssl para generar/cargar el motor musl+openssl3 que
# corre dentro de Alpine (ver binaryTargets en schema.prisma).
RUN apk add --no-cache openssl

COPY . .
RUN npm ci
RUN npm run build:shared
RUN npx prisma generate --schema apps/api/prisma/schema.prisma
RUN npm run build -w apps/api

FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production

RUN apk add --no-cache openssl
# Path por defecto sugerido para el volumen de la DB SQLite (ver
# DATABASE_URL en .env.example). Se crea igual aunque no montes un volumen
# ahí, para que el arranque no falle por directorio inexistente.
RUN mkdir -p /data

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api ./apps/api

WORKDIR /repo/apps/api
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# prisma migrate deploy aplica las migraciones ya versionadas en
# prisma/migrations antes de arrancar el server (sin generar nuevas).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
