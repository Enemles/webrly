# 🚨 Guide Pratique - Système d'Alertes Webrly

## 🎯 Vue d'ensemble

Votre système d'alertes surveille automatiquement :
- **Performance applicative** (latence, erreurs, trafic)
- **Ressources système** (CPU, RAM, disque)
- **Métriques business** (contacts, tickets, abonnements)
- **Santé des services** (app down, conteneurs)

---

## 📊 Interfaces de Monitoring

### **🎨 Grafana - Dashboard Principal**
```
URL: http://174.138.2.56:3000
Login: admin / ChangeThisPassword123!
```

**Utilisation quotidienne :**
- **Alerting → List** : Vue d'ensemble des alertes
- **Dashboards** : Graphiques en temps réel
- **Explore** : Requêtes PromQL personnalisées

### **🚨 Alertmanager - Gestion des Alertes**
```
URL: http://174.138.2.56:9093
```

**Fonctionnalités :**
- **Alertes actives** en temps réel
- **Silences** : Désactiver temporairement une alerte
- **Groupement** : Alertes similaires regroupées
- **Historique** : Log des notifications envoyées

### **📈 Prometheus - Métriques Brutes**
```
URL: http://174.138.2.56:9090
```

**Pour le debug :**
- **Graph** : Tester des requêtes PromQL
- **Rules** : État des règles d'alertes
- **Targets** : Santé des services surveillés

---

## 🔔 Types d'Alertes Configurées

### **🚀 Alertes Application (Next.js)**

| Alerte | Seuil | Sévérité | Action |
|--------|-------|----------|--------|
| `NextJSAppDown` | App inaccessible > 1min | 🚨 CRITICAL | Vérifier Coolify |
| `NextJSHighErrorRate` | > 0.1 erreur/sec | ⚠️ WARNING | Vérifier logs |
| `NextJSCriticalErrorRate` | > 0.5 erreur/sec | 🚨 CRITICAL | Investigation urgente |
| `NextJSHighLatency` | P95 > 2s | ⚠️ WARNING | Optimisation |
| `NextJSCriticalLatency` | P95 > 5s | 🚨 CRITICAL | Investigation |
| `NextJSLowRequestRate` | < 0.1 req/sec | ⚠️ WARNING | Trafic anormal |

### **💾 Alertes Mémoire**

| Alerte | Seuil | Sévérité | Action |
|--------|-------|----------|--------|
| `NextJSHighMemoryUsage` | > 500MB | ⚠️ WARNING | Surveillance |
| `NextJSCriticalMemoryUsage` | > 800MB | 🚨 CRITICAL | Investigation |
| `NextJSMemoryLeak` | +200MB en 2h | 🚨 CRITICAL | Redémarrage app |

### **💼 Alertes Business**

| Alerte | Condition | Sévérité | Action |
|--------|-----------|----------|--------|
| `NoNewContactsToday` | 0 contact après 10h | ⚠️ WARNING | Vérifier campagnes |
| `LowTicketValue` | < 1000€ total | ⚠️ WARNING | Relance commerciale |
| `NoActiveSubscriptions` | 0 abonnement | 🚨 CRITICAL | Problème critique |
| `LowFunnelConversion` | < 50% publiés | ⚠️ WARNING | Optimisation |

---

## 📧 Configuration des Notifications Email

### **1. Configurer Gmail**

**Étapes :**
1. Activer l'authentification 2FA sur Gmail
2. Générer un "Mot de passe d'application"
3. Modifier le fichier `monitoring/alertmanager/alertmanager.yml` :

```yaml
global:
  smtp_auth_username: 'votre-email@gmail.com'
  smtp_auth_password: 'votre-mot-de-passe-app'

receivers:
- name: 'email-critical'
  email_configs:
  - to: 'admin@webrly.fr'  # Votre email
```

### **2. Redémarrer Alertmanager**
```bash
cd monitoring
docker-compose restart alertmanager
```

### **3. Tester les notifications**
```bash
# Simuler une alerte (API v2)
curl -XPOST http://174.138.2.56:9093/api/v2/alerts -H 'Content-Type: application/json' -d '[
  {
    "labels": {
      "alertname": "TestAlert",
      "severity": "warning"
    },
    "annotations": {
      "summary": "Test de notification email"
    }
  }
]'
```

---

## 🛠️ Actions selon les Alertes

### **🚨 Alertes CRITICAL - Action Immédiate**

#### **`NextJSAppDown`**
```bash
# 1. Vérifier Coolify
ssh root@134.122.66.187
docker ps | grep webrly

# 2. Redémarrer si nécessaire
# Via interface Coolify ou commande Docker
```

#### **`NextJSCriticalMemoryUsage`**
```bash
# 1. Vérifier la consommation
curl -s "http://174.138.2.56:9090/api/v1/query?query=nextjs_process_resident_memory_bytes"

# 2. Redémarrer l'app si > 800MB
# Via Coolify interface
```

#### **`NextJSMemoryLeak`**
```bash
# Redémarrage programmé de l'application
# Planifier un redémarrage pendant les heures creuses
```

### **⚠️ Alertes WARNING - Surveillance Renforcée**

#### **`NextJSHighErrorRate`**
```bash
# 1. Vérifier les logs d'erreur
curl -s "http://174.138.2.56:9090/api/v1/query?query=rate(nextjs_http_requests_total{status_code=~\"5..\"}[5m])"

# 2. Identifier les endpoints problématiques
# Grafana → Dashboard → Panel "Erreurs par Route"
```

#### **`NoNewContactsToday`**
```bash
# 1. Vérifier les campagnes marketing
# 2. Contrôler les formulaires de contact
# 3. Vérifier les intégrations CRM
```

---

## 🔧 Commandes Utiles

### **Gestion des Services**
```bash
cd monitoring

# Redémarrer tous les services
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart alertmanager
docker-compose restart prometheus
docker-compose restart grafana

# Voir les logs
docker-compose logs -f alertmanager
docker-compose logs -f prometheus
```

### **Debug des Alertes**
```bash
# Vérifier les règles
docker-compose exec prometheus promtool check rules /etc/prometheus/rules/nextjs.yml

# Recharger la config sans redémarrage
curl -X POST http://174.138.2.56:9090/-/reload

# Tester une requête PromQL
curl -s "http://174.138.2.56:9090/api/v1/query?query=up"
```

### **Gestion des Silences**
```bash
# Créer un silence (via API v2)
curl -XPOST http://174.138.2.56:9093/api/v2/silences -H 'Content-Type: application/json' -d '{
  "matchers": [
    {
      "name": "alertname",
      "value": "NextJSHighMemoryUsage",
      "isRegex": false
    }
  ],
  "startsAt": "2024-01-01T00:00:00Z",
  "endsAt": "2024-01-01T01:00:00Z",
  "createdBy": "admin",
  "comment": "Maintenance programmée"
}'
```

---

## 📱 Surveillance Mobile

### **Applications recommandées :**
- **Grafana Mobile App** : Dashboards sur mobile
- **Prometheus Alertmanager** : Notifications push
- **Email** : Notifications critiques par email

### **Dashboards mobiles optimisés :**
- CPU/RAM en temps réel
- Alertes actives
- Métriques business clés

---

## 🎯 Bonnes Pratiques

### **Quotidien (5 min/jour)**
1. **Vérifier Grafana** : Dashboard principal
2. **Contrôler les alertes** : Aucune alerte CRITICAL active
3. **Surveiller les métriques business** : Contacts, tickets, abonnements

### **Hebdomadaire (15 min/semaine)**
1. **Réviser les seuils** : Ajuster selon l'usage réel
2. **Nettoyer les silences** : Supprimer les silences expirés
3. **Tester les notifications** : Vérifier que les emails arrivent

### **Mensuel (30 min/mois)**
1. **Backup des configs** : Sauvegarder les règles et dashboards
2. **Mise à jour des règles** : Ajouter de nouvelles métriques
3. **Révision des alertes** : Analyser les faux positifs

---

## 🆘 Contacts d'Urgence

### **En cas de problème critique :**
1. **Vérifier les interfaces** : Grafana, Prometheus, Alertmanager
2. **Consulter les logs** : `docker-compose logs`
3. **Redémarrer les services** : `docker-compose restart`
4. **Contacter le support** : Si problème persistant

### **Escalade :**
- **Niveau 1** : Alertes WARNING → Surveillance
- **Niveau 2** : Alertes CRITICAL → Action immédiate
- **Niveau 3** : Services DOWN → Intervention urgente

---

## 📚 Ressources Utiles

- **Documentation Prometheus** : https://prometheus.io/docs/
- **Documentation Grafana** : https://grafana.com/docs/
- **PromQL Guide** : https://prometheus.io/docs/prometheus/latest/querying/
- **Alertmanager Config** : https://prometheus.io/docs/alerting/latest/configuration/

---

*Dernière mise à jour : $(date)*
*Système configuré pour Webrly CRM - Production* 