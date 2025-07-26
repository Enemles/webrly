# 🔧 Guide de Test MCO - Webrly Production

## 📋 Vue d'ensemble

Ce guide explique comment tester tous les composants du système MCO (Maintien en Condition Opérationnelle) déployés sur **webrly.fr**.

### ✅ Composants MCO Déployés
- **Webhook Alertmanager → GitHub Issues** (automatisation des alertes)
- **Système de logging structuré** (production-ready)
- **Infrastructure de monitoring** (Prometheus + Grafana)
- **Tests d'erreur Sentry** (temporairement désactivé)

---

## 🎯 1. Test du Webhook Alertmanager

### **Objectif**: Vérifier que les alertes Prometheus génèrent automatiquement des GitHub Issues

### **🔗 Endpoint de test**:
```bash
POST https://webrly.fr/api/webhooks/alertmanager
```

### **📋 Étapes de test**:

#### **Option A: Test via curl (Terminal)**
```bash
curl -X POST https://webrly.fr/api/webhooks/alertmanager \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WEBHOOK_SECRET" \
  -d '{
    "alerts": [
      {
        "labels": {
          "alertname": "TestAlert",
          "severity": "critical",
          "instance": "webrly.fr:443",
          "service": "frontend"
        },
        "annotations": {
          "summary": "Test alert from MCO system",
          "description": "This is a test alert to verify webhook functionality"
        },
        "status": "firing",
        "startsAt": "2025-07-21T13:00:00Z"
      }
    ],
    "groupKey": "test-group",
    "status": "firing"
  }'
```

#### **Option B: Test via interface web**
1. Aller sur: https://webrly.fr/test-webhook (si créé)
2. Cliquer sur "Test Webhook Alert"
3. Vérifier la réponse

### **✅ Résultat attendu**:
- **Réponse HTTP**: 200 OK avec message de succès
- **GitHub**: Nouvelle issue créée automatiquement dans le repo `Enemles/webrly`
- **Format issue**:
  ```
  Title: 🚨 [CRITICAL] TestAlert - webrly.fr:443
  Labels: alert, critical, mco-system
  Body: Description + métadonnées structurées
  ```

---

## 📊 2. Test du Système de Logging

### **Objectif**: Vérifier que les logs de production sont bien structurés et tracés

### **🔗 Endpoints de test**:
```bash
# Test d'erreur serveur
GET https://webrly.fr/api/sentry-test/server-error

# Test d'erreur de base de données  
GET https://webrly.fr/api/sentry-test/database-error

# Test de timeout
GET https://webrly.fr/api/sentry-test/timeout-error
```

### **📋 Étapes de test**:

#### **Test via curl**:
```bash
# Test erreur serveur
curl https://webrly.fr/api/sentry-test/server-error

# Test erreur base de données
curl https://webrly.fr/api/sentry-test/database-error

# Test timeout
curl https://webrly.fr/api/sentry-test/timeout-error
```

### **✅ Résultat attendu**:
- **Réponse HTTP**: 500 avec message d'erreur JSON
- **Logs serveur**: Logs structurés visibles dans les logs Coolify/production
- **Format log**:
  ```json
  {
    "timestamp": "2025-07-21T13:30:00.000Z",
    "level": "error", 
    "message": "Test server error",
    "context": {
      "component": "api/sentry-test",
      "action": "error-simulation",
      "metadata": { "test_type": "server_error" }
    },
    "environment": "production"
  }
  ```

---

## 🧪 3. Test Interface d'Erreur (Client)

### **Objectif**: Tester les erreurs côté client et la capture

### **🔗 Page de test**:
```
https://webrly.fr/sentry-example-page
```

### **📋 Étapes de test**:
1. **Aller sur**: https://webrly.fr/sentry-example-page
2. **Tester les boutons**:
   - "Trigger Client Error" → Erreur JavaScript côté client
   - "Trigger Server Error" → Appel API avec erreur serveur
   - "Trigger Async Error" → Erreur asynchrone
   - "Trigger Custom Error" → Erreur personnalisée

### **✅ Résultat attendu**:
- **Interface**: Boutons fonctionnels avec feedback visuel
- **Console**: Erreurs loggées dans la console développeur
- **Production**: Logs d'erreur dans les logs serveur

---

## 🚀 4. Test Complet End-to-End

### **Scénario**: Simuler une panne complète et vérifier l'écosystème MCO

#### **🎬 Étapes**:
1. **Déclencher une alerte critique**:
   ```bash
   curl -X POST https://webrly.fr/api/webhooks/alertmanager \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_SECRET" \
     -d '{
       "alerts": [{
         "labels": {
           "alertname": "ProductionDown",
           "severity": "critical",
           "instance": "webrly.fr:443"
         },
         "annotations": {
           "summary": "Production website is down",
           "description": "HTTP 5xx errors detected"
         },
         "status": "firing"
       }]
     }'
   ```

2. **Déclencher des erreurs applicatives**:
   ```bash
   curl https://webrly.fr/api/sentry-test/server-error
   curl https://webrly.fr/api/sentry-test/database-error
   ```

3. **Vérifier les réactions**:
   - Issue GitHub créée ✅
   - Logs structurés générés ✅
   - Système reste disponible ✅

---

## 🔍 5. Vérification des Issues GitHub

### **Comment reproduire l'Issue #25 créée précédemment**:

#### **Commande exacte utilisée**:
```bash
curl -X POST https://webrly.fr/api/webhooks/alertmanager \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer alertmanager_secret_2024_mco" \
  -d '{
    "alerts": [
      {
        "labels": {
          "alertname": "HighMemoryUsage",
          "severity": "warning",
          "instance": "webrly.fr:443",
          "service": "web-server"
        },
        "annotations": {
          "summary": "High memory usage detected",
          "description": "Memory usage is above 85% for more than 5 minutes"
        },
        "status": "firing",
        "startsAt": "2025-07-21T12:00:00Z"
      }
    ],
    "groupKey": "memory-alerts",
    "status": "firing"
  }'
```

### **✅ Résultat obtenu**:
- **Issue GitHub #25** créée automatiquement
- **Titre**: `🚨 [WARNING] HighMemoryUsage - webrly.fr:443`
- **Labels**: `alert`, `warning`, `mco-system`
- **Statut**: Fermée après résolution

---

## 📈 6. Monitoring et Métriques

### **URLs à surveiller**:
- **Site principal**: https://webrly.fr
- **API Health**: https://webrly.fr/api/health (si implémenté)
- **Webhook Alertmanager**: https://webrly.fr/api/webhooks/alertmanager

### **Métriques clés**:
- ✅ **Disponibilité**: >99.9%
- ✅ **Temps de réponse**: <2s
- ✅ **Taux d'erreur**: <1%
- ✅ **Issues GitHub**: Créées automatiquement sur alertes

---

## 🛠 7. Dépannage

### **Problèmes courants**:

#### **Webhook ne fonctionne pas**:
```bash
# Vérifier les logs
curl https://webrly.fr/api/webhooks/alertmanager \
  -H "Authorization: Bearer WRONG_SECRET" \
  -d '{}' -v
```
**Solution**: Vérifier `ALERTMANAGER_WEBHOOK_SECRET` dans l'environnement

#### **Logs non structurés**:
**Solution**: Vérifier `NODE_ENV=production` et les variables d'environnement

#### **Issues GitHub non créées**:
**Solution**: Vérifier `GITHUB_TOKEN` et permissions du token

---

## 📝 8. Prochaines Étapes MCO

### **Phase Mid-term (à venir)**:
- [ ] **CI/CD automatisé** (tests + déploiement)
- [ ] **Tests de charge** (performance)
- [ ] **Système de backup** automatique
- [ ] **Monitoring avancé** (APM)

### **Phase Long-term**:
- [ ] **Auto-scaling** infrastructure
- [ ] **Disaster Recovery** multi-région
- [ ] **Monitoring prédictif** IA

---

## 🎯 Résumé des Tests Essentiels

| Test | Commande | Résultat Attendu |
|------|----------|------------------|
| **Webhook** | `curl POST /api/webhooks/alertmanager` | Issue GitHub créée |
| **Logging** | `curl /api/sentry-test/server-error` | Logs structurés |
| **Interface** | Visiter `/sentry-example-page` | Boutons fonctionnels |
| **Production** | Vérifier https://webrly.fr | Site accessible |

---

**🚀 Le système MCO est opérationnel ! Testez et validez chaque composant pour assurer la robustesse de votre infrastructure.**
