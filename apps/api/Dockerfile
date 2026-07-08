# Monorepo con npm workspaces: el contexto de build DEBE ser la raíz del
# repo (no apps/api), porque este servicio depende de packages/shared.
# En Easypanel: Build Context = "." (raíz), Dockerfile Path = "apps/api/Dockerfile".

FROM node:20-alpine AS build
WORKDIR /repo

COPY . .
RUN npm ci
RUN npm run build:shared
RUN npx prisma generate --schema apps/api/prisma/schema.prisma
RUN npm run build -w apps/api

FROM node:20-alpine AS runner
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/packages/shared ./packages/shared
COPY --from=build /repo/apps/api ./apps/api

WORKDIR /repo/apps/api
EXPOSE 4000

# prisma migrate deploy aplica las migraciones ya versionadas en
# prisma/migrations antes de arrancar el server (sin generar nuevas).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
