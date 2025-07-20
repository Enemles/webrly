This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

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
