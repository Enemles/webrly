# Webrly - Plateforme SaaS Multitenant pour Agences

Application Next.js 14 complète avec gestion d'agences, sous-comptes, funnels, CRM et intégrations Stripe.

## 🚀 Getting Started

### Installation locale

```bash
# Clone et installation
git clone https://github.com/Enemles/webrly.git
cd webrly
pnpm install

# Configuration environnement
cp env.example .env
# Editer .env avec vos secrets

# Base de données
docker-compose up -d  # PostgreSQL
pnpm db:push         # Schéma Prisma

# Développement
pnpm dev
# → http://localhost:3000
```

### Scripts disponibles

```bash
pnpm dev              # Serveur de développement
pnpm build            # Build production
pnpm start            # Serveur production
pnpm lint             # ESLint
pnpm test:run         # Tests unitaires (Vitest)
pnpm test:e2e         # Tests E2E (Playwright)
pnpm test:coverage    # Couverture de tests
```

## 🔧 Stack Technique

### Frontend & Backend
- **Next.js 14**: App Router, Server Components, performances optimisées
- **TypeScript**: Typage fort, productivité développeur
- **Tailwind CSS + shadcn/ui**: Design system rapide et cohérent
- **React Beautiful DnD**: Interactions drag & drop pour pipelines et tickets

### Base de données & ORM
- **PostgreSQL 14+**: Base de données principale
- **Prisma**: ORM avec migrations, typage automatique et requêtes optimisées

### Authentification & Paiements
- **Clerk**: Authentification complète (sign-up, sign-in, gestion utilisateurs)
- **Stripe**: Abonnements, paiements uniques, webhooks, marketplace
- **Uploadthing**: Gestion des uploads sécurisés côté frontend

### Monitoring & Qualité
- **Sentry**: Observabilité applicative et suivi des erreurs
- **Vitest**: Tests unitaires rapides
- **Playwright**: Tests end-to-end des parcours critiques
- **GitHub Actions**: CI/CD automatisé (lint, tests, builds)

## 📚 Documentation Technique (C2.4.1)

### 9.1 Manuel de déploiement

#### Prérequis
- **Docker**: 24+ (option VPS Docker)
- **Node.js**: 20+ et **pnpm** 9+ (option VPS sans Docker)
- **Base de données**: PostgreSQL 14+ accessible (avec `DATABASE_URL`)
- **Secrets/variables** à provisionner côté Coolify ou VPS:
  - **Auth/Users**: `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - **Stripe**: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_CLIENT_ID`
  - **Uploadthing**: `UPLOADTHING_SECRET`, `UPLOADTHING_APP_ID`, `UPLOADTHING_TOKEN`
  - **App**: `NEXT_PUBLIC_DOMAIN`, `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_SCHEME`
  - **Billing config**: `NEXT_PUBLIC_PLATFORM_AGENY_PERCENT`, `NEXT_PUBLIC_PLATFORM_ONETIME_FEE`, `NEXT_PUBLIC_PLATFORM_SUBSCRIPTION_PERCENT`, `NEXT_WEBRLY_PRODUCT_ID`
  - **DB**: `DATABASE_URL`

#### Déploiement via Coolify (UI)
- **Connecter le repo GitHub** à Coolify, créer un service "Application"
- **Builder**: Nixpacks (auto), branche `main` (ou `develop` pour staging)
- **Variables d'environnement**: créer les clés ci‑dessus dans l'onglet "Environment"
- **Healthcheck**: définir `/api/health` (optionnel) et activer le check de démarrage
- **Déployer**: Run Deploy. Surveiller logs; valider avec:
  ```bash
  curl -fL https://webrly.fr/api/health
  ```
- **Webhook Stripe**: reconfigurer l'URL si domaine changé

#### Déploiement sur VPS (Seulement un exemple avec Docker car non mis en place)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["pnpm","start"]
```

Build & run:
```bash
docker build -t webrly:latest .
docker run -d --name webrly -p 3000:3000 --env-file .env webrly:latest
curl -f http://localhost:3000/api/health
```

VPS sans Docker (systemd/PM2):
```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

### 9.2 Manuel d'utilisation

#### 1. Inscription et création d'une agence
- Rendez-vous sur la page d'accueil de la plateforme
- Cliquez sur "S'inscrire" pour créer un compte
- Une fois connecté, vous serez invité à créer votre agence : renseignez les informations demandées (nom, coordonnées, etc.)
- Après validation, vous serez redirigé vers le tableau de bord de l'agence

#### 2. Navigation dans le tableau de bord
- Le menu latéral (sidebar) est dynamique et personnalisé selon votre agence
- Utilisez la barre de recherche pour filtrer les options du menu
- Accédez à la section "Launchpad" pour démarrer l'onboarding de votre agence

#### 3. Connexion à Stripe
- Depuis le tableau de bord, lancez le processus d'onboarding Stripe
- Deux options : créer un nouveau compte Stripe ou connecter un compte existant
- Une fois connecté, vous revenez sur la plateforme : un indicateur bleu confirme la réussite de la connexion
- Stripe permet :
  - De facturer les abonnements mensuels à vos clients
  - De connecter le compte Stripe de chaque utilisateur
  - De prélever des frais de plateforme sur chaque transaction, y compris sur les sous-comptes

#### 4. Gestion des abonnements et produits additionnels
- Accédez à la page "Facturation" via le menu
- Choisissez un plan payant pour débloquer des fonctionnalités premium
- Souscrivez à des produits additionnels (add-ons) pour enrichir votre offre
- Cliquez sur "Mettre à niveau" pour ouvrir un formulaire Stripe personnalisé et finaliser le paiement
- Visualisez vos abonnements et transactions dans le tableau récapitulatif

#### 5. Création et gestion des sous-comptes
- Depuis le tableau de bord, cliquez sur "Sous-comptes" ou utilisez le menu déroulant
- Créez un sous-compte pour chaque client de votre agence
- Un formulaire s'ouvre pour renseigner les informations du sous-compte
- Chaque sous-compte dispose de ses propres fonctionnalités : gestion des médias, contacts, pipelines, etc.
- Vous pouvez inviter des membres de l'équipe et leur attribuer des droits d'accès spécifiques à chaque sous-compte

#### 6. Gestion des membres et des accès
- Invitez des collaborateurs par email pour qu'ils rejoignent votre agence sur Plura
- Définissez les niveaux d'accès de chaque membre (par sous-compte)
- Les membres invités voient une page "non autorisé" tant que vous ne leur avez pas donné accès

#### 7. Fonctionnalités principales des sous-comptes
- **Média** : chaque sous-compte possède un espace de stockage pour les images et fichiers
- **Contacts** : suivez les leads générés via les sites/funnels
- **Pipelines** : créez des tableaux de type "kanban" pour gérer les processus commerciaux
- **Sites et Funnels** : créez et hébergez des sites/funnels sur des sous-domaines personnalisés
- **Synchronisation Stripe** : chaque sous-compte peut connecter son propre Stripe pour vendre ses produits

#### 8. Personnalisation et expérience utilisateur
- Interface responsive : visualisez votre site sur différents formats d'écran
- Mode clair/sombre disponible
- Notifications centralisées dans la barre de navigation
- Possibilité d'annuler/rétablir les actions dans l'éditeur de site

### 9.3 Manuel de mise à jour

#### Stratégie Git
- Flux: `feature/*` → PR vers `develop` → merge → PR vers `main` (release)
- Protection de branches et revues requises

#### Versioning & changelog (standard-version)
Générer une release:
```bash
pnpm add -g standard-version
# patch | minor | major
standard-version --release-as patch
git push --follow-tags origin <votre-branche>
```

Workflow `changelog-release.yml` sur `main` crée le tag et la Release GitHub avec extrait du `CHANGELOG.md`.

#### Procédure de rollback
- **Code/app**:
  - UI Coolify: redeployer la **version précédente** (image précédente) depuis l'historique déploiements
  - Git: `git revert <sha>` sur `main` puis redeploy via Coolify
- **Base de données**:
  - Si une migration Prisma a cassé la prod, restaurer un **backup DB** le plus récent
  - Alternative avancée: marquer une migration comme appliquée/ignorée et re-déployer, puis appliquer un hotfix correctif
- Vérification post‑rollback:
  ```bash
  curl -fL https://votre-domaine.tld/api/health
  # Valider parcours critique (auth, funnel, paiement)
  ```

### 9.4 Stack technique & choix technos
- **Next.js 14**: App Router, performances, écosystème
- **Prisma + PostgreSQL**: productivité, typage fort, migrations
- **Tailwind CSS + shadcn/ui**: vitesse de dev, design system réutilisable
- **React Beautiful DnD**: interactions drag & drop (pipelines, tickets)
- **Uploadthing**: gestion des uploads côté frontend avec sécurité
- **Stripe**: abonnements, paiements, webhooks
- **Clerk**: authentification prête à l'emploi
- **Sentry**: observabilité applicative
- **Vitest + Playwright**: TU rapides et E2E de parcours critiques

## 🔧 MCO - Maintenance en Condition Opérationnelle

Ce projet implémente une stratégie MCO complète pour assurer la disponibilité et la performance en production.

### 📊 Monitoring & Alertes
- **Stack** : Prometheus + Grafana + Alertmanager
- **Métriques** : Application, infrastructure et business
- **Santé** : Endpoint `/api/health` pour monitoring externe
- **Alertes** : Notifications automatiques Slack/Discord

### 🐛 Gestion des incidents
- **Templates** : Issues GitHub standardisées par sévérité
- **Escalade** : Processus automatisé P0 → P3
- **Logging** : Structuré avec contexte métier
- **Tracking** : Intégration Sentry pour les erreurs

### 📚 Documentation MCO
- [📋 Plan d'action MCO](docs/MCO_PLAN_ACTION.md) - État des lieux et roadmap
- [🚀 Quick Wins implémentés](docs/MCO_QUICK_WINS.md) - Améliorations immédiates
- [📊 Monitoring Setup](monitoring/README.md) - Configuration Prometheus/Grafana
- [🔍 Tests & QA](docs/TESTING.md) - Stratégie de tests automatisés

### 🚨 Signaler un incident
1. Utiliser les [templates GitHub](.github/ISSUE_TEMPLATE/)
2. Sélectionner le bon type (Bug/Feature/Incident)
3. Suivre le processus d'escalade documenté
4. Consulter le dashboard Grafana pour le diagnostic

### 📈 Métriques cibles
- **Disponibilité** : 99.5% SLO
- **Performance** : <200ms P95 API
- **MTTR** : <1h pour incidents critiques
- **Détection** : 90% automatique

## 🧪 Tests & CI/CD

### Tests automatisés
- **Tests unitaires** : Vitest pour logique métier et services
- **Tests E2E** : Playwright pour parcours utilisateur critiques
- **Couverture** : Objectif 70% minimum

### Workflows GitHub Actions
- **quality-check.yml** : Lint, TypeScript, audit sécurité, build, E2E (sur PR)
- **unit-tests.yml** : Tests unitaires avec rapport de couverture
- **performance-accessibility.yml** : Lighthouse et audit accessibilité
- **dependency-update.yml** : Mise à jour automatique des dépendances
- **changelog-release.yml** : Génération changelog et releases

### Déploiement
- **Développement** : Auto-deploy sur Coolify depuis `develop`
- **Production** : Deploy manuel via UI Coolify depuis `main`
- **Rollback** : Gestion des versions précédentes via Coolify

## 📄 Licence

MIT License - voir [LICENSE](LICENSE) pour plus de détails.
