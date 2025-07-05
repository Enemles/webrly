# 🏗️ Architecture Logicielle - Vue Interne d'un Nœud Kubernetes

## 📋 Contexte et Périmètre

### 🎯 Définition de l'Architecture Logicielle
Cette architecture se concentre sur **ce qui se passe à l'intérieur d'un nœud Kubernetes** :
- **Communication entre microservices**
- **Design patterns implémentés**
- **Gestion des données et du cache**
- **Flux applicatifs internes**

> 📍 **Note :** L'infrastructure cloud globale (CDN, Load Balancers externes, multi-région) est couverte dans le document INFRASTRUCTURE-CLOUD.md

### Application Existante (Avant)
**Webrly** est une plateforme SaaS de gestion d'agences marketing construite en architecture **monolithique** :

- **Framework :** Next.js 14 avec Server Actions
- **Base de données :** PostgreSQL unique avec Prisma ORM
- **Authentication :** Clerk
- **Paiements :** Stripe
- **Storage :** UploadThing
- **Déploiement :** Monolithe sur serveur unique

### Problématiques Identifiées
- **Scalabilité limitée :** Impossible de scaler les composants indépendamment
- **Single Point of Failure :** Une panne affecte toute l'application
- **Développement bloquant :** Équipes dépendantes pour les déploiements
- **Maintenance complexe :** Changements risqués sur l'ensemble
- **Performance :** Goulots d'étranglement sur la base unique

## 🎯 Objectifs Architecturaux

### Contraintes Métier
- **Multi-tenancy :** Support de 1000+ agences isolées
- **Performance :** Temps de réponse < 200ms
- **Disponibilité :** SLA 99.9% (8.76h downtime/an max)
- **Conformité :** RGPD, PCI-DSS pour les paiements
- **Évolutivité :** Ajout de nouvelles fonctionnalités sans impact

### Contraintes Techniques
- **Équipe :** 5 développeurs (2 backend, 2 frontend, 1 DevOps)
- **Budget :** Optimisation des coûts cloud
- **Legacy :** Migration progressive sans interruption
- **Intégrations :** APIs tierces (Stripe, Clerk, UploadThing)

### Hypothèses de Charge
- **Utilisateurs simultanés :** 1000+ en période de pointe
- **Requêtes/minute :** 10,000 peak
- **Stockage :** 1TB+ de médias
- **Croissance :** +50% utilisateurs/an

## 🏗️ Architecture Logicielle - Vue Interne d'un Nœud

### Vue d'Ensemble : Microservices Pattern

```
Monolithe Next.js → 9 Microservices Indépendants + Cache Redis + 4 Design Patterns
```

### 🏗️ Diagramme de l'Architecture Logicielle

Ce schéma montre les interactions internes dans un nœud Kubernetes, avec les flux de données, les design patterns et la communication entre microservices.

**Focus** : Communication interne, patterns, données (abstraction d'1 nœud Kubernetes)

> 📊 Pour le diagramme détaillé, voir le schéma Mermaid "Architecture Logicielle - Vue Interne d'un Nœud" dans la présentation orale.

### Décomposition en Domaines Métier

#### 1. **Authentication & Authorization Domain**
**Service :** `auth-service`
- **Responsabilités :** JWT, sessions, permissions, intégration Clerk
- **Justification :** Domaine critique nécessitant isolation sécuritaire
- **API :** `/api/v1/auth/*`

#### 2. **Agency Management Domain**  
**Service :** `agency-service`
- **Responsabilités :** Gestion agences, configuration multi-tenant, équipes
- **Justification :** Cœur métier avec logique complexe d'isolation
- **API :** `/api/v1/agency/*`

#### 3. **Customer Relationship Domain**
**Service :** `crm-service`
- **Responsabilités :** Contacts, leads, segmentation, import/export
- **Justification :** Volume de données important, scaling indépendant
- **API :** `/api/v1/crm/*`

#### 4. **Sales Pipeline Domain**
**Service :** `pipeline-service`
- **Responsabilités :** Workflows, tickets, automatisation, reporting
- **Justification :** Logique métier complexe, calculs intensifs
- **API :** `/api/v1/pipeline/*`

#### 5. **Marketing Funnel Domain**
**Service :** `funnel-service`  
- **Responsabilités :** Landing pages, A/B testing, conversion tracking
- **Justification :** Forte charge lecture, cache spécialisé
- **API :** `/api/v1/funnel/*`

#### 6. **Media & Assets Domain**
**Service :** `media-service`
- **Responsabilités :** Upload, optimisation, CDN, intégration UploadThing
- **Justification :** Ressources intensives, scaling horizontal nécessaire
- **API :** `/api/v1/media/*`

#### 7. **Billing & Payments Domain**
**Service :** `billing-service`
- **Responsabilités :** Facturation, Stripe, webhooks, compliance PCI
- **Justification :** Sécurité critique, isolation compliance
- **API :** `/api/v1/billing/*`

#### 8. **Notification & Communication Domain**
**Service :** `notification-service`
- **Responsabilités :** Emails, SMS, push notifications, préférences
- **Justification :** Volume élevé, delivery asynchrone
- **API :** `/api/v1/notification/*`

#### 9. **Metrics & Analytics Domain**
**Service :** `metrics-service`
- **Responsabilités :** Agrégation métriques business, endpoint Prometheus, analytics temps réel
- **Justification :** Séparation monitoring/métier, scalabilité indépendante, sécurité
- **API :** `/api/v1/metrics` (format Prometheus)

## 🎨 Design Patterns Appliqués

### 1. Database-per-Service Pattern

**Problème résolu :** Couplage des données entre domaines métier

**Implémentation :**
- **8 bases PostgreSQL séparées** : Une par microservice
- **Isolation complète** : Pas d'accès cross-database
- **Cohérence transactionnelle** : Gérée au niveau applicatif

**Avantages :**
- **Performance :** Optimisation par cas d'usage
- **Scalabilité :** Dimensionnement indépendant
- **Sécurité :** Isolation des données sensibles
- **Développement :** Équipes autonomes

**Gestion des contraintes :**
- **Transactions distribuées :** API composition pour requêtes cross-domain
- **Cohérence :** Eventually consistent acceptable pour cas d'usage métier
- **Jointures :** Resolues côté application ou via cache

### 2. Circuit Breaker Pattern

**Problème résolu :** Pannes en cascade entre services et APIs externes

**Configuration :**
```typescript
CircuitBreaker {
  timeout: 3000ms,           // Timeout par appel
  errorThreshold: 50%,       // Seuil d'ouverture
  resetTimeout: 30000ms,     // Fermeture automatique
  fallback: degradedResponse // Réponse dégradée
}
```

**Services protégés :**
- **auth-service** → Clerk API
- **billing-service** → Stripe API  
- **media-service** → UploadThing API
- **Communication inter-services** → Timeout + fallback

**Patterns de fallback :**
- **Cache local** pour données critiques
- **Réponse dégradée** avec fonctionnalités limitées
- **Retry with exponential backoff** pour récupération automatique

### 3. Cache-Aside Pattern avec Redis

**Problème résolu :** Performance des requêtes fréquentes et réduction de charge DB

**Implémentation Redis :**
```typescript
// Pattern cache-aside classique
async function getUser(id: string) {
  // 1. Vérifier cache Redis
  const cached = await redis.get(`user:${id}`)
  if (cached) return JSON.parse(cached)
  
  // 2. Si pas en cache, requête DB
  const user = await db.user.findUnique({ where: { id } })
  
  // 3. Mettre en cache pour prochaine fois
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user))
  return user
}
```

**Stratégies de cache :**
- **Sessions utilisateur** : TTL 24h
- **Données agences** : TTL 1h, invalidation sur update
- **Métadonnées** : TTL 6h
- **Résultats de recherche** : TTL 15min

**Avantages :**
- **Performance** : Réduction latence de 200ms à 5ms pour données cachées
- **Réduction charge DB** : 70% des requêtes servies par cache
- **Scalabilité** : Support montée en charge sans surcharger PostgreSQL

### 4. Aggregator Pattern avec Metrics Service

**Problème résolu :** Collecte et exposition centralisée des métriques business distribuées

**Implémentation :**
```typescript
// metrics-service : Agrégation depuis tous les services
class MetricsAggregator {
  async collectBusinessMetrics() {
    const [agencies, contacts, tickets, revenue] = await Promise.all([
      this.agencyService.getTotalCount(),      // Agency Service
      this.crmService.getContactsCount(),      // CRM Service  
      this.pipelineService.getTicketsCount(),  // Pipeline Service
      this.billingService.getTotalRevenue()    // Billing Service
    ]);
    
    // Export au format Prometheus
    return this.formatPrometheusMetrics({
      webrly_total_agencies: agencies,
      webrly_total_contacts: contacts,
      webrly_total_tickets: tickets,
      webrly_total_revenue: revenue
    });
  }
}
```

**Avantages :**
- **Centralisation** : Un seul endpoint `/api/v1/metrics` pour toutes les métriques
- **Séparation** : Les services métier ne gèrent pas le monitoring
- **Performance** : Requêtes parallèles + cache des métriques (TTL 5min)
- **Sécurité** : Seul le service metrics expose des données sensibles
- **Évolutivité** : Ajout de nouvelles métriques sans modifier les autres services

**Pattern de collecte :**
- **Pull des données** : Metrics Service interroge les autres services
- **Cache intelligent** : Redis pour éviter surcharge des APIs métier
- **Format standardisé** : Export Prometheus pour monitoring externe

## 🏗️ Architecture Technique

### API Gateway Pattern (Nginx Ingress)

**Fonction :** Point d'entrée unique pour tous les microservices
- **Routage intelligent** : `/api/v1/auth/*` → auth-service
- **Load balancing** : Distribution automatique vers replicas disponibles
- **SSL termination** : Chiffrement TLS centralisé
- **Rate limiting** : Protection contre attaques DDoS

### Service Discovery & Load Balancing

**Kubernetes Services :**
- **ClusterIP** : Communication interne entre services
- **DNS automatique** : `http://auth-service.webrly.svc.cluster.local`
- **Health checks** : Exclusion automatique pods non-fonctionnels
- **Round-robin** : Distribution équitable de la charge

### Monitoring & Observabilité

**Métriques collectées :**
- **Application** : Temps de réponse, erreurs par endpoint
- **Infrastructure** : CPU, mémoire, réseau par pod
- **Business** : Nombre d'agences actives, revenus, conversions

**Alerting automatique :**
- **Performance** : Latence > 500ms pendant 2min
- **Erreurs** : Taux d'erreur > 5% pendant 1min  
- **Infrastructure** : CPU > 80% pendant 5min

## ✅ Validation des Critères Académiques

### Scalabilité
- **Horizontale** : HPA avec 2-10 replicas par service selon charge
- **Verticale** : Resource limits ajustables par service
- **Performance** : Cache Redis pour 70% réduction latence
- **Monitoring** : Métriques temps réel pour optimisation

### Fiabilité  
- **Haute disponibilité** : Multi-replica avec auto-healing
- **Résilience** : Circuit breakers pour éviter pannes en cascade
- **Recovery** : Health checks et restart automatique
- **Backup** : Sauvegardes automatiques des bases PostgreSQL

### Sécurité
- **Isolation** : Network policies pour micro-segmentation
- **Secrets** : Credentials chiffrés avec rotation automatique
- **TLS** : Chiffrement bout-en-bout
- **RBAC** : Permissions granulaires par service

### Maintenabilité
- **Modularité** : Services indépendants par domaine métier
- **CI/CD** : Déploiements automatisés sans downtime
- **Monitoring** : Observabilité complète pour debugging
- **Documentation** : APIs auto-documentées avec OpenAPI

## 📊 Métriques de Succès

### Performance
- **Latence moyenne** : < 100ms (objectif vs 200ms actuel)
- **Throughput** : 10,000 req/min supportées
- **Cache hit ratio** : > 80% pour données fréquentes

### Fiabilité
- **Uptime** : > 99.9% (8.76h downtime/an max)
- **MTTR** : < 5min grâce auto-healing
- **Erreur rate** : < 0.1% en conditions normales

### Scalabilité
- **Auto-scaling** : 2-10 replicas selon charge
- **Resource efficiency** : 70% utilisation CPU/mémoire
- **Growth support** : +50% utilisateurs sans re-architecture 