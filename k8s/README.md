# 🚀 Webrly Kubernetes - Architecture Microservices

## 🚀 Déploiement Rapide

### Prérequis
```bash
# Cluster Kubernetes actif (Minikube, Docker Desktop, Kind...)
kubectl cluster-info

# Être dans le répertoire racine du projet (qui contient le dossier k8s/ et scripts/)
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
kubectl port-forward service/metrics-service 3009:3009 -n webrly
curl http://localhost:3009/api/v1/metrics

```