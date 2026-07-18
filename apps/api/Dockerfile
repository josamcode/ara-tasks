# syntax=docker/dockerfile:1
# ARA Tasks — tenant API (NestJS). Monorepo-aware multi-stage build (turbo prune + pnpm).
# Build context = repo root (see docker-compose.yml, service: api).

# Base: Node 24 LTS (24.18.0) on Debian bookworm-slim, pinned by digest. pnpm via Corepack.
FROM node:24-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app

# Stage 1 — prune the workspace down to @ara/api and its dependency graph.
FROM base AS pruner
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm dlx turbo@2.10.5 prune @ara/api --docker

# Stage 2 — install (cached on the lockfile), build, then produce a prod-only bundle.
FROM base AS installer
# Manifests + lockfile first → this layer is reused until a dependency changes.
COPY --from=pruner /app/out/json/ ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
# Full pruned source, then build @ara/api (turbo builds @ara/types first via ^build).
COPY --from=pruner /app/out/full/ ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm exec turbo run build --filter=@ara/api
# Self-contained bundle: production deps + built dist. --legacy copies workspace
# deps into a flat node_modules (pnpm v10+ requires it unless deps are injected).
RUN pnpm --filter=@ara/api deploy --prod --legacy /prod/api

# Stage 3 — minimal runtime. Non-root, production only.
FROM base AS runner
ENV NODE_ENV=production
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --home-dir /app nodeuser
WORKDIR /app
COPY --from=installer --chown=nodeuser:nodejs /prod/api ./
USER nodeuser
# Tenant API listens on PORT (defaults to 3001 in src/main.ts), binds 0.0.0.0.
EXPOSE 3001
CMD ["node", "dist/main.js"]
