# 🏆 MCO Webrly - Système de Monitoring Complet

## 📊 Vue d'ensemble du système

### Architecture de monitoring mise en place

```
Application (Next.js)
       ↓
Logger MCO Structuré (utils.ts)
       ↓
    Sentry.io
  (Error Tracking)
       ↓
  Tableau de bord
   (Monitoring)
```

## 🛠 Composants installés et configurés

### 1. Logger MCO Structuré ✅
- **Fichier**: `src/lib/utils.ts`
- **Fonctionnalités**:
  - Logging coloré en développement
  - JSON structuré en production
  - Contexte métier complet (userId, component, action, metadata)
  - Niveaux: debug, info, warn, error, critical
  - Intégration automatique Sentry pour erreurs

### 2. Sentry Error Tracking ✅
- **Organisation**: webrly
- **Projet**: webrly
- **Features actives**:
  - Error tracking et stack traces
  - Performance monitoring
  - Session replay
  - Source maps upload
  - Intégration complète avec le logger MCO

### 3. Pages de test et validation ✅
- `src/app/sentry-example-page/` - Test client-side
- `src/app/api/sentry-example-api/` - Test server-side
- `src/app/api/test-mco-logger/` - Test logger MCO intégré

## 🚀 Utilisation du système

### Logger MCO - Exemples d'usage

```typescript
import { logger } from '@/lib/utils';

// Log d'information avec contexte métier
logger.info('User login successful', {
  component: 'auth',
  userId: 'user_123',
  action: 'login',
  metadata: { method: 'clerk', duration: '245ms' }
});

// Erreur avec contexte complet (envoyée automatiquement à Sentry)
logger.error('Payment processing failed', {
  component: 'stripe',
  userId: 'user_456',
  action: 'process-payment',
  error: paymentError,
  metadata: { 
    orderId: 'order_789',
    amount: 99.99,
    currency: 'EUR'
  }
});

// Alerte critique (envoyée à Sentry + simulation webhook)
logger.critical('Database connection lost', {
  component: 'database',
  error: dbError,
  metadata: { 
    connectionPool: 'main',
    affectedServices: ['payments', 'users']
  }
});
```

### Monitoring des performances

```typescript
// Tracer automatiquement les performances d'une fonction
const optimizedPayment = withPerfLog(
  processPayment, 
  'processPayment', 
  'stripe'
);
```

## 📱 Endpoints de test

### Tests de base
- `GET /api/test-mco-logger?type=info` - Test log d'info
- `GET /api/test-mco-logger?type=error` - Test erreur (→ Sentry)
- `GET /api/test-mco-logger?type=critical` - Test critique (→ Sentry + alerte)

### Tests Sentry originaux
- `GET /sentry-example-page` - Test page client
- `GET /api/sentry-example-api` - Test API server

## 🎯 Dashboard et monitoring

### Sentry Dashboard
- **URL**: https://sentry.io/organizations/webrly/projects/webrly/
- **Accès**: Erreurs temps réel, stack traces, contexte métier
- **Alertes**: Configuration automatique pour erreurs critiques

### Métriques disponibles
- Taux d'erreur par composant
- Performance des fonctions tracées
- Contexte utilisateur complet
- Stack traces détaillées avec source maps

## 🔧 Configuration production

### Variables d'environnement requises

```bash
# Sentry (obligatoire)
SENTRY_DSN=https://955d497b15f9880407546c9a9d3f450c@o4509706654646272.ingest.de.sentry.io/4509706658578512
SENTRY_ORG=webrly
SENTRY_PROJECT=webrly

# Optionnel - Alertes webhook critiques
WEBHOOK_CRITICAL_ALERTS=https://hooks.slack.com/your-webhook

# Optionnel - Monitoring externe
MONITORING_ENDPOINT=https://your-monitoring.com/api
MONITORING_API_KEY=your-api-key
```

### Déploiement
- Source maps automatiquement uploadées
- Configuration Next.js optimisée (`next.config.mjs`)
- Performance tracking activé
- Session replay configuré

## 📈 Métriques MCO

### Indicateurs clés surveillés
- **Disponibilité**: Uptime et erreurs critiques
- **Performance**: Temps de réponse des fonctions clés
- **Erreurs**: Taux d'erreur par composant/utilisateur
- **Expérience utilisateur**: Session replay et parcours

### Seuils d'alerte configurés
- **Error rate > 5%**: Alerte équipe dev
- **Critical errors**: Notification immédiate
- **Performance degradation**: Monitoring automatique

## 🚨 Gestion des incidents

### Processus automatisé
1. **Détection**: Logger MCO → Sentry
2. **Notification**: Dashboard temps réel
3. **Contexte**: Stack trace + métadonnées métier
4. **Escalade**: Webhook pour erreurs critiques

### Informations d'incident incluses
- Utilisateur affecté (userId)
- Composant défaillant
- Action tentée
- Contexte métier complet
- Stack trace complète
- Environnement et version

## ✅ Validation finale

### Tests de fonctionnement

```bash
# 1. Test logger MCO basique
curl "http://localhost:3000/api/test-mco-logger?type=info"

# 2. Test intégration Sentry
curl "http://localhost:3000/api/test-mco-logger?type=error"

# 3. Test alerte critique
curl "http://localhost:3000/api/test-mco-logger?type=critical"

# 4. Vérifier dashboard Sentry
# → https://sentry.io/organizations/webrly/projects/webrly/
```

### Checklist pré-production
- [ ] Variables d'environnement configurées
- [ ] Tests de monitoring réussis
- [ ] Dashboard Sentry accessible
- [ ] Alertes critiques testées
- [ ] Source maps uploadées
- [ ] Performance tracking validé

## 🎓 Formation équipe

### Logger MCO - Bonnes pratiques
1. **Toujours inclure un contexte métier** (component, userId, action)
2. **Utiliser les bons niveaux** (debug/info/warn/error/critical)
3. **Inclure les métadonnées utiles** pour le debug
4. **Tracer les performances** des fonctions critiques

### Sentry - Utilisation avancée
- **Releases**: Suivi des déploiements
- **User feedback**: Collecte retours utilisateurs
- **Custom tags**: Organisation par équipe/feature
- **Alerts**: Configuration notifications personnalisées

---

## 📞 Support et maintenance

**Responsable MCO**: [Ton nom]  
**Documentation technique**: `/docs/MCO_*.md`  
**Dashboard principal**: https://sentry.io/organizations/webrly/  
**Status page**: [À configurer si nécessaire]

---

*Documentation générée le {{ date }} - Version {{ version }}*
*Système MCO opérationnel et prêt pour la production* ✅
