#!/bin/bash

# 🔧 Script de Test MCO - Webrly Production
# Usage: ./test-mco.sh [webhook|logging|all]

set -e

# Configuration
DOMAIN="https://webrly.fr"
WEBHOOK_SECRET="7641d6639ba9e5a7b0286dd909d472421f38b19b2392f6e41575f43b52f6e2f3"  # À adapter selon votre secret

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test du webhook Alertmanager
test_webhook() {
    log_info "Testing Alertmanager Webhook..."
    
    response=$(curl -s -w "\\n%{http_code}" -X POST "$DOMAIN/api/webhooks/alertmanager" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $WEBHOOK_SECRET" \
        -d '{
            "alerts": [
                {
                    "labels": {
                        "alertname": "MCO_Test_Alert",
                        "severity": "warning",
                        "instance": "webrly.fr:443",
                        "service": "mco-test"
                    },
                    "annotations": {
                        "summary": "MCO Test Alert from script",
                        "description": "This is an automated test of the MCO webhook system"
                    },
                    "status": "firing",
                    "startsAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
                }
            ],
            "groupKey": "mco-test",
            "status": "firing"
        }')
    
    # Séparer la réponse du code HTTP
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        log_success "Webhook test passed! HTTP $http_code"
        log_info "Response: $body"
        log_info "Check GitHub Issues for new alert: https://github.com/Enemles/webrly/issues"
    else
        log_error "Webhook test failed! HTTP $http_code"
        log_error "Response: $body"
    fi
}

# Test du système de logging
test_logging() {
    log_info "Testing Logging System..."
    
    # Test des différents types d'erreurs
    endpoints=(
        "/api/sentry-test/server-error:Server Error"
        "/api/sentry-test/database-error:Database Error" 
        "/api/sentry-test/timeout-error:Timeout Error"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r endpoint name <<< "$endpoint_info"
        
        log_info "Testing $name..."
        response=$(curl -s -w "\\n%{http_code}" "$DOMAIN$endpoint")
        
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')
        
        if [ "$http_code" = "500" ]; then
            log_success "$name test passed! HTTP $http_code"
        else
            log_warning "$name test unexpected response: HTTP $http_code"
        fi
    done
}

# Test de disponibilité du site
test_site() {
    log_info "Testing Site Availability..."
    
    response=$(curl -s -w "%{http_code}" "$DOMAIN" -o /dev/null)
    
    if [ "$response" = "200" ]; then
        log_success "Site is available! HTTP $response"
    else
        log_error "Site availability issue! HTTP $response"
    fi
}

# Test de la page d'erreur Sentry
test_sentry_page() {
    log_info "Testing Sentry Error Page..."
    
    response=$(curl -s -w "%{http_code}" "$DOMAIN/sentry-example-page" -o /dev/null)
    
    if [ "$response" = "200" ]; then
        log_success "Sentry error page is accessible! HTTP $response"
        log_info "Visit $DOMAIN/sentry-example-page to test error triggers"
    else
        log_warning "Sentry error page issue! HTTP $response"
    fi
}

# Affichage de l'aide
show_help() {
    echo "🔧 MCO Test Script - Webrly Production"
    echo ""
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  webhook     Test webhook Alertmanager only"
    echo "  logging     Test logging system only"
    echo "  site        Test site availability only"
    echo "  sentry      Test Sentry error page only"
    echo "  all         Run all tests (default)"
    echo "  help        Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 webhook     # Test webhook only"
    echo "  $0 all         # Run all tests"
    echo "  $0             # Run all tests (default)"
}

# Script principal
main() {
    echo "🚀 MCO Testing Script for Webrly Production"
    echo "======================================"
    
    case "${1:-all}" in
        "webhook")
            test_webhook
            ;;
        "logging") 
            test_logging
            ;;
        "site")
            test_site
            ;;
        "sentry")
            test_sentry_page
            ;;
        "all")
            test_site
            echo ""
            test_webhook
            echo ""
            test_logging  
            echo ""
            test_sentry_page
            echo ""
            log_info "All tests completed!"
            ;;
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    log_info "For detailed testing guide, see: docs/MCO_TESTING_GUIDE.md"
}

# Exécution
main "$@"
