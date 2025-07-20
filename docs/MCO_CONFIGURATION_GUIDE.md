# 🔧 Guide de Configuration MCO - Étape par Étape

Ce guide vous accompagne dans la configuration progressive des outils MCO selon vos besoins et ressources.

---

## 🚦 Phase 1 : Configuration de base (Immédiate - Gratuit)

### ✅ Ce qui fonctionne déjà sans configuration

**Logging structuré :**
```typescript
import { logger } from '@/lib/utils';

// Logs automatiquement formatés
logger.info('User connected', { 
  component: 'auth', 
  userId: 'user_123' 
});
```

**Health Check :**
```bash
# Test en local
curl http://localhost:3000/api/health

# Réponse attendue
{
  "status": "healthy",
  "services": { "database": "up", "stripe": "up" }
}
```

**Templates GitHub :**
- Aller sur : https://github.com/Enemles/webrly/issues/new/choose
- Choisir le template approprié
- Les labels seront proposés automatiquement

---

## 🔧 Phase 2 : Alertes Slack/Discord (15 min - Gratuit)

### Configuration Slack

1. **Créer un Webhook Slack :**
   ```
   https://api.slack.com/apps → Create New App → Incoming Webhooks
   ```

2. **Ajouter à votre `.env.local` :**
   ```bash
   WEBHOOK_CRITICAL_ALERTS=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Tester l'intégration :**
   ```typescript
   import { logger } from '@/lib/utils';
   
   // Déclenchera une alerte Slack en production
   logger.critical('Test alert system', {
     component: 'test',
     action: 'webhook-validation'
   });
   ```

### Configuration Discord (Alternative)

1. **Créer un Webhook Discord :**
   ```
   Serveur Discord → Paramètres → Intégrations → Webhooks → Nouveau Webhook
   ```

2. **Utiliser l'URL dans `.env.local` :**
   ```bash
   WEBHOOK_CRITICAL_ALERTS=https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz
   ```

### Test des alertes

```typescript
// Exemple d'usage dans votre code
try {
  await criticalDatabaseOperation();
} catch (error) {
  logger.critical('Database operation failed', {
    component: 'database',
    action: 'critical-operation',
    error: error as Error,
    metadata: { operation: 'user-creation' }
  });
}
```

---

## 📊 Phase 3 : Sentry - Tracking d'erreurs (30 min - Gratuit 5K erreurs/mois)

### Installation

1. **Créer un compte Sentry :**
   ```
   https://sentry.io → Sign Up → Create Project → Next.js
   ```

2. **Installation des packages :**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Configuration automatique :**
   Le wizard créera automatiquement :
   - `sentry.client.config.ts`
   - `sentry.server.config.ts`
   - `next.config.js` (ajout du plugin Sentry)

4. **Ajouter à `.env.local` :**
   ```bash
   SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@o1234567.ingest.sentry.io/1234567
   SENTRY_AUTH_TOKEN=your_auth_token_here
   ```

5. **Décommenter dans le logger :**
   ```typescript
   // Dans src/lib/utils.ts, décommenter les lignes Sentry
   import * as Sentry from "@sentry/nextjs";
   
   private sendToExternal(log: StructuredLog) {
     if (process.env.SENTRY_DSN && (log.level === 'error' || log.level === 'critical')) {
       Sentry.captureException(log.context.error || new Error(log.message), { 
         extra: log,
         tags: { component: log.context.component }
       });
     }
   }
   ```

### Test Sentry

```typescript
// Tester la capture d'erreur
logger.error('Test Sentry integration', {
  component: 'test',
  error: new Error('This is a test error')
});
```

---

## 📈 Phase 4 : Labels GitHub automatiques (5 min - Gratuit)

### Prérequis

1. **Installer GitHub CLI :**
   ```bash
   # macOS
   brew install gh
   
   # Windows
   winget install --id GitHub.cli
   ```

2. **Authentification :**
   ```bash
   gh auth login
   ```

### Configuration

1. **Exécuter le script :**
   ```bash
   chmod +x scripts/setup-labels.sh
   ./scripts/setup-labels.sh
   ```

2. **Vérification :**
   - Aller sur : https://github.com/Enemles/webrly/labels
   - Vous devriez voir tous les labels organisés par catégorie

---

## 🔍 Phase 5 : Monitoring externe (Optionnel)

### Grafana Cloud (Gratuit 10K métriques)

1. **Créer un compte :**
   ```
   https://grafana.com/auth/sign-up/create-user
   ```

2. **Configuration :**
   ```bash
   # Ajouter à .env.local
   MONITORING_ENDPOINT=https://prometheus-us-central1.grafana.net/api/prom/push
   MONITORING_API_KEY=your_grafana_cloud_api_key
   ```

### DataDog (14 jours gratuit)

1. **Créer un compte :**
   ```
   https://www.datadoghq.com/free-datadog-trial/
   ```

2. **Installation :**
   ```bash
   npm install @datadog/browser-logs
   ```

---

## 🚀 Configuration de production

### Variables d'environnement recommandées

```bash
# Production minimale (Phase 1)
NODE_ENV=production
NEXT_PUBLIC_APP_VERSION=1.2.0
DATABASE_URL=your_production_db_url

# Avec alertes (Phase 2)
WEBHOOK_CRITICAL_ALERTS=your_webhook_url

# Avec tracking d'erreurs (Phase 3)  
SENTRY_DSN=your_sentry_dsn

# Avec monitoring avancé (Phase 5)
MONITORING_ENDPOINT=your_monitoring_endpoint
MONITORING_API_KEY=your_api_key
```

### Déploiement sur Coolify

1. **Variables d'environnement :**
   - Aller dans votre projet Coolify
   - Section "Environment Variables"
   - Ajouter les variables une par une

2. **Build automatique :**
   ```bash
   # Le health check sera automatiquement disponible
   curl https://votre-domaine.com/api/health
   ```

---

## 🧪 Tests et validation

### Checklist de validation

**Phase 1 (Base) :**
- [ ] `curl http://localhost:3000/api/health` retourne 200
- [ ] Logs colorés visibles dans la console dev
- [ ] Templates GitHub accessibles sur `/issues/new/choose`

**Phase 2 (Alertes) :**
- [ ] Webhook Slack/Discord configuré
- [ ] Test d'alerte critique envoyé
- [ ] Message reçu dans le canal

**Phase 3 (Sentry) :**
- [ ] Dashboard Sentry accessible
- [ ] Erreurs capturées automatiquement
- [ ] Contexte métier visible dans Sentry

### Scripts de test

```bash
# Test complet du système
curl -X POST http://localhost:3000/api/test-mco \
  -H "Content-Type: application/json" \
  -d '{"test": "all"}'
```

---

## 📞 Support et dépannage

### Problèmes courants

**Webhook ne fonctionne pas :**
- Vérifier l'URL dans `.env.local`
- Tester avec curl directement
- Vérifier les permissions du canal

**Sentry n'capture pas :**
- Vérifier le DSN dans `.env.local`
- S'assurer que le package est bien installé
- Redémarrer le serveur dev

**Labels GitHub non créés :**
- Vérifier l'authentification : `gh auth status`
- Permissions du token GitHub
- Repository accessible en écriture

### Logs de debug

```typescript
// Activer les logs de debug
process.env.LOG_LEVEL = 'debug';

// Voir tous les appels externes
logger.debug('External service call', {
  component: 'monitoring',
  action: 'send-metrics',
  metadata: { service: 'sentry', configured: !!process.env.SENTRY_DSN }
});
```

---

## 📈 Métriques de succès

Après configuration complète, vous devriez observer :

- **MTTR réduit** : De 2h à 30min pour les bugs P1
- **Détection proactive** : 80% des erreurs capturées avant signalement utilisateur
- **Visibilité** : Dashboard temps réel de la santé applicative
- **Productivité** : Issues mieux documentées, résolution plus rapide

---

*Ce guide évolue avec vos besoins. N'hésitez pas à l'adapter selon votre contexte et vos priorités.*
