# Monorepo con npm workspaces: el contexto de build DEBE ser la raíz del
# repo (no apps/web), porque este servicio depende de packages/shared.
# En Easypanel: Build Context = "." (raíz), Dockerfile Path = "apps/web/Dockerfile".
#
# VITE_API_URL se hornea en el bundle en build time (Vite embebe env vars al
# compilar). Pásala como Build Arg en Easypanel apuntando a la URL pública
# del servicio de apps/api, ej: https://api.tudominio.com

FROM node:20-alpine AS build
WORKDIR /repo

COPY . .
RUN npm ci
RUN npm run build:shared

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build -w apps/web

FROM nginx:alpine AS runner
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
