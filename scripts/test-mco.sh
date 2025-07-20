#!/bin/bash

# Script de test MCO - Validation des Quick Wins
# Usage: ./test-mco.sh

echo "🧪 Test des améliorations MCO Webrly"
echo "====================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_TOTAL=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    echo -n "Testing $test_name... "
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        if [ -n "$expected_result" ]; then
            echo "  Expected: $expected_result"
        fi
    fi
}

echo
echo "📋 1. Vérification des fichiers de configuration"
echo "----------------------------------------------"

run_test "Templates GitHub bug report" "[ -f '.github/ISSUE_TEMPLATE/bug_report.md' ]"
run_test "Templates GitHub feature request" "[ -f '.github/ISSUE_TEMPLATE/feature_request.md' ]"
run_test "Templates GitHub incident report" "[ -f '.github/ISSUE_TEMPLATE/incident_report.md' ]"
run_test "Configuration des templates" "[ -f '.github/ISSUE_TEMPLATE/config.yml' ]"
run_test "Script de labels GitHub" "[ -f 'scripts/setup-labels.sh' ] && [ -x 'scripts/setup-labels.sh' ]"

echo
echo "📊 2. Vérification du logging"
echo "-----------------------------"

# Test si le logger est bien exporté
run_test "Logger structuré disponible" "grep -q 'export const logger' src/lib/utils.ts"
run_test "Helper de performance disponible" "grep -q 'withPerfLog' src/lib/utils.ts"
run_test "Support des niveaux de log" "grep -q 'critical\|error\|warn\|info\|debug' src/lib/utils.ts"

echo
echo "🩺 3. Vérification du Health Check"
echo "---------------------------------"

run_test "API Health Check créée" "[ -f 'src/app/api/health/route.ts' ]"
run_test "Support des méthodes GET/HEAD" "grep -q 'export async function GET\|export async function HEAD' src/app/api/health/route.ts"
run_test "Vérification base de données" "grep -q 'checkDatabase' src/app/api/health/route.ts"

echo
echo "⚙️  4. Configuration d'environnement"
echo "-----------------------------------"

run_test "Variables monitoring documentées" "grep -q 'MONITORING & LOGGING' env.example"
run_test "Webhooks optionnels" "grep -q '# WEBHOOK_CRITICAL_ALERTS=' env.example"
run_test "Sentry optionnel" "grep -q '# SENTRY_DSN=' env.example"

echo
echo "📚 5. Documentation"
echo "------------------"

run_test "Guide Quick Wins créé" "[ -f 'docs/MCO_QUICK_WINS.md' ]"
run_test "Plan d'action MCO créé" "[ -f 'docs/MCO_PLAN_ACTION.md' ]"
run_test "Guide de configuration créé" "[ -f 'docs/MCO_CONFIGURATION_GUIDE.md' ]"
run_test "README mis à jour" "grep -q 'MCO - Maintenance en Condition Opérationnelle' README.md"

echo
echo "🧪 6. Tests fonctionnels (optionnels)"
echo "------------------------------------"

# Ces tests nécessitent que l'app soit démarrée
if lsof -i:3000 > /dev/null 2>&1; then
    echo "Application détectée sur le port 3000, test de l'API..."
    
    if curl -s -f http://localhost:3000/api/health > /dev/null; then
        echo -e "Health Check API: ${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "Health Check API: ${RED}❌ FAIL${NC}"
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    # Test du format JSON
    if curl -s http://localhost:3000/api/health | grep -q '"status"'; then
        echo -e "Health Check JSON format: ${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "Health Check JSON format: ${RED}❌ FAIL${NC}"
    fi
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
else
    echo -e "${YELLOW}⚠️  Application non démarrée sur le port 3000${NC}"
    echo "Pour tester l'API, lancez: pnpm dev"
fi

echo
echo "📊 RÉSULTATS"
echo "============"

PASS_PERCENTAGE=$((TESTS_PASSED * 100 / TESTS_TOTAL))

if [ $TESTS_PASSED -eq $TESTS_TOTAL ]; then
    echo -e "${GREEN}🎉 Tous les tests passent ! ($TESTS_PASSED/$TESTS_TOTAL)${NC}"
    echo -e "${GREEN}✅ Les Quick Wins MCO sont prêts à être utilisés${NC}"
elif [ $PASS_PERCENTAGE -ge 80 ]; then
    echo -e "${YELLOW}⚠️  Plupart des tests passent ($TESTS_PASSED/$TESTS_TOTAL - $PASS_PERCENTAGE%)${NC}"
    echo -e "${YELLOW}🔧 Quelques ajustements recommandés${NC}"
else
    echo -e "${RED}❌ Plusieurs tests échouent ($TESTS_PASSED/$TESTS_TOTAL - $PASS_PERCENTAGE%)${NC}"
    echo -e "${RED}🚨 Vérification de la configuration requise${NC}"
fi

echo
echo "📚 Prochaines étapes:"
echo "1. Configurez les labels GitHub: ./scripts/setup-labels.sh"
echo "2. Testez l'API Health: curl http://localhost:3000/api/health"
echo "3. Configurez un webhook Slack/Discord (optionnel)"
echo "4. Consultez docs/MCO_CONFIGURATION_GUIDE.md"

exit 0
