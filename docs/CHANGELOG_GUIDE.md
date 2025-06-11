# 📋 Guide du Changelog Automatique - Webrly

Ce document explique comment fonctionne notre système de changelog automatique et comment l'utiliser.

## 🎯 Objectif

Notre système génère automatiquement :
- **Changelogs** détaillés avec toutes les modifications
- **Releases GitHub** avec notes de version
- **Versioning automatique** selon les modifications
- **Documentation des correctifs** déployés

## 📝 Convention de Commits

### Format de base
```
<type>[scope optionnel]: <description>

[corps optionnel]

[footer optionnel]
```

### Types de commits

| Type | Description | Impact version |
|------|-------------|----------------|
| `feat` | Nouvelle fonctionnalité | MINOR (1.1.0) |
| `fix` | Correction de bug | PATCH (1.0.1) |
| `perf` | Amélioration performance | PATCH (1.0.1) |
| `refactor` | Refactorisation code | PATCH (1.0.1) |
| `docs` | Documentation | PATCH (1.0.1) |
| `test` | Tests | PATCH (1.0.1) |
| `build` | Build/dépendances | PATCH (1.0.1) |
| `ci` | CI/CD | PATCH (1.0.1) |
| `chore` | Maintenance | PATCH (1.0.1) |
| `style` | Formatage | Aucun |
| `revert` | Annulation | Dépend du commit annulé |

### Breaking Changes

Pour un changement majeur incompatible (MAJOR version) :
```bash
feat!: nouvelle API incompatible avec l'ancienne

BREAKING CHANGE: L'API /old-endpoint a été supprimée
```

## 🚀 Exemples de commits

### ✅ Bons exemples
```bash
feat(auth): ajout de l'authentification à deux facteurs
fix(api): correction du timeout sur les requêtes longues
docs: mise à jour du README avec les instructions Docker
chore(deps): mise à jour de Next.js vers 14.1.0
perf(db): optimisation des requêtes Prisma
```

### ❌ Mauvais exemples
```bash
update stuff
fix bug
new feature
changes
WIP
```

## 🔄 Processus de Release

### 1. Développement
```bash
# Créer une branche feature
git checkout -b feat/nouvelle-fonctionnalité

# Faire les modifications
# ...

# Commit avec convention
git commit -m "feat(dashboard): ajout du widget analytics"
```

### 2. Pull Request
```bash
# Push de la branche
git push origin feat/nouvelle-fonctionnalité

# Créer une PR vers main
# Release Please analysera les commits
```

### 3. Merge vers main
Quand vous mergez sur `main` :

1. **Release Please** analyse les nouveaux commits
2. Si des changements nécessitent une release :
   - Crée une **Pull Request "Release"**
   - Génère le **CHANGELOG.md**
   - Propose la **nouvelle version**

### 4. Création de Release
Quand vous mergez la PR Release :

1. **Tag Git** créé automatiquement
2. **Release GitHub** publiée
3. **Déploiement automatique** (optionnel)

## 📊 Exemple de Changelog généré

```markdown
# Changelog

## [1.2.0](https://github.com/user/webrly/compare/v1.1.0...v1.2.0) (2024-01-15)

### 🚀 Nouvelles fonctionnalités

* **auth**: ajout de l'authentification à deux facteurs ([abc123](https://github.com/user/webrly/commit/abc123))
* **dashboard**: nouveau widget analytics ([def456](https://github.com/user/webrly/commit/def456))

### 🐛 Corrections de bugs

* **api**: correction du timeout sur les requêtes longues ([ghi789](https://github.com/user/webrly/commit/ghi789))
* **ui**: résolution du problème d'affichage mobile ([jkl012](https://github.com/user/webrly/commit/jkl012))

### 📚 Documentation

* mise à jour du README avec Docker ([mno345](https://github.com/user/webrly/commit/mno345))

### 🔧 Maintenance

* **deps**: mise à jour de Next.js vers 14.1.0 ([pqr678](https://github.com/user/webrly/commit/pqr678))
```

## 🛠️ Configuration Git locale

Pour utiliser le template de commit :
```bash
git config commit.template .gitmessage
```

## 📋 Checklist avant commit

- [ ] Le message suit la convention `type(scope): description`
- [ ] La description est claire et concise
- [ ] Le type correspond au changement
- [ ] Les breaking changes sont marqués avec `!` ou `BREAKING CHANGE:`

## 🚨 Validation compétence

Ce système valide la compétence en documentant :

✅ **Journal de version** : CHANGELOG.md automatique  
✅ **Améliorations** : Nouvelles fonctionnalités tracées  
✅ **Anomalies corrigées** : Bugs fixes documentés  
✅ **Correctifs déployés** : Releases avec détails  

## 🔧 Commandes utiles

```bash
# Voir l'historique des releases
git tag --sort=-version:refname

# Voir les commits depuis la dernière release
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Valider un message de commit
npx commitlint --from HEAD~1 --to HEAD --verbose
```

## 📞 Support

En cas de problème avec les releases :
1. Vérifier que les commits suivent la convention
2. Regarder les GitHub Actions pour les erreurs
3. Consulter les logs Release Please
4. Contacter l'équipe DevOps si besoin 