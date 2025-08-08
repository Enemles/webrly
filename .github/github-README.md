# 🚀 CI/CD Pipeline - Webrly

Cette documentation décrit les workflows CI/CD mis en place pour garantir la qualité et la sécurité du projet Webrly.

## 🎯 Pourquoi cette CI/CD ?

Cette pipeline CI/CD automatise tous les aspects critiques de votre projet :

- **🛡️ Qualité** : Vérifie automatiquement le code, les types, et les standards
- **🚀 Tests** : S'assure que toutes les fonctionnalités marchent avec des tests E2E
- **⚡ Performance** : Surveille que votre app reste rapide et accessible
- **🔒 Sécurité** : Détecte et alerte sur les vulnérabilités
- **📦 Maintenance** : Met à jour automatiquement les dépendances
- **🏗️ Déploiement** : Déploie automatiquement quand tout est OK
- **📝 Documentation** : Génère automatiquement releases et changelogs

**Résultat :** Vous vous concentrez sur le code, la CI s'occupe du reste !

## 📋 Vue d'ensemble des workflows

### 1. ✅ Contrôle Qualité (`quality-check.yml`)

**À quoi ça sert :**
Ce workflow vérifie la qualité du code à chaque modification. Il garantit que votre code respecte les standards, compile correctement, et que toutes les fonctionnalités principales fonctionnent avant de merger.

**Déclencheurs :**
- À chaque Pull Request vers `main` ou `develop`
- À chaque push sur `develop`

**✅ CONFIGURÉ AVEC SECRETS PRODUCTION & ACTION COMPOSITE**

**Jobs :**
- 🔍 **Analyse du code** : 
  - ESLint pour la qualité du code
  - Vérification TypeScript pour les erreurs de types
  - Audit de sécurité des dépendances
- 🏗️ **Test de construction** : 
  - Build de l'application Next.js
  - Vérification que Prisma génère correctement
  - Analyse de la taille du bundle
- 🧪 **Tests E2E** : 
  - Tests automatisés avec Playwright
  - Screenshots en cas d'échec pour débugger
  - Tests sur les vraies fonctionnalités utilisateur
- 📋 **Résumé** : 
  - Rapport consolidé de tous les résultats
  - Métriques et statistiques centralisées

**Durée estimée :** 8-12 minutes

### 2. 🚀 Performance & Accessibilité (`performance-accessibility.yml`)

**À quoi ça sert :**
Ce workflow surveille la performance et l'accessibilité de votre application. Il garantit que votre site reste rapide et accessible à tous les utilisateurs, avec des métriques objectives et des seuils de qualité.

**Déclencheurs :**
- À chaque push sur `main`
- Tous les dimanche à 02:00 UTC (programmé)
- Manuellement via `workflow_dispatch`

**✅ CONFIGURÉ AVEC ENVIRONNEMENT PRODUCTION & ACTION COMPOSITE**

**Jobs :**
- 🏮 **Tests Lighthouse** : 
  - Mesure les Core Web Vitals (performance)
  - Teste l'accessibilité (WCAG guidelines)
  - Analyse SEO et bonnes pratiques
  - Génère des rapports détaillés avec recommandations
- 🔒 **Audit de sécurité** : 
  - Scan complet des vulnérabilités de sécurité
  - Vérification des headers de sécurité
  - Test des dépendances obsolètes
- ♿ **Tests d'accessibilité** : 
  - Tests automatisés avec axe-core
  - Vérification des contrastes de couleurs
  - Tests de navigation au clavier

**Durée estimée :** 15-20 minutes

### 3. 🚀 Déploiement Production (`deploy-production.yml`) **NOUVEAU**

**À quoi ça sert :**
Ce workflow gère le déploiement automatique de votre application en production. Il s'assure que toutes les vérifications sont passées avant de déployer et peut revenir en arrière automatiquement en cas de problème.

**Déclencheurs :**
- À chaque push sur `main`
- Manuellement via `workflow_dispatch`

**🔒 UTILISE L'ENVIRONNEMENT PRODUCTION AVEC TOUS VOS SECRETS & ACTION COMPOSITE**

**Jobs :**
- 🔒 **Vérifications de sécurité** : 
  - Audit de sécurité complet avant déploiement
  - Vérification des secrets et variables d'environnement
  - Scan des vulnérabilités critiques
- 🏗️ **Build et Tests** : 
  - Build de production avec optimisations
  - Tests E2E sur l'environnement de production
  - Vérification de l'intégrité de l'application
- 🚀 **Déploiement** : 
  - Déploiement avec les vraies variables de production
  - Configuration automatique de l'environnement
  - Tests de santé post-déploiement
- 🔄 **Rollback** : 
  - Rollback automatique si les tests échouent
  - Conservation des versions précédentes
  - Notifications en cas de problème

**Durée estimée :** 15-20 minutes

### 4. 🔄 Mise à jour des dépendances (`dependency-update.yml`)

**À quoi ça sert :**
Ce workflow maintient automatiquement vos dépendances à jour et surveille les vulnérabilités de sécurité. Il évite l'accumulation de dette technique et garantit que votre projet reste sécurisé.

**Déclencheurs :**
- Tous les lundi à 09:00 UTC (programmé)
- Manuellement via `workflow_dispatch`

**✅ CONFIGURÉ AVEC ACTION COMPOSITE**

**Jobs :**
- 📦 **Mise à jour des dépendances** : 
  - Détecte les nouvelles versions disponibles
  - Met à jour automatiquement les versions patch et minor
  - Teste la compatibilité (lint, types, build)
  - Crée une PR avec toutes les informations
- 🔒 **Audit de sécurité** : 
  - Scanne toutes les dépendances pour des vulnérabilités
  - Génère un rapport hebdomadaire de sécurité
  - Utilise pnpm audit et Snyk si disponible

**Durée estimée :** 5-8 minutes

### 5. 📦 Changelog et Release (`changelog-release.yml`)

**À quoi ça sert :**
Ce workflow automatise la création de versions et la documentation des changements. Il génère automatiquement un changelog basé sur vos commits et crée des releases GitHub professionnelles.

**Déclencheurs :**
- À chaque push sur `main`
- Manuellement avec choix du type de release (patch, minor, major)

**✅ CONFIGURÉ AVEC ACTION COMPOSITE**

**Fonctionnalités :**
- **Génération automatique du changelog** :
  - Analyse des commits depuis la dernière version
  - Catégorisation automatique (features, fixes, breaking changes)
  - Formatting professionnel Markdown
- **Création de releases GitHub** :
  - Tags automatiques avec versioning sémantique
  - Notes de release détaillées
  - Assets de release (si configurés)
- **Support du versioning sémantique** :
  - Patch : corrections de bugs (1.0.1)
  - Minor : nouvelles fonctionnalités (1.1.0)
  - Major : changements majeurs (2.0.0)

## 🎯 Seuils de qualité

### Performance (Lighthouse)
- **Performance** : ≥ 70% (warning)
- **Accessibilité** : ≥ 90% (error)
- **Bonnes pratiques** : ≥ 80% (warning)
- **SEO** : ≥ 80% (warning)

### Tests
- **Couverture E2E** : Tous les tests doivent passer
- **Build** : Doit se construire sans erreur
- **Linting** : Aucune erreur ESLint
- **TypeScript** : Aucune erreur de type

## 🔧 Configuration locale

Pour reproduire les tests en local :

```bash
# Tests de qualité du code
pnpm lint
npx tsc --noEmit
pnpm audit --audit-level moderate

# Build
pnpm build

# Tests E2E
pnpm test:e2e

# Tests de performance
npm install -g @lhci/cli
lhci autorun
```

## 📊 Rapports et artefacts

Les workflows génèrent plusieurs types de rapports :

- **Playwright reports** : Rapports détaillés des tests E2E
- **Lighthouse reports** : Métriques de performance et accessibilité
- **Accessibility reports** : Résultats des tests d'accessibilité
- **Security reports** : Audits de sécurité des dépendances

Tous les rapports sont disponibles dans les artifacts de chaque run.

## 🎪 Notifications et monitoring

### Statuts des checks
- ✅ **Succès** : Tous les contrôles passent
- ⚠️ **Warning** : Certains seuils ne sont pas atteints
- ❌ **Échec** : Erreurs critiques détectées

### Pull Requests automatiques
- **Dépendances** : Mise à jour hebdomadaire automatique
- **Sécurité** : Corrections de vulnérabilités critiques

## 🔍 Dépannage

### Échecs fréquents

1. **Tests E2E échouent**
   - Vérifier que toutes les variables d'environnement sont définies
   - S'assurer que le serveur démarre correctement
   - Vérifier les timeouts

2. **Build échoue**
   - Vérifier les erreurs TypeScript
   - S'assurer que Prisma génère le client correctement
   - Vérifier les variables d'environnement requises

3. **Tests Lighthouse échouent**
   - Vérifier que l'application répond sur localhost:3000
   - Contrôler les métriques de performance
   - Optimiser les images et ressources

### Commandes utiles

```bash
# Débugger les tests localement
pnpm test:e2e:debug

# Voir les métriques de performance
pnpm test:e2e:ui

# Analyser le bundle
pnpm build && npx @next/bundle-analyzer
```

## 🤝 Contribution

Avant de soumettre une PR :

1. Vérifier que tous les tests passent en local
2. S'assurer que le code respecte les standards de linting
3. Tester les fonctionnalités principales manuellement
4. Mettre à jour la documentation si nécessaire

---

📝 **Note** : Cette CI/CD est conçue pour un projet de fin d'année et couvre tous les aspects importants : qualité du code, tests, performance, accessibilité et sécurité. 