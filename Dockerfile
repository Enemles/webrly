# syntax=docker/dockerfile:1

# Image Docker de prod (build pack « Dockerfile » de Coolify).
# Node épinglé au correctif près (garder .nvmrc aligné) : Nixpacks (NIXPACKS_NODE_VERSION=22) ne permet
# pas de choisir le patch et donnait 22.19.0. Debian bookworm = glibc.
ARG NODE_IMAGE=node:22.23.4-bookworm-slim
# Même majeure de pnpm que la CI (.github/actions/setup-environment) et le lockfile.
ARG PNPM_VERSION=9.15.9

# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS base
ARG PNPM_VERSION
ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# openssl : Prisma s'en sert pour détecter libssl 3 et choisir le bon moteur
# (debian-openssl-3.0.x) ; il est absent de l'image slim.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
RUN corepack enable pnpm \
 && corepack install --global "pnpm@${PNPM_VERSION}"
WORKDIR /app

# --- Dépendances (couche mise en cache tant que le lockfile ne bouge pas) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# Le postinstall lance `prisma generate`, qui a besoin du schéma.
COPY prisma ./prisma
# NODE_ENV forcé : Coolify injecte ses variables de build en ARG après chaque
# FROM ; un NODE_ENV=production ferait sauter les devDependencies (typescript…)
# nécessaires au build (même parade que la CI).
RUN NODE_ENV=development pnpm install --frozen-lockfile

# --- Build Next.js (output: 'standalone') -----------------------------------
FROM base AS builder
# Variables NEXT_PUBLIC_* : inlinées dans le bundle au build, elles doivent être
# présentes ici. Coolify injecte aussi ses variables de build en ARG (y compris
# SENTRY_AUTH_TOKEN pour l'upload des source maps s'il est défini).
ARG NEXT_PUBLIC_URL \
    NEXT_PUBLIC_DOMAIN \
    NEXT_PUBLIC_SCHEME \
    NEXT_PUBLIC_APP_VERSION \
    NEXT_PUBLIC_DEMO_MODE \
    NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY \
    NEXT_PUBLIC_CLERK_SIGN_IN_URL \
    NEXT_PUBLIC_CLERK_SIGN_UP_URL \
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL \
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_PUBLIC_STRIPE_CLIENT_ID \
    NEXT_PUBLIC_PLATFORM_AGENY_PERCENT \
    NEXT_PUBLIC_PLATFORM_ONETIME_FEE \
    NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN NODE_ENV=production pnpm build

# --- Runtime minimal ---------------------------------------------------------
FROM ${NODE_IMAGE} AS runner
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Utilisateur non root `node` (uid 1000) fourni par l'image officielle. Il doit
# posséder .next/ pour écrire le cache de l'optimiseur d'images (.next/cache).
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node

EXPOSE 3000

# Healthcheck de vivacité sans curl/wget (absents de l'image slim). Coolify
# utilise le HEALTHCHECK de l'image à la place de celui du dashboard.
# /favicon.ico : fichier avec extension, donc hors matcher du middleware (pas de
# réécriture multi-tenant selon le Host) et sans appel DB/Stripe/UploadThing.
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD ["node", "-e", "require('http').get({host:'127.0.0.1',port:process.env.PORT||3000,path:'/favicon.ico',timeout:4000},r=>process.exit(r.statusCode<500?0:1)).on('timeout',()=>process.exit(1)).on('error',()=>process.exit(1))"]

CMD ["node", "server.js"]
