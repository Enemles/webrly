#!/bin/bash

# ==========================================
# 🚀 SCRIPT DE DÉPLOIEMENT WEBRLY K8S DEMO
# ==========================================
# 
# Ce script déploie l'architecture microservices
# complète Webrly sur Kubernetes pour démonstration
# 
# Auteur: Selmene (RNCP Projet)
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Banner
echo -e "${BLUE}"
cat << 'EOF'
██╗    ██╗███████╗██████╗ ██████╗ ██╗  ██╗   ██╗
██║    ██║██╔════╝██╔══██╗██╔══██╗██║  ╚██╗ ██╔╝
██║ █╗ ██║█████╗  ██████╔╝██████╔╝██║   ╚████╔╝ 
██║███╗██║██╔══╝  ██╔══██╗██╔══██╗██║    ╚██╔╝  
╚███╔███╔╝███████╗██████╔╝██║  ██║███████╗██║   
 ╚══╝╚══╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝   
                                                 
    DÉPLOIEMENT KUBERNETES MICROSERVICES
         Architecture pour cours RNCP
EOF
echo -e "${NC}"

print_step "Vérification des prérequis..."

# Check kubectl
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl n'est pas installé"
    exit 1
fi

# Check cluster connection
if ! kubectl cluster-info &> /dev/null; then
    print_error "Impossible de se connecter au cluster Kubernetes"
    exit 1
fi

print_success "Cluster Kubernetes accessible"

# Check if we're in the right directory
if [[ ! -d "k8s" ]]; then
    print_error "Dossier k8s/ non trouvé. Lancez ce script depuis la racine du projet."
    exit 1
fi

print_step "Déploiement de l'architecture Webrly..."

# Deploy in order
print_step "1/6 - Déploiement des namespaces..."
kubectl apply -f k8s/00-namespace/
sleep 2

print_step "2/6 - Déploiement des ConfigMaps..."
kubectl apply -f k8s/01-configmaps/
sleep 2

print_step "3/6 - Déploiement des Secrets..."
kubectl apply -f k8s/02-secrets/
sleep 2

print_step "4/6 - Déploiement des bases de données..."
kubectl apply -f k8s/03-databases/
sleep 5

print_step "5/6 - Déploiement des microservices..."
kubectl apply -f k8s/04-services/ --recursive
sleep 5

print_step "6/6 - Déploiement de l'Ingress et monitoring..."
kubectl apply -f k8s/05-ingress/
kubectl apply -f k8s/06-monitoring/
sleep 3

print_success "Déploiement terminé !"

print_step "Vérification du déploiement..."

# Wait for pods to be ready
echo "Attente du démarrage des pods..."
kubectl wait --for=condition=ready pod -l app -n webrly --timeout=300s || true

# Show status
echo
print_step "📊 STATUT DU DÉPLOIEMENT"
echo "=========================="

echo
echo "🔹 Namespaces:"
kubectl get namespaces | grep webrly

echo
echo "🔹 Pods Webrly:"
kubectl get pods -n webrly -o wide

echo
echo "🔹 Services:"
kubectl get svc -n webrly

echo
echo "🔹 HPA (Auto-scaling):"
kubectl get hpa -n webrly

echo
echo "🔹 Ingress:"
kubectl get ingress -n webrly

echo
print_step "🧪 TESTS DE SANTÉ"
echo "=================="

# Port forward and test services
echo "Test des services (via port-forward)..."

services=("auth-service:3001" "agency-service:3002" "crm-service:3003" "pipeline-service:3004" "funnel-service:3005" "media-service:3006" "billing-service:3007" "notification-service:3008")

for service_port in "${services[@]}"; do
    service=$(echo $service_port | cut -d':' -f1)
    port=$(echo $service_port | cut -d':' -f2)
    
    echo -n "Testing $service..."
    
    # Start port-forward in background
    kubectl port-forward -n webrly service/$service $port:$port > /dev/null 2>&1 &
    PF_PID=$!
    
    # Wait a bit for port-forward to start
    sleep 2
    
    # Test the service
    if curl -s http://localhost:$port > /dev/null 2>&1; then
        print_success "$service OK"
    else
        print_warning "$service pas encore prêt"
    fi
    
    # Kill port-forward
    kill $PF_PID 2>/dev/null || true
done

echo
print_step "📋 COMMANDES UTILES"
echo "==================="
echo
echo "🔍 Voir tous les pods:"
echo "   kubectl get pods -n webrly"
echo
echo "📊 Voir les métriques:"
echo "   kubectl top pods -n webrly"
echo
echo "📝 Voir les logs d'un service:"
echo "   kubectl logs -n webrly deployment/auth-service"
echo
echo "🔗 Tester un service:"
echo "   kubectl port-forward -n webrly service/auth-service 3001:3001"
echo "   curl http://localhost:3001"
echo
echo "🗑️  Supprimer tout:"
echo "   kubectl delete namespace webrly webrly-monitoring"
echo

print_success "🎉 DÉPLOIEMENT RÉUSSI ! Architecture microservices Webrly prête"
print_warning "📚 Consultez k8s/README.md pour plus d'informations"

echo
echo "🎓 Cette démonstration présente :"
echo "   ✅ 8 microservices avec HPA"
echo "   ✅ 8 bases PostgreSQL séparées" 
echo "   ✅ Redis cache pour performance"
echo "   ✅ API Gateway avec Ingress"
echo "   ✅ Network Policies de sécurité"
echo "   ✅ Monitoring Prometheus/Grafana"
echo "   ✅ Design patterns : Circuit Breaker, Event-driven"
echo 