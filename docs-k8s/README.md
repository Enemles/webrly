# 🚀 Webrly Kubernetes - Architecture Microservices

> **🔧 Guide Pratique :** Ce fichier vous guide pour **déployer et tester** l'architecture.  
> 📋 **Résumé pour prof :** Voir `ARCHITECTURE-SUMMARY.md`  
> 📚 **Documentation complète :** Voir `docs-k8s/` pour la documentation académique RNCP

## 📋 Vue d'Ensemble

Cette architecture transforme l'application Webrly monolithique (Next.js) en **9 microservices indépendants** déployés sur Kubernetes, démontrant les **design patterns** et **pratiques Cloud** pour un cours RNCP.

### 🏗️ Architecture Déployée

```
Internet → Ingress (api.webrly.com) → Services → Pods
         ↓                          ↓        ↓
    🌐 DNS                    🚪 API GW   📦 Apps
    Routing                    Nginx    8 Services
```

**Infrastructure Complète :**
```
8 Microservices + 8 PostgreSQL + Redis Cache + Ingress + Monitoring
```

**8 Microservices :**
- 🔐 Auth Service (3001) - JWT & Clerk
- 🏢 Agency Service (3002) - Multi-tenant
- 📊 CRM Service (3003) - Contacts & Leads  
- 📈 Pipeline Service (3004) - Sales Pipeline
- 🎯 Funnel Service (3005) - Landing Pages
- 📁 Media Service (3006) - UploadThing
- 💳 Billing Service (3007) - Stripe
- 🔔 Notification Service (3008) - Emails & SMS

**Design Patterns :**
- ✅ **Circuit Breaker** (Opossum.js, 3s timeout, 50% erreur, 30s reset)
- ✅ **Database-per-Service** (8 PostgreSQL séparées pour isolation)
- ✅ **Load Balancing** (Kubernetes distribution automatique)

## 🚀 Déploiement Rapide

### Prérequis
```bash
# Cluster Kubernetes actif (Minikube, Docker Desktop, Kind...)
kubectl cluster-info

# Être dans le répertoire racine du projet
ls k8s/
```

### Déploiement One-Click
```bash
# Script automatique (recommandé)
./scripts/deploy-k8s-demo.sh

# OU déploiement manuel complet
kubectl apply -f k8s/00-namespace/
kubectl apply -f k8s/01-configmaps/
kubectl apply -f k8s/02-secrets/
kubectl apply -f k8s/03-databases/
kubectl apply -f k8s/04-services/ --recursive
kubectl apply -f k8s/05-ingress/
kubectl apply -f k8s/06-monitoring/
```

### Vérification Ingress
```bash
# Voir le statut de l'Ingress
kubectl get ingress -n webrly

# Tester via minikube (local)
minikube ip  # Récupérer l'IP du cluster
curl -H "Host: api.webrly.com" http://$(minikube ip)
```

## 🔍 Vérification et Tests

### 1. Status Général
```bash
# Voir tous les composants
kubectl get all -n webrly

# Pods par service
kubectl get pods -n webrly -o wide

# Auto-scaling status
kubectl get hpa -n webrly

# Ingress et réseau
kubectl get ingress -n webrly
kubectl get networkpolicy -n webrly
```

### 2. Tests de Connectivité
```bash
# Tester un service spécifique
kubectl port-forward -n webrly service/auth-service 3001:3001
curl http://localhost:3001
# Réponse attendue : {"service":"auth-service","status":"healthy",...}

# Script de test pour tous les services
for service in auth agency crm pipeline funnel media billing notification; do
  echo "Testing $service-service..."
  kubectl port-forward -n webrly service/$service-service 300${service#auth}:300${service#auth} &
  sleep 2
  curl -s http://localhost:300${service#auth} | jq '.service' || echo "Not ready"
  pkill -f "port-forward.*300${service#auth}"
done
```

### 3. Monitoring et Métriques
```bash
# CPU/Memory usage
kubectl top pods -n webrly

# Logs d'un service
kubectl logs -n webrly deployment/auth-service --tail=50

# Événements récents  
kubectl get events -n webrly --sort-by=.metadata.creationTimestamp

# ConfigMaps et Secrets
kubectl get configmap -n webrly
kubectl get secret -n webrly
```

### 4. Tests de Charge et Auto-scaling
```bash
# Générer de la charge sur Auth Service
kubectl run load-test --image=busybox --rm -it --restart=Never -- \
  /bin/sh -c "while true; do wget -q -O- http://auth-service.webrly.svc.cluster.local:3001; done"

# Observer l'auto-scaling (dans un autre terminal)
watch kubectl get hpa -n webrly
watch kubectl get pods -n webrly -l app=auth-service
```

### 5. Tests de Résilience
```bash
# Supprimer un pod pour tester l'auto-healing
kubectl delete pod -n webrly $(kubectl get pod -n webrly -l app=auth-service -o name | head -1)

# Observer la récupération
kubectl get pods -n webrly -l app=auth-service -w
```

## 📁 Structure des Fichiers avec Commentaires

### Configuration (01-configmaps/)
- **app-config.yaml** : Variables globales et URLs des microservices
  - Configuration Redis (Cache performance)
  - URLs internes des 8 services
  - Circuit Breaker settings
  - Timeouts et limites de ressources

### Sécurité (02-secrets/)
- **app-secrets.yaml** : Données sensibles encodées base64
  - Credentials PostgreSQL par service
  - API keys Stripe, Clerk, UploadThing  
  - Secrets JWT et authentification
  - **⚠️ Valeurs factices pour démo uniquement !**

### Infrastructure (03-databases/)
- **postgres-*.yaml** : 8 bases PostgreSQL (Database-per-service)
- **redis.yaml** : Redis simple pour cache haute performance

### Microservices (04-services/)
- **auth/deployment.yaml** : Service d'authentification (exemple commenté)
  - Configuration complète avec health checks
  - Variables d'environnement et secrets
  - Auto-scaling HPA (2-10 replicas)
  - Ressources et limites optimisées

### Réseau (05-ingress/)
- **ingress.yaml** : API Gateway avec routing intelligent
  - 8 routes vers les microservices
  - Rate limiting (100 req/min)
  - TLS/SSL automatique
  - CORS configuré
- **network-policies.yaml** : Sécurité réseau micro-segmentée

### Monitoring (06-monitoring/)
- **monitoring.yaml** : Configuration basique de monitoring
  - Métriques des 8 services
  - Guide pour Prometheus complet

## 🎨 Design Patterns Expliqués

### Circuit Breaker Pattern
**Fichier :** `01-configmaps/app-config.yaml`
```yaml
CIRCUIT_BREAKER_TIMEOUT: "3000"        # 3s timeout
CIRCUIT_BREAKER_ERROR_THRESHOLD: "50"  # 50% erreur = ouvert
CIRCUIT_BREAKER_RESET_TIMEOUT: "30000" # Reset après 30s
```

**Protection :**
- Auth Service → Clerk API
- Media Service → UploadThing API  
- Billing Service → Stripe API

### Database-per-Service Pattern
**Fichier :** `03-databases/postgres-*.yaml`
```yaml
# 8 bases PostgreSQL séparées
postgres-auth, postgres-agency, postgres-crm, postgres-pipeline
postgres-funnel, postgres-media, postgres-billing, postgres-notification
```

**Isolation :**
- **Data isolation :** Chaque service a sa propre base
- **Schema autonomy :** Évolution indépendante des structures
- **Performance :** Optimisation par cas d'usage métier

### Load Balancing
**Composants :** Kubernetes automatique
```yaml
Ingress:
  - Nginx load balance vers Services
Services:  
  - K8s load balance vers Pods (round-robin)
HPA:
  - Auto-scaling 2-10 replicas
```

**Distribution :** Charge automatique sans configuration

## 🔧 Configuration Avancée

### Auto-scaling (HPA)
Chaque service configuré avec :
- **Min replicas :** 2 (haute disponibilité)
- **Max replicas :** 10 (charge élevée)
- **CPU trigger :** 70% utilisation
- **Memory trigger :** 80% utilisation

### Resources Management
```yaml
requests:  # Ressources garanties
  memory: "256Mi"  
  cpu: "100m"
limits:    # Limites maximales
  memory: "512Mi"
  cpu: "500m"
```

### Health Checks
- **Readiness Probe :** Service prêt (10s delay, 5s period)
- **Liveness Probe :** Service vivant (30s delay, 30s period)

## 🛠️ Troubleshooting

### Pods en Erreur
```bash
# Voir les erreurs
kubectl describe pod -n webrly POD_NAME

# Logs détaillés
kubectl logs -n webrly POD_NAME --previous
```

### Services Non Accessibles
```bash
# Vérifier les endpoints
kubectl get endpoints -n webrly

# Tester la connectivité interne
kubectl exec -n webrly POD_NAME -- wget -qO- http://SERVICE_NAME:PORT
```

### Base de Données
```bash
# Se connecter à PostgreSQL
kubectl exec -it -n webrly postgres-auth-0 -- psql -U webrly -d webrly_auth

# Vérifier Redis
kubectl exec -it -n webrly $(kubectl get pod -n webrly -l app=redis-cache -o name | head -1 | cut -d/ -f2) -- redis-cli ping
```

## 🧹 Nettoyage

```bash
# Supprimer tout
kubectl delete namespace webrly webrly-monitoring

# OU supprimer par composants
kubectl delete -f k8s/06-monitoring/
kubectl delete -f k8s/05-ingress/  
kubectl delete -f k8s/04-services/ --recursive
kubectl delete -f k8s/03-databases/
kubectl delete -f k8s/02-secrets/
kubectl delete -f k8s/01-configmaps/
kubectl delete -f k8s/00-namespace/
```

## 📚 Pour le Cours RNCP

### Critères Validés ✅

**Architecture Logiciel :**
- Scalabilité (HPA, Load balancing)
- Fiabilité (Multi-replica, Health checks)  
- Sécurité (Network Policies, Secrets)
- Maintenabilité (8 services découplés)
- Modularité (Database-per-service)
- Design Patterns (3 patterns implémentés)

**Infrastructure Cloud :**
- Composants K8s (11 types utilisés)
- Scalabilité (Auto-scaling configuré)
- Fiabilité (HA, récupération automatique)
- Sécurité (TLS, isolation réseau)

### Démonstration Live
1. **Déploiement :** `./scripts/deploy-k8s-demo.sh`
2. **Architecture :** `kubectl get all -n webrly`
3. **Tests :** Port-forward + curl des services
4. **Scaling :** Générer charge + observer HPA
5. **Résilience :** Supprimer pod + auto-healing

---

🎓 **Cette architecture démontre une transformation monolithe → microservices complète avec tous les design patterns et composants Kubernetes requis pour le cours RNCP.** 