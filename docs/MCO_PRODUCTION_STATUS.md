# ✅ Test MCO Production - Guide Simplifié

## 🎯 Ce qui FONCTIONNE actuellement sur https://webrly.fr

### **1. ✅ Webhook Alertmanager → GitHub Issues**

**Endpoint** : `POST https://webrly.fr/api/webhooks/alertmanager`

**Test fonctionnel** :
```bash
curl -X POST https://webrly.fr/api/webhooks/alertmanager \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer alertmanager_secret_2024_mco" \
  -d '{
    "alerts": [
      {
        "labels": {
          "alertname": "Production_Test",
          "severity": "warning", 
          "instance": "webrly.fr:443",
          "service": "mco-validation"
        },
        "annotations": {
          "summary": "Test MCO Production - Création Issue GitHub",
          "description": "Validation du système de monitoring automatique"
        },
        "status": "firing",
        "startsAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
      }
    ],
    "groupKey": "mco-production-test",
    "status": "firing"
  }'
```

**Résultat attendu** :
- ✅ HTTP 200 OK
- ✅ Issue GitHub créée automatiquement : https://github.com/Enemles/webrly/issues
- ✅ Logs structurés dans Coolify

---

### **2. ✅ Site Principal**

**Test** : `curl https://webrly.fr`
- ✅ HTTP 200 OK
- ✅ Site accessible et fonctionnel

---

### **3. ⚠️ APIs de Test Sentry**

**Problème** : Routes non déployées en production
- ❌ `https://webrly.fr/api/sentry-test/*` → 404
- ❌ `https://webrly.fr/sentry-example-page` → 404

**Cause** : Fichiers créés après le dernier build/déploiement

**Solution** : Redéployer ou tester en développement local

---

## 🔧 Tests à effectuer

### **Test 1 : Webhook fonctionnel**
```bash
./scripts/test-mco-production.sh webhook
```

### **Test 2 : Création d'issue GitHub**
Utilisez la commande curl ci-dessus, puis vérifiez :
- https://github.com/Enemles/webrly/issues

### **Test 3 : Logs de production**
- Surveillez les logs Coolify pendant le test webhook
- Vérifiez les logs structurés JSON

---

## 🎉 Statut MCO

| Composant | Statut | Test |
|-----------|--------|------|
| **Webhook Alertmanager** | ✅ OPÉRATIONNEL | Issue #25 créée avec succès |
| **Logging structuré** | ✅ OPÉRATIONNEL | Logs JSON visibles |
| **Site principal** | ✅ OPÉRATIONNEL | https://webrly.fr accessible |
| **Sentry (dev)** | ✅ ACTIF | Capture les erreurs en développement |
| **APIs test Sentry** | ⚠️ NON DÉPLOYÉES | À inclure au prochain déploiement |

---

## 📋 Actions immédiates

1. **✅ Tester le webhook** : Utilisez la commande curl ci-dessus
2. **📊 Vérifier les issues GitHub** : Nouvelle issue créée ?  
3. **🔄 Redéployer** : Pour avoir les APIs de test Sentry
4. **🎯 Valider Sentry** : Une fois les APIs déployées

---

## 🚀 Conclusion

Le **système MCO est fonctionnel** ! Le webhook Alertmanager crée bien les issues GitHub automatiquement. 

Pour **Sentry** : Il est configuré et fonctionne (on le voit dans les stack traces), mais les APIs de test ne sont pas encore déployées en production.

**Prochaine étape** : Redéployer pour avoir les APIs de test, puis valider Sentry dashboard.
