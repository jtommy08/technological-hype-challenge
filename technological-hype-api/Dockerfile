ARG NODE_VERSION=22-alpine

# Base
FROM node:${NODE_VERSION} AS base
WORKDIR /app

# Deps (all, for build)
FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json tsconfig.build.json nest-cli.json package.json package-lock.json ./
COPY src ./src
RUN npm run build

# Prod-deps (only runtime deps)
FROM base AS prod-deps
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

# Runner (final image)
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build     --chown=node:node /app/dist ./dist
COPY --from=build     --chown=node:node /app/package.json ./package.json

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
