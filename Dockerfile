# Despliegue UNIFICADO: un solo contenedor sirve la API y el frontend web.
# Express (apps/api) sirve tanto /api/* como el bundle estático de apps/web,
# así que no hace falta CORS, ni un segundo servicio, ni dominios separados.
# Easypanel usa este Dockerfile de la raíz con contexto "." por defecto.

FROM node:20-alpine AS build
WORKDIR /repo

# Prisma necesita openssl para generar/cargar el motor musl+openssl3 de Alpine.
RUN apk add --no-cache openssl

COPY . .
RUN npm ci
RUN npm run build:shared
RUN npx prisma generate --schema apps/api/prisma/schema.prisma
RUN npm run build -w apps/web
RUN npm run build -w apps/api

FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production

RUN apk add --no-cache openssl
# Directorio por defecto del volumen para la DB SQLite (ver DATABASE_URL).
RUN mkdir -p /data

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api ./apps/api
# Solo el bundle compilado del web (no el código fuente).
COPY --from=build /repo/apps/web/dist ./apps/web/dist

WORKDIR /repo/apps/api
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:4000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Aplica migraciones versionadas y arranca el server (que sirve API + web).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
