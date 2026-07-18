# syntax=docker/dockerfile:1
# ARA Tasks — tenant web dashboard (Next.js 16, standalone output).
# Monorepo-aware multi-stage build (turbo prune + pnpm). Build context = repo root
# (see docker-compose.yml, service: web).

# Base: Node 24 LTS (24.18.0) on Debian bookworm-slim, pinned by digest. pnpm via Corepack.
FROM node:24-bookworm-slim@sha256:6f7b03f7c2c8e2e784dcf9295400527b9b1270fd37b7e9a7285cf83b6951452d AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app

# Stage 1 — prune the workspace down to @ara/web and its dependency graph.
FROM base AS pruner
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm dlx turbo@2.10.5 prune @ara/web --docker

# Stage 2 — install (cached on the lockfile) then build the standalone bundle.
FROM base AS installer
COPY --from=pruner /app/out/json/ ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ ./
# turbo builds @ara/types + @ara/ui first (^build), then next build → .next/standalone.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm exec turbo run build --filter=@ara/web

# Stage 3 — minimal runtime. Next standalone server, non-root.
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs --home-dir /app nextjs
WORKDIR /app
# standalone/ replicates the monorepo tree rooted here (→ /app/apps/web/server.js
# + /app/node_modules + traced /app/packages/@ara/*). Static assets copied alongside.
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
