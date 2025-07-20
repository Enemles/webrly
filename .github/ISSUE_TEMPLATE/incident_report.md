---
name: 🚨 Incident Production
about: Signaler un incident critique en production
title: '[INCIDENT] '
labels: ['incident', 'critical', 'production']
assignees: ''
---

## 🚨 INCIDENT CRITIQUE
**⚠️ Pour les incidents critiques, contactez directement l'équipe via Discord/Slack**

## 📊 Niveau de sévérité
- [ ] **P0 - Critique**: Service indisponible, perte de données
- [ ] **P1 - Majeur**: Fonctionnalité principale cassée
- [ ] **P2 - Mineur**: Fonctionnalité secondaire impactée
- [ ] **P3 - Cosmétique**: Problème visuel/UX

## 🕐 Informations temporelles
- **Détection**: [YYYY-MM-DD HH:MM UTC]
- **Début estimé**: [YYYY-MM-DD HH:MM UTC]
- **Durée**: [estimation ou durée réelle]

## 🎯 Impact
- **Services affectés**: 
- **Utilisateurs impactés**: [nombre/pourcentage]
- **Fonctionnalités cassées**:
  - [ ] Authentification
  - [ ] Paiements Stripe
  - [ ] Dashboard agences
  - [ ] Gestion funnels
  - [ ] API metrics
  - [ ] Autre: _______

## 🔍 Symptômes observés
Description détaillée de ce qui ne fonctionne pas.

## 📊 Métriques/Logs
```
Collez ici les logs pertinents, erreurs console, métriques Prometheus, etc.
```

## 🛠 Actions immédiates prises
- [ ] Rollback vers version précédente
- [ ] Redémarrage services
- [ ] Notification équipe
- [ ] Communication clients
- [ ] Autre: _______

## 🔧 Solution temporaire (workaround)
Si une solution de contournement existe.

## 📝 Post-mortem requis
- [ ] Oui - incident majeur
- [ ] Non - incident mineur

## 📞 Escalade
- **Niveau 1**: Équipe dev
- **Niveau 2**: Tech lead + Product
- **Niveau 3**: Management + External
