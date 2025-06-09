# 📊 Monitoring avec Prometheus - Webrly

Ce document explique comment utiliser le système de monitoring Prometheus intégré dans l'application Webrly.

## 🚀 Configuration

### Packages installés
- `prom-client@15.1.3` - Client Prometheus pour Node.js

### Fichiers créés
- `src/lib/metrics.ts` - Définition des métriques Prometheus
- `src/lib/metrics-helpers.ts` - Fonctions utilitaires pour tracker facilement
- `src/lib/metrics-middleware.ts` - Middleware pour les routes API
- `src/app/api/metrics/route.ts` - Endpoint pour exposer les métriques
- `src/app/api/exemple-avec-metrics/route.ts` - Exemple d'utilisation

## 📈 Métriques disponibles

### Métriques système (automatiques)
- `nextjs_process_cpu_*` - Utilisation du CPU
- `nextjs_process_memory_*` - Utilisation de la mémoire
- `nextjs_process_*` - Autres métriques système

### Métriques applicatives personnalisées
- `nextjs_http_requests_total` - Nombre total de requêtes HTTP
- `nextjs_http_request_duration_seconds` - Durée des requêtes HTTP
- `nextjs_active_users` - Nombre d'utilisateurs actifs
- `nextjs_auth_attempts_total` - Tentatives d'authentification
- `nextjs_database_query_duration_seconds` - Durée des requêtes en base

## 🛠 Utilisation

### 1. Endpoint des métriques
Les métriques sont disponibles à l'URL : `http://localhost:3000/api/metrics`

### 2. Intégrer des métriques dans vos routes API

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withMetrics } from '@/lib/metrics-middleware';
import { trackDatabaseQuery, trackActiveUsers } from '@/lib/metrics-helpers';

async function handleGet(request: NextRequest) {
  // Votre logique ici
  
  // Tracker une requête de base de données
  const users = await trackDatabaseQuery('SELECT', 'User', async () => {
    return await prisma.user.findMany();
  });

  // Tracker les utilisateurs actifs
  trackActiveUsers(users.length);

  return NextResponse.json({ users });
}

// Exporter avec le wrapper de métriques
export const GET = withMetrics(handleGet);
```

### 3. Tracker les tentatives d'authentification

```typescript
import { trackAuthAttempt } from '@/lib/metrics-helpers';

// En cas de succès
trackAuthAttempt('success', 'clerk');

// En cas d'échec
trackAuthAttempt('failure', 'clerk');
```

### 4. Tracker des requêtes Prisma

```typescript
import { trackPrismaQuery } from '@/lib/metrics-helpers';

// Exemple avec une requête SELECT
const users = await trackPrismaQuery('SELECT', 'User', async () => {
  return await prisma.user.findMany();
});

// Exemple avec une requête INSERT
const newUser = await trackPrismaQuery('INSERT', 'User', async () => {
  return await prisma.user.create({ data: userData });
});
```

## 🔧 Configuration Prometheus

### Configuration serveur Prometheus (`prometheus.yml`)

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'nextjs-app'
    static_configs:
      - targets: ['votre-app.coolify.com:443']
    metrics_path: /api/metrics
    scheme: https
    scrape_interval: 30s
```

### Labels disponibles

- **HTTP Requests** : `method`, `route`, `status_code`
- **Database Queries** : `operation`, `table`
- **Auth Attempts** : `status`, `provider`

## 📊 Exemples de requêtes PromQL

### Taux de requêtes par minute
```promql
rate(nextjs_http_requests_total[1m])
```

### Latence moyenne des requêtes
```promql
rate(nextjs_http_request_duration_seconds_sum[5m]) / 
rate(nextjs_http_request_duration_seconds_count[5m])
```

### Requêtes en erreur (5xx)
```promql
rate(nextjs_http_requests_total{status_code=~"5.."}[5m])
```

### Durée moyenne des requêtes DB
```promql
rate(nextjs_database_query_duration_seconds_sum[5m]) / 
rate(nextjs_database_query_duration_seconds_count[5m])
```

## 🚨 Alertes recommandées

### Taux d'erreur élevé
```promql
rate(nextjs_http_requests_total{status_code=~"5.."}[5m]) > 0.1
```

### Latence élevée
```promql
histogram_quantile(0.95, rate(nextjs_http_request_duration_seconds_bucket[5m])) > 2
```

### Utilisation mémoire élevée
```promql
nextjs_process_resident_memory_bytes > 500000000
```

## 🔗 Intégration avec votre stack de monitoring

1. **Prometheus** collecte les métriques depuis `/api/metrics`
2. **Grafana** visualise les métriques
3. **Alertmanager** gère les alertes

## 📝 Notes importantes

- L'endpoint `/api/metrics` est automatiquement ajouté aux routes publiques
- Les métriques ne sont PAS collectées dans le middleware principal pour éviter les conflits avec l'Edge Runtime
- Utilisez le wrapper `withMetrics()` pour vos routes API importantes
- Les erreurs de métriques sont silencieuses pour ne pas affecter l'application

## 🧪 Test local

```bash
# Tester l'endpoint des métriques
curl http://localhost:3000/api/metrics

# Tester l'exemple avec métriques
curl http://localhost:3000/api/exemple-avec-metrics

# Vérifier les métriques générées
curl http://localhost:3000/api/metrics | grep "nextjs_http_requests_total"
``` 