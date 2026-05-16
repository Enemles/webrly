# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.


### [2.13.7](https://github.com/Enemles/webrly/compare/v2.13.6...v2.13.7) (2026-05-16)


### Bug Fixes

* webrly logo placeholder + per-boutique color palettes + team assignments ([dc0c4f9](https://github.com/Enemles/webrly/commit/dc0c4f91c9eee8239b5758440d0ad8ed850f347a))

### [2.13.6](https://github.com/Enemles/webrly/compare/v2.13.5...v2.13.6) (2026-05-16)


### Bug Fixes

* **billing:** guard charges.list quand customerId vide + ajoute script seed charges ([6d5377c](https://github.com/Enemles/webrly/commit/6d5377caae32efc3ccfc680e63584448eda138a4))

### [2.13.5](https://github.com/Enemles/webrly/compare/v2.13.4...v2.13.5) (2026-05-16)


### Bug Fixes

* **billing:** skip charges.list quand l'agence n'a pas de customerId Stripe ([474512a](https://github.com/Enemles/webrly/commit/474512ab86c8a56b0d7556d569b646a8cb820e65))
* **demo:** logos via ui-avatars + placehold.co (whitelistés) ([8506229](https://github.com/Enemles/webrly/commit/8506229587952907ce4c4bd34057c9d40c10e2f0))

### [2.13.4](https://github.com/Enemles/webrly/compare/v2.13.3...v2.13.4) (2026-05-16)

### [2.13.3](https://github.com/Enemles/webrly/compare/v2.13.2...v2.13.3) (2026-05-16)


### Bug Fixes

* **middleware:** expose /api/health en public pour le healthcheck Coolify ([16f7996](https://github.com/Enemles/webrly/commit/16f79966fa6847c89d811d8a515f1c7a5f4a73e2))

### [2.13.2](https://github.com/Enemles/webrly/compare/v2.13.1...v2.13.2) (2026-05-16)


### Bug Fixes

* **site:** force dynamic rendering pour éviter prerender Stripe/DB ([35c363b](https://github.com/Enemles/webrly/commit/35c363b3ad7fe59afdb11258774654a0be6f2cb9))

### [2.13.1](https://github.com/Enemles/webrly/compare/v2.13.0...v2.13.1) (2026-05-16)


### Bug Fixes

* **logger-demo:** échappement apostrophe pour passer le build ([153792b](https://github.com/Enemles/webrly/commit/153792bf1d6a6ab18d3bd3a5bfb324841e29dcbf))

## [2.13.0](https://github.com/Enemles/webrly/compare/v2.12.1...v2.13.0) (2025-09-15)


### Features

* Ajout d'une page de démonstration pour le logger et mise à jour du README ([544bae9](https://github.com/Enemles/webrly/commit/544bae99c3b4bbd928da034cf78cabffbce715fb))
* Amélioration de la validation des invitations et gestion des erreurs ([fe7cfbd](https://github.com/Enemles/webrly/commit/fe7cfbdad3f3e039a9155dca9d7b7ea1926aa146))

### [2.12.1](https://github.com/Enemles/webrly/compare/v2.12.0...v2.12.1) (2025-08-08)

## [2.12.0](https://github.com/Enemles/webrly/compare/v2.11.0...v2.12.0) (2025-08-08)


### Features

* Rename of readme in .github ([f6b0958](https://github.com/Enemles/webrly/commit/f6b095838a6620c771dd65814d79f3a05f26460b))

## [2.11.0](https://github.com/Enemles/webrly/compare/v2.10.0...v2.11.0) (2025-08-08)


### Features

* Mise à jour du README et suppression des workflows CI/CD ([18f717f](https://github.com/Enemles/webrly/commit/18f717fb8831a1e00caa90a5234913480c902d8c))
* Update monitoring documentation with specific IP addresses for web interfaces ([84acf4a](https://github.com/Enemles/webrly/commit/84acf4aefb6d6f177a2505153e973e6e934a819a))

## [2.10.0](https://github.com/Enemles/webrly/compare/v2.9.1...v2.10.0) (2025-07-26)


### Features

* Add MCO testing scripts and documentation for production validation ([0de3e49](https://github.com/Enemles/webrly/commit/0de3e49ace44929b6fc19646a781220d98084725))
* Integrate Sentry for error tracking and monitoring ([55f5fc7](https://github.com/Enemles/webrly/commit/55f5fc76b85023c403cf08780aafd86ecb9ee6fd))

### [2.9.1](https://github.com/Enemles/webrly/compare/v2.9.0...v2.9.1) (2025-07-21)

## [2.9.0](https://github.com/Enemles/webrly/compare/v2.8.0...v2.9.0) (2025-07-21)


### Features

* Add Sentry integration for client and server configurations ([bb047fa](https://github.com/Enemles/webrly/commit/bb047fa27647f78fb3006eb05de5fa8cb97fc0b1))
* Complete MCO Short-term phase implementation ([55796fb](https://github.com/Enemles/webrly/commit/55796fb7aff0264727b50a8fc05b496094766bb5)), closes [#25](https://github.com/Enemles/webrly/issues/25)

## [2.8.0](https://github.com/Enemles/webrly/compare/v2.7.0...v2.8.0) (2025-07-20)


### Features

* **mco:** implémentation des Quick Wins MCO pour RNCP Bloc 4 ([9cbe35b](https://github.com/Enemles/webrly/commit/9cbe35bf6fa7b1232a7fcb4b0a53ac893e9c11a7))
* update module exports to ES6 syntax in PostCSS and Tailwind configuration files ([f2e8ea1](https://github.com/Enemles/webrly/commit/f2e8ea1560a60712f07eb002fdf3ba27da461b14))


### Bug Fixes

* convert postcss.config.js to ES module syntax ([172dcd0](https://github.com/Enemles/webrly/commit/172dcd087c77a3bfe34102d47dcff1c47329c89c))
* résolution complète des erreurs de build CI ([4ad784a](https://github.com/Enemles/webrly/commit/4ad784a3539da55abf82769556784bd9d26e4490))

## [2.7.0](https://github.com/Enemles/webrly/compare/v2.6.2...v2.7.0) (2025-07-20)


### Features

* add Next.js configuration and update module type in package.json; refactor path resolution in vitest config ([876d86b](https://github.com/Enemles/webrly/commit/876d86bd9bc594164177192598d73ac35561ab88))
* ajout de la configuration de l'environnement, des workflows CI/CD et des fichiers de documentation pour le projet Webrly ([f6908e0](https://github.com/Enemles/webrly/commit/f6908e01be8981a909644e904d0395fc21f950b8))
* ajout de tests unitaires dans le workflow CI/CD, mise à jour de la configuration pour exécuter les tests et générer des rapports de couverture ([43ae3ed](https://github.com/Enemles/webrly/commit/43ae3ed21310cd4f9fbb9e4497ee3a6495ff4b13))
* ajout de variables d'environnement pour les workflows CI/CD, incluant des clés de test et des configurations nécessaires pour le build et les tests ([6f0d531](https://github.com/Enemles/webrly/commit/6f0d531886aa95c3b9794d507bc31a49d6fb4227))

### [2.6.2](https://github.com/Enemles/webrly/compare/v2.6.1...v2.6.2) (2025-07-20)

### [2.6.1](https://github.com/Enemles/webrly/compare/v2.6.0...v2.6.1) (2025-06-15)


### Bug Fixes

* use correct Prometheus registry for business metrics ([20d7873](https://github.com/Enemles/webrly/commit/20d78737556c83fafa610363e5cb0662e18aabf8))

## [2.6.0](https://github.com/Enemles/webrly/compare/v2.5.0...v2.6.0) (2025-06-15)


### Features

* ajout de l'endpoint de monitoring pour la mise à jour manuelle des métriques et mise à jour du middleware pour inclure la nouvelle route publique ([b613fd5](https://github.com/Enemles/webrly/commit/b613fd5ec235b927de23e6ed8011b0da37da7854))

## [2.5.0](https://github.com/Enemles/webrly/compare/v2.4.0...v2.5.0) (2025-06-13)


### Features

* ajout de la mise à jour des métriques réelles dans les routes API et création d'un nouveau module pour gérer les métriques business ([c6550fa](https://github.com/Enemles/webrly/commit/c6550fafc814cba7f9afa087a0d88a302b5b59f6))

## [2.4.0](https://github.com/Enemles/webrly/compare/v2.3.0...v2.4.0) (2025-06-13)


### Features

* ajout de la route API pour les analyses et mise à jour du middleware pour inclure une nouvelle route publique ([b5508f6](https://github.com/Enemles/webrly/commit/b5508f6fc17b703e0f699c6c6e90ca9941f7c5ab))

## [2.3.0](https://github.com/Enemles/webrly/compare/v2.2.0...v2.3.0) (2025-06-13)


### Features

* ajout du suivi des métriques dans le middleware et mise à jour de la route API de test pour utiliser les nouvelles métriques ([5078fb2](https://github.com/Enemles/webrly/commit/5078fb2b46f793b26bf095612aa4647f914f3db9))

## [2.2.0](https://github.com/Enemles/webrly/compare/v2.1.1...v2.2.0) (2025-06-13)


### Features

* ajout de la route API pour les métriques de test et mise à jour des routes publiques dans le middleware ([f1dd866](https://github.com/Enemles/webrly/commit/f1dd866ac64f57bc3610c98881ad414d5228f7cf))

### [2.1.1](https://github.com/Enemles/webrly/compare/v2.1.0...v2.1.1) (2025-06-11)


### Bug Fixes

* **ci:** mise à jour des variables d'environnement dans les workflows pour une configuration cohérente ([6957973](https://github.com/Enemles/webrly/commit/6957973b534f6d95ea711738d3eb3f2132791872))

## [2.1.0](https://github.com/Enemles/webrly/compare/v2.0.0...v2.1.0) (2025-06-11)


### Features

* **ci:** ajout de la configuration des variables d'environnement et mise à jour des workflows pour Prisma et Playwright ([1575a18](https://github.com/Enemles/webrly/commit/1575a18656bece520fb7e9c6c0e5e137e249c115))

## 2.0.0 (2025-06-11)


### ⚠ BREAKING CHANGES

* **ci:** Introduction des conventional commits obligatoires

### Features

* ajout du monitoring Prometheus avec métriques personnalisées ([a629b18](https://github.com/Enemles/webrly/commit/a629b18b028ba39800ca1257729fb87cd3991962))
* **analytics:** extraction logique métier vers services dédiés ([1955081](https://github.com/Enemles/webrly/commit/1955081c9978adc4db75a048077ca11e313812b6))
* **api:** ajout de la route de test pour le système de changelog ([8e46d88](https://github.com/Enemles/webrly/commit/8e46d881526a86d98497528915d29111ff037a3e))
* **ci:** ajout du système de changelog automatique avec Release Please ([792265f](https://github.com/Enemles/webrly/commit/792265fc0b43df40443dc671c55d7d3d6bd6e46d))
* **ci:** migration vers standard-version pour un changelog automatique simplifié ([8b9f62c](https://github.com/Enemles/webrly/commit/8b9f62c0ac2ad7405be3b6d80fa6c6ac398d7be3))
* test du système de changelog automatique ([877240b](https://github.com/Enemles/webrly/commit/877240b0737bfd56a6bcdca9b40f64547283686b))


### Bug Fixes

* **ci:** configuration pnpm et Node.js 20.11.1 pour le workflow de release ([d925baa](https://github.com/Enemles/webrly/commit/d925baaebc32f660efd3968454a0cd9a18ef18b1))
* **ci:** correction des permissions GitHub Actions pour Release Please ([9b6fcf9](https://github.com/Enemles/webrly/commit/9b6fcf91b4775d6f35ab746b41762d4d468156cb))
* **ci:** correction des permissions GitHub Actions pour Release Please ([ba590e0](https://github.com/Enemles/webrly/commit/ba590e01b3ad42b83266b92a85c36ebccfe22227))
* **ci:** migration vers googleapis/release-please-action avec auto-merge ([80f5695](https://github.com/Enemles/webrly/commit/80f5695f318464af55307208cf32589a6eb719c7))
* **ci:** mise à jour des permissions et version de Node.js dans le workflow Release Please ([fc9967b](https://github.com/Enemles/webrly/commit/fc9967bef9727e2b8817bcc1db92cdf55b071c63))

## 1.0.0 (2025-06-11)


### ⚠ BREAKING CHANGES

* **ci:** Introduction des conventional commits obligatoires

### Features

* ajout du monitoring Prometheus avec métriques personnalisées ([a629b18](https://github.com/Enemles/webrly/commit/a629b18b028ba39800ca1257729fb87cd3991962))
* **analytics:** extraction logique métier vers services dédiés ([1955081](https://github.com/Enemles/webrly/commit/1955081c9978adc4db75a048077ca11e313812b6))
* **api:** ajout de la route de test pour le système de changelog ([8e46d88](https://github.com/Enemles/webrly/commit/8e46d881526a86d98497528915d29111ff037a3e))
* **ci:** ajout du système de changelog automatique avec Release Please ([792265f](https://github.com/Enemles/webrly/commit/792265fc0b43df40443dc671c55d7d3d6bd6e46d))
* test du système de changelog automatique ([877240b](https://github.com/Enemles/webrly/commit/877240b0737bfd56a6bcdca9b40f64547283686b))
* test du système de changelog automatique ([877240b](https://github.com/Enemles/webrly/commit/877240b0737bfd56a6bcdca9b40f64547283686b))


### Bug Fixes

* **ci:** correction des permissions GitHub Actions pour Release Please ([9b6fcf9](https://github.com/Enemles/webrly/commit/9b6fcf91b4775d6f35ab746b41762d4d468156cb))
* **ci:** correction des permissions GitHub Actions pour Release Please ([9b6fcf9](https://github.com/Enemles/webrly/commit/9b6fcf91b4775d6f35ab746b41762d4d468156cb))
* **ci:** correction des permissions GitHub Actions pour Release Please ([ba590e0](https://github.com/Enemles/webrly/commit/ba590e01b3ad42b83266b92a85c36ebccfe22227))

## [Unreleased]

### 🚀 Nouvelles fonctionnalités
- Monitoring Prometheus avec métriques personnalisées
- Système de changelog automatique avec Release Please

### 🐛 Corrections de bugs
- Correction du type TypeScript pour connectAccountId dans SubAccount
- Résolution du conflit Edge Runtime avec prom-client

### 📚 Documentation
- Guide complet pour le système de changelog
- Documentation du monitoring Prometheus

### 🔧 Maintenance
- Configuration Release Please
- Templates de commits conventionnels

---

*Ce changelog est maintenu automatiquement par [Release Please](https://github.com/googleapis/release-please).*
