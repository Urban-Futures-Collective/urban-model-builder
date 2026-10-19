# Urban Model Builder – frontend image
# Builds the Ember client once and serves it with nginx. Deployment-specific
# values (public URL, Keycloak) are filled in when the container starts, see
# 40-umb-runtime-config.sh. Build context: the repository root.

FROM node:20.18.3-alpine3.20 AS build
WORKDIR /app

# The client depends on the packed Feathers client in bundle/ (file: dependency)
COPY bundle/ ./bundle/
COPY hcu-urban-model-builder-client/package.json hcu-urban-model-builder-client/package-lock.json ./hcu-urban-model-builder-client/
COPY hcu-urban-model-builder-client/canvas/package.json ./hcu-urban-model-builder-client/canvas/package.json

WORKDIR /app/hcu-urban-model-builder-client
RUN npm config set fetch-retry-maxtimeout 600000 -g \
  && npm ci --no-audit --no-fund

COPY hcu-urban-model-builder-client/ ./
ENV UMB_RUNTIME_CONFIG=1
RUN npx ember build --environment=production

FROM nginx:1.27-alpine
COPY --from=build /app/hcu-urban-model-builder-client/dist /usr/share/nginx/html
COPY deploy/frontend/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY deploy/frontend/40-umb-runtime-config.sh /docker-entrypoint.d/40-umb-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-umb-runtime-config.sh

# Internal address of the backend service in the compose network
ENV UMB_BACKEND_UPSTREAM=http://backend:3030
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
