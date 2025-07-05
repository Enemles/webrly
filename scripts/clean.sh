#!/bin/bash

# 🧹 Script de nettoyage rapide Webrly K8s

echo "🧹 Nettoyage environnement Webrly..."

# Supprimer les namespaces (supprime tout le contenu)
echo "🗑️  Suppression des namespaces..."
kubectl delete namespace webrly --timeout=20s 2>/dev/null || true
kubectl delete namespace webrly-monitoring --timeout=20s 2>/dev/null || true

# Attendre un peu
echo "⏳ Attente de la suppression..."
sleep 10

# Nettoyer les volumes persistants orphelins
echo "💾 Nettoyage des volumes..."
kubectl get pv | grep -E "(webrly|postgres)" | awk '{print $1}' | xargs -r kubectl delete pv 2>/dev/null || true

echo "✅ Nettoyage terminé !"
echo ""
echo "▶️  Relancer le déploiement :"
echo "   kubectl apply -f k8s/deploy.yaml"
