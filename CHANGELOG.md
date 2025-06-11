# Changelog

Tous les changements notables de ce projet seront documentés dans ce fichier.


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
