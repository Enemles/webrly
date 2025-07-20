#!/bin/bash

# Script de création des labels GitHub pour Webrly
# Usage: ./setup-labels.sh

echo "🏷️  Configuration des labels GitHub pour Webrly..."

# Colors GitHub (hex without #)
RED="d73a49"
ORANGE="f66a0a"  
YELLOW="f1e05a"
GREEN="28a745"
BLUE="0366d6"
PURPLE="6f42c1"
GRAY="6a737d"
PINK="e1105d"

# Fonction pour créer/mettre à jour un label
create_label() {
    local name="$1"
    local color="$2"
    local description="$3"
    
    echo "Création du label: $name"
    gh label create "$name" --color "$color" --description "$description" --force 2>/dev/null || true
}

# Vérifier si gh CLI est installé
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) n'est pas installé"
    echo "Installation: brew install gh"
    exit 1
fi

# Vérifier l'authentification
if ! gh auth status &> /dev/null; then
    echo "❌ Non authentifié sur GitHub CLI"
    echo "Exécutez: gh auth login"
    exit 1
fi

echo "✅ Configuration des labels..."

# === PRIORITÉS ===
create_label "priority/critical" "$RED" "P0 - Incident critique, résolution immédiate requise"
create_label "priority/high" "$ORANGE" "P1 - Priorité haute, traitement dans les 24h"
create_label "priority/medium" "$YELLOW" "P2 - Priorité moyenne, traitement sous 1 semaine"
create_label "priority/low" "$GREEN" "P3 - Priorité basse, traitement quand possible"

# === TYPES ===
create_label "type/bug" "$RED" "🐛 Bug confirmé"
create_label "type/feature" "$BLUE" "✨ Nouvelle fonctionnalité"
create_label "type/improvement" "$GREEN" "🔧 Amélioration existante"
create_label "type/documentation" "$PURPLE" "📚 Documentation"
create_label "type/maintenance" "$GRAY" "🛠️ Maintenance technique"

# === STATUS ===
create_label "status/needs-triage" "$YELLOW" "🔍 Nécessite une analyse initiale"
create_label "status/needs-review" "$ORANGE" "👀 En attente de review"
create_label "status/in-progress" "$BLUE" "🚧 En cours de développement"
create_label "status/blocked" "$RED" "🚫 Bloqué, dépendance externe"
create_label "status/ready-for-test" "$GREEN" "🧪 Prêt pour les tests"

# === COMPOSANTS ===
create_label "component/frontend" "$BLUE" "⚛️ Interface utilisateur React/Next.js"
create_label "component/backend" "$GREEN" "🔧 API et logique serveur"
create_label "component/database" "$PURPLE" "🗃️ Base de données et migrations"
create_label "component/auth" "$ORANGE" "🔐 Authentification et autorisation"
create_label "component/payments" "$PINK" "💳 Intégration Stripe"
create_label "component/monitoring" "$GRAY" "📊 Monitoring et alertes"
create_label "component/ci-cd" "$YELLOW" "🚀 CI/CD et déploiement"

# === EFFORT ===
create_label "effort/xs" "$GREEN" "⚡ < 2 heures"
create_label "effort/small" "$YELLOW" "🕐 2-8 heures" 
create_label "effort/medium" "$ORANGE" "📅 1-3 jours"
create_label "effort/large" "$RED" "📆 3+ jours"

# === SPÉCIAUX ===
create_label "good-first-issue" "$GREEN" "👋 Parfait pour débuter sur le projet"
create_label "help-wanted" "$BLUE" "🙋 Aide externe bienvenue"
create_label "question" "$PURPLE" "❓ Question ou discussion"
create_label "duplicate" "$GRAY" "📋 Duplicate d'une issue existante"
create_label "wontfix" "$RED" "🚫 Ne sera pas corrigé"
create_label "security" "$RED" "🔒 Problème de sécurité"

echo ""
echo "✅ Labels configurés avec succès !"
echo "🔍 Vérifiez sur: https://github.com/Enemles/webrly/labels"
