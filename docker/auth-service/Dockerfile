# Dockerfile pour Auth Service
FROM node:20-alpine AS base

# Installation des dépendances nécessaires
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Installation de pnpm
RUN npm install -g pnpm

# Copie des fichiers de dépendances
COPY package.json pnpm-lock.yaml ./
COPY packages/auth-service/package.json ./packages/auth-service/
COPY packages/shared ./packages/shared

# Installation des dépendances
RUN pnpm install --frozen-lockfile

# Construction de l'image de développement
FROM base AS dev
COPY packages/auth-service ./packages/auth-service
WORKDIR /app/packages/auth-service
CMD ["pnpm", "dev"]

# Construction de l'image de production
FROM base AS builder
COPY packages/auth-service ./packages/auth-service
WORKDIR /app/packages/auth-service
RUN pnpm build

# Image de production finale
FROM node:20-alpine AS runner
WORKDIR /app

# Création d'un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 authservice

# Installation de pnpm
RUN npm install -g pnpm

# Copie des fichiers nécessaires
COPY --from=builder --chown=authservice:nodejs /app/packages/auth-service/dist ./
COPY --from=builder --chown=authservice:nodejs /app/packages/auth-service/package.json ./package.json
COPY --from=builder --chown=authservice:nodejs /app/node_modules ./node_modules

USER authservice

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "index.js"] 