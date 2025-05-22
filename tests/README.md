# Tests End-to-End avec Playwright

Ce répertoire contient les tests end-to-end pour l'application Webrly, utilisant [Playwright](https://playwright.dev/).

## Structure des tests

- `homepage.spec.ts` : Tests de la page d'accueil
- `auth.spec.ts` : Tests des fonctionnalités d'authentification
- `agency-dashboard.spec.ts` : Tests du tableau de bord de l'agence

## Exécution des tests

### Tests locaux

```bash
# Exécuter tous les tests
pnpm test:e2e

# Exécuter les tests avec l'interface utilisateur Playwright
pnpm test:e2e:ui

# Exécuter les tests en mode debug
pnpm test:e2e:debug

# Exécuter un fichier de test spécifique
npx playwright test auth.spec.ts
```

### Configuration du CI

Les tests sont exécutés automatiquement :
- À chaque pull request vers la branche `develop`
- À chaque merge sur la branche `develop`

## Configuration des tests

La configuration de Playwright se trouve dans `playwright.config.ts` à la racine du projet. Les tests s'exécutent sur plusieurs navigateurs et appareils :

- Desktop Chrome
- Desktop Firefox
- Desktop Safari
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## Authentification et état

Pour les tests nécessitant une authentification, nous utilisons une approche de mock dans les tests. Dans un environnement de production, il serait recommandé de configurer proprement l'authentification Clerk pour les tests.

## Bonnes pratiques

1. Garder les tests indépendants les uns des autres
2. Utiliser des sélecteurs stables et fiables
3. Éviter les délais d'attente fixes, privilégier les attentes conditionnelles
4. Tester les fonctionnalités essentielles de l'application

## Remarques

Ces tests sont une base de départ et devront être adaptés en fonction de l'évolution de l'application. 