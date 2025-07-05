# ☁️ Infrastructure Cloud - Digital Ocean Kubernetes + DB Managée

## 📋 Contexte et Périmètre Infrastructure

### 🎯 Architecture Cible - Pragmatisme et Simplicité
Cette architecture couvre **l'infrastructure Kubernetes avec services managés Digital Ocean** :
- **Kubernetes Cluster Digital Ocean** (3 nodes)
- **PostgreSQL Managée unique** (Shared Database Pattern)
- **Redis Cache managé** pour performances
- **Load Balancer intégré** pour haute disponibilité

### Choix Architectural Majeur : Shared Database Pattern
**Abandon du Database-per-Service** au profit d'une **PostgreSQL managée unique** :
- **Justification métier :** Données fortement liées (agences → contacts → tickets → pipelines)
- **Simplicité opérationnelle :** Pas de transactions distribuées complexes
- **Réduction coûts :** 80€/mois vs 720€/mois (9 bases séparées)
- **Maintien ACID :** Consistance native PostgreSQL préservée

### Architecture Nouvelle - Vue Infrastructure Globale
**Digital Ocean comme plateforme unifiée** avec services managés intégrés :
- **Kubernetes managé** : Control plane gratuit, monitoring inclus
- **PostgreSQL Production** : Haute disponibilité, backup automatique
- **Redis managé** : Cache distribué haute performance
- **Load Balancer** : Distribution automatique du trafic
- **Monitoring intégré** : Métriques et alertes incluses

### Contraintes d'Infrastructure Actuelles
- **Performance optimisée :** Latence < 500ms P95
- **Haute disponibilité :** 99.9% SLA avec backup automatique
- **Scaling automatique :** HPA Kubernetes + PostgreSQL scaling
- **Sécurité intégrée :** WAF, Network Policies, chiffrement
- **Coûts maîtrisés :** 380€/mois total (vs 768€ AWS équivalent)

## 🏗️ Composants Architecture - Vue Simplifiée

### 1. **Kubernetes Cluster Digital Ocean**

**Composant :** `Managed Kubernetes`
**Justification :** Simplicité opérationnelle, control plane gratuit

```yaml
# Configuration Cluster
apiVersion: digitalocean.com/v1
kind: KubernetesCluster
metadata:
  name: webrly-production
spec:
  version: "1.28"
  region: fra1
  nodePools:
    - name: microservices-pool
      size: s-4vcpu-8gb
      count: 3
      autoScale: true
      minNodes: 2
      maxNodes: 6
```

**Avantages :**
- **Control Plane gratuit :** 0€ vs 73€/mois AWS EKS
- **Interface simple :** Configuration en quelques clics
- **Scaling automatique :** Ajout/suppression nodes automatique
- **Monitoring inclus :** Métriques cluster intégrées

### 2. **PostgreSQL Managée Production**

**Composant :** `Digital Ocean Managed Database`
**Justification :** Shared Database Pattern pour données liées

```yaml
# Configuration Database
apiVersion: digitalocean.com/v1
kind: Database
metadata:
  name: webrly-postgres-production
spec:
  engine: postgresql
  version: "15"
  size: db-s-2vcpu-4gb
  region: fra1
  
  # Backup automatique
  backup:
    hour: 3
    minute: 0
    
  # Maintenance window
  maintenance:
    day: sunday
    hour: 4
```

**Architecture Data - Tables Principales :**
```sql
-- Toutes dans la même DB (Shared Pattern)
webrly_production_db:
├── agencies (id, name, created_at)
├── users (id, agency_id, email, role)
├── contacts (id, agency_id, name, email)
├── tickets (id, contact_id, pipeline_id, value)
├── pipelines (id, agency_id, name, stages)
├── funnels (id, agency_id, name, published)
├── media (id, agency_id, url, type)
└── subscriptions (id, agency_id, stripe_id, active)
```

**Justification Shared Database :**
- **Relations naturelles :** Foreign keys entre tables préservées
- **Transactions ACID :** Cohérence garantie sans 2PC
- **Requêtes JOIN :** Performance native PostgreSQL
- **Backup unifié :** Une seule sauvegarde pour toutes les données

### 3. **Redis Cache Managé**

**Composant :** `Digital Ocean Managed Redis`
**Justification :** Cache-Aside pattern pour performance

```yaml
# Configuration Redis
apiVersion: digitalocean.com/v1
kind: Database
metadata:
  name: webrly-redis-cache
spec:
  engine: redis
  version: "7"
  size: db-s-1vcpu-2gb
  region: fra1
  
  # Configuration cache
  config:
    maxmemory-policy: allkeys-lru
    timeout: 300
```

**Usage Cache Pattern :**
```typescript
// Cache-Aside implémentation
async function getAgencyContacts(agencyId: string) {
  const cacheKey = `agency:${agencyId}:contacts`;
  
  // 1. Check cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // 2. Database query si cache miss
  const contacts = await db.contact.findMany({
    where: { agencyId }
  });
  
  // 3. Store in cache avec TTL
  await redis.setex(cacheKey, 3600, JSON.stringify(contacts));
  
  return contacts;
}
```

### 4. **Microservices Deployments**

**Composant :** `Kubernetes Deployments`
**Justification :** Services stateless connectés à DB partagée

```yaml
# Exemple: CRM Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: crm-service
  namespace: webrly
spec:
  replicas: 2
  template:
    spec:
      containers:
      - name: crm-service
        image: webrly/crm-service:latest
        ports:
        - containerPort: 3003
        
        env:
        # Connexion DB partagée
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: postgres-credentials
              key: connection-string
              
        # Cache Redis
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-credentials
              key: connection-string
              
        # Health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 3003
        readinessProbe:
          httpGet:
            path: /ready
            port: 3003
```

**Services déployés :**
- **auth-service** : Authentification et autorisation
- **agency-service** : Gestion agences et configuration
- **crm-service** : Contacts et leads
- **pipeline-service** : Gestion pipelines de vente
- **funnel-service** : Création et gestion funnels
- **media-service** : Upload et gestion fichiers
- **billing-service** : Facturation et abonnements
- **metrics-service** : Collecte métriques business

### 5. **Load Balancer et Ingress**

**Composant :** `Digital Ocean Load Balancer`
**Justification :** Distribution trafic et SSL termination

```yaml
apiVersion: v1
kind: Service
metadata:
  name: webrly-loadbalancer
  annotations:
    service.beta.kubernetes.io/do-loadbalancer-name: "webrly-lb"
    service.beta.kubernetes.io/do-loadbalancer-protocol: "http"
    service.beta.kubernetes.io/do-loadbalancer-tls-ports: "443"
spec:
  type: LoadBalancer
  selector:
    app: nginx-ingress
  ports:
  - name: http
    port: 80
    targetPort: 80
  - name: https
    port: 443
    targetPort: 443
```

## 💰 Coûts Infrastructure Digital Ocean

### **Récapitulatif Mensuel :**
```
☸️  Kubernetes Cluster (3 nodes s-4vcpu-8gb)  = €240/mois
🐘  PostgreSQL Managée (db-s-2vcpu-4gb)       = €80/mois
🔴  Redis Cache (db-s-1vcpu-2gb)              = €25/mois
⚖️  Load Balancer                             = €12/mois
💾  Stockage SSD supplémentaire               = €15/mois
🔄  Backup et snapshots                       = €8/mois
────────────────────────────────────────────────────
📊  TOTAL INFRASTRUCTURE                      = €380/mois
```

### **Comparaison AWS EKS équivalent :**
```
                        DIGITAL OCEAN    AWS EKS
Control Plane           Gratuit          €73/mois
Compute (3 nodes)       €240/mois        €350/mois  
PostgreSQL              €80/mois         €180/mois
Load Balancer          €12/mois         €25/mois
Monitoring             Inclus           €40/mois
Storage                €23/mois         €100/mois
──────────────────────────────────────────────────
TOTAL                  €380/mois        €768/mois
ÉCONOMIES              50% moins cher   = €388/mois
```

## 🚀 Perspectives Évolution - Roadmap Technique

### **Phase 1 : Multi-AZ (6 mois) - Migration AWS**

**Justification :** Disponibilité 99.99% requise pour croissance

```yaml
# Architecture cible AWS Multi-AZ
AWS EKS Cluster:
  AvailabilityZones:
    - eu-west-1a: 3 nodes (primary)
    - eu-west-1b: 2 nodes (standby)
  Database:
    - RDS PostgreSQL Multi-AZ
    - Read replicas pour performance
  LoadBalancer:
    - ALB cross-AZ automatique
    
Benefits:
  - Tolérance panne datacenter complet
  - Rolling updates sans interruption
  - Disaster recovery automatique (RTO < 15min)
```

### **Phase 2 : Event-Driven Architecture (12 mois)**

**Justification :** Découplage pour 10k+ événements/seconde

```yaml
# Architecture asynchrone cible
Event Bus: Apache Kafka ou AWS SQS
Patterns:
  - Event Sourcing pour audit complet
  - CQRS pour performance lecture/écriture
  - Saga Pattern pour transactions distribuées
  
Example Flow:
  Contact Created → Event → [Pipeline Service, Notification Service, Analytics]
  
Benefits:
  - Résilience pannes temporaires
  - Scaling indépendant par service
  - Traçabilité complète événements
```

### **Phase 3 : Monitoring Externalisé (9 mois)**

**Justification :** Observabilité qui survit aux pannes cluster

```yaml
# Monitoring SaaS cible
Provider: DataDog ou New Relic
Components:
  - APM (Application Performance Monitoring)
  - Log aggregation centralisée
  - Infrastructure monitoring
  - Business metrics dashboards
  
Benefits:
  - Alerting même si K8s down
  - Corrélation logs/metrics/traces
  - Expertise monitoring externalisée
  - Compliance et audit centralisé
```

## 🔒 Sécurité et Compliance

### **Network Policies - Micro-segmentation**
```yaml
# Exemple: CRM Service isolation
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: crm-service-policy
spec:
  podSelector:
    matchLabels:
      app: crm-service
  policyTypes:
  - Ingress
  - Egress
  
  # Autorise seulement vers PostgreSQL et Redis
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres-proxy
  - to:
    - podSelector:
        matchLabels:
          app: redis-proxy
```

### **Secrets Management**
```yaml
# Credentials chiffrés
apiVersion: v1
kind: Secret
metadata:
  name: postgres-credentials
type: Opaque
data:
  # Chiffrement base64 + Kubernetes encryption at rest
  connection-string: cG9zdGdyZXNxbDovL3VzZXI6cGFzc0BkYi5kb[...]
  username: d2Vicmx5X3VzZXI=
  password: c3VwZXJfc2VjdXJlX3Bhc3N3b3Jk
```

## ✅ Avantages Architecture Retenue

### **Simplicité Opérationnelle :**
- **Une seule DB à gérer** vs 8 bases séparées
- **Transactions natives** vs transactions distribuées
- **Backup unifié** vs 8 stratégies de sauvegarde
- **Monitoring centralisé** pour données et accès

### **Performance Maintenue :**
- **Cache Redis** pour requêtes fréquentes
- **Connection pooling** optimisé par service
- **Index PostgreSQL** adaptés aux patterns d'accès
- **Scaling vertical** DB managée automatique

### **Coûts Optimisés :**
- **€80/mois** pour DB unique vs **€720/mois** pour 8 DBs
- **Pas de complexité réseau** entre bases
- **Outils DBA standards** plutôt qu'expertise microservices DB
- **Économies licence** et monitoring

Cette architecture démontre qu'il est possible de combiner **pragmatisme technique** et **ambitions de croissance** sans sacrifier la performance ou la fiabilité. 