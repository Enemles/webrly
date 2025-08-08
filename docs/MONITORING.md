# 📊 Guide Complet - Stack de Monitoring

## 🏗️ Architecture de votre setup

### Serveur de Monitoring (VPS dédié)
- **Prometheus** : Collecte et stockage des métriques
- **Alertmanager** : Gestion des alertes
- **Grafana** : Visualisation et dashboards
- **Node Exporter** : Métriques système du serveur de monitoring

### Serveur Coolify (serveur applicatif)
- **Node Exporter** : Métriques système
- **cAdvisor** : Métriques des conteneurs Docker
- **Application Next.js** : Métriques applicatives personnalisées

---

## 🔍 Prometheus - Le Collecteur de Métriques

### **Qu'est-ce que c'est ?**
Prometheus est une base de données de séries temporelles qui collecte des métriques depuis diverses sources.

### **Comment ça fonctionne ?**
- **Pull Model** : Prometheus "tire" les données depuis vos services
- **Scraping** : Il interroge vos endpoints `/metrics` toutes les X secondes
- **Stockage** : Les données sont stockées avec un timestamp
- **Requêtes** : Utilise PromQL pour interroger les données

### **Comment vous en servir ?**

#### Interface Web : `http://134.122.66.187:9090`

**1. Explorer les métriques disponibles :**
- Onglet "Graph" → Tapez le début d'une métrique → Autocomplétion
- Exemples de métriques utiles :
  ```promql
  # CPU usage
  100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
  
  # Memory usage
  (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100
  
  # HTTP requests per second
  rate(nextjs_http_requests_total[5m])
  
  # Container CPU usage
  rate(container_cpu_usage_seconds_total[5m]) * 100
  ```

**2. Vérifier les cibles :**
- Status → Targets
- Vérifiez que tous vos services sont "UP"

**3. Tester les alertes :**
- Alerts → Voir les alertes actives
- Rules → Voir toutes les règles définies

### **Métriques importantes à surveiller :**

#### **Métriques Système (Node Exporter)**
```promql
# CPU
node_cpu_seconds_total

# Mémoire
node_memory_MemTotal_bytes
node_memory_MemAvailable_bytes

# Disque
node_filesystem_avail_bytes
node_filesystem_size_bytes

# Réseau
node_network_receive_bytes_total
node_network_transmit_bytes_total
```

#### **Métriques Conteneurs (cAdvisor)**
```promql
# CPU des conteneurs
container_cpu_usage_seconds_total

# Mémoire des conteneurs
container_memory_usage_bytes
container_memory_max_usage_bytes

# Réseau des conteneurs
container_network_receive_bytes_total
container_network_transmit_bytes_total
```

#### **Métriques Application (Next.js)**
```promql
# Requêtes HTTP
nextjs_http_requests_total

# Latence des requêtes
nextjs_http_request_duration_seconds

# Métriques Node.js par défaut
nextjs_process_cpu_user_seconds_total
nextjs_nodejs_heap_size_used_bytes
```

---

## 🚨 Alertmanager - Le Gestionnaire d'Alertes

### **Qu'est-ce que c'est ?**
Alertmanager reçoit les alertes de Prometheus et les route vers les bons canaux (email, Slack, webhooks...).

### **Comment ça fonctionne ?**
1. **Prometheus évalue les règles** d'alerte
2. **Envoie les alertes** à Alertmanager
3. **Alertmanager groupe et route** selon la configuration
4. **Envoie les notifications** aux destinataires

### **Comment vous en servir ?**

#### Interface Web : `http://134.122.66.187:9093`

**1. Voir les alertes actives :**
- Page principale : alertes en cours
- Status : état des receivers

**2. Configurer les notifications :**
```yaml
# Dans alertmanager/alertmanager.yml
receivers:
- name: 'email-alerts'
  email_configs:
  - to: 'admin@yourdomain.com'
    subject: '[ALERT] {{ .GroupLabels.alertname }}'
    body: |
      🚨 **Alerte : {{ .GroupLabels.alertname }}**
      
      **Serveur :** {{ .Labels.instance }}
      **Sévérité :** {{ .Labels.severity }}
      **Description :** {{ .Annotations.description }}
      
      **Détails :**
      {{ range .Alerts }}
      - {{ .Annotations.summary }}
      {{ end }}

- name: 'webhook-slack'
  webhook_configs:
  - url: 'YOUR_SLACK_WEBHOOK_URL'
```

**3. Tester les alertes :**
```bash
# Simuler une charge CPU
stress --cpu 4 --timeout 300s

# Arrêter un service
docker stop cadvisor
```

### **Alertes pré-configurées importantes :**

```yaml
# Serveur inaccessible
- alert: InstanceDown
  expr: up == 0
  for: 1m

# CPU élevé
- alert: HighCPUUsage
  expr: 100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
  for: 2m

# Mémoire élevée
- alert: HighMemoryUsage
  expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
  for: 2m

# Espace disque faible
- alert: DiskSpaceLow
  expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
  for: 1m

# Application Next.js down
- alert: NextJSAppDown
  expr: up{job="nextjs-app"} == 0
  for: 1m

# Taux d'erreur élevé
- alert: NextJSHighErrorRate
  expr: rate(nextjs_http_requests_total{status_code=~"5.."}[5m]) > 0.1
  for: 1m
```

---

## 📈 Grafana - Les Dashboards Visuels

### **Qu'est-ce que c'est ?**
Grafana transforme vos métriques Prometheus en graphiques et dashboards interactifs.

### **Comment ça fonctionne ?**
- **Data Sources** : Connexion à Prometheus
- **Dashboards** : Collections de panneaux graphiques
- **Panels** : Graphiques individuels (lignes, barres, gauges...)
- **Variables** : Filtres dynamiques

### **Comment vous en servir ?**

#### Interface Web : `http://134.122.66.187:3000`
**Login :** admin / adminPass

**1. Configuration initiale :**
```bash
# Ajout de Prometheus comme Data Source
- URL: http://prometheus:9090
- Access: Server (default)
- HTTP Method: GET
```

**2. Dashboards recommandés à importer :**
- **Node Exporter Full** : ID `1860`
- **Docker Container & Host Metrics** : ID `10619`
- **Traefik Dashboard** : ID `4475`

**3. Créer vos propres dashboards :**

#### **Dashboard Système :**
```promql
# Panel CPU Usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Panel Memory Usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100

# Panel Disk Usage
100 - ((node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100)

# Panel Network I/O
rate(node_network_receive_bytes_total[5m])
rate(node_network_transmit_bytes_total[5m])
```

#### **Dashboard Application :**
```promql
# Panel Request Rate
sum(rate(nextjs_http_requests_total[5m]))

# Panel Error Rate
sum(rate(nextjs_http_requests_total{status_code=~"5.."}[5m])) / sum(rate(nextjs_http_requests_total[5m])) * 100

# Panel Response Time
histogram_quantile(0.95, rate(nextjs_http_request_duration_seconds_bucket[5m]))

# Panel Active Connections
nextjs_active_users
```

**4. Alerting dans Grafana :**
- Créez des alertes visuelles
- Intégration avec Alertmanager
- Notifications vers Slack, Discord, etc.

---

## 🔧 Node Exporter - Métriques Système

### **Qu'est-ce que c'est ?**
Node Exporter expose les métriques système Linux (CPU, RAM, disque, réseau...).

### **Métriques principales :**
- **CPU** : Utilisation par core, load average
- **Mémoire** : Total, libre, utilisée, cache
- **Disque** : Espace, I/O, inodes
- **Réseau** : Bytes envoyés/reçus, erreurs
- **Système** : Uptime, nombre de processus

### **Endpoint :** `http://YOUR_SERVER:9101/metrics`

---

## 🐳 cAdvisor - Métriques Docker

### **Qu'est-ce que c'est ?**
cAdvisor collecte les métriques des conteneurs Docker en temps réel.

### **Métriques principales :**
- **CPU** : Utilisation par conteneur
- **Mémoire** : Usage, limites, cache
- **Réseau** : Trafic entrant/sortant
- **Disque** : I/O des conteneurs

### **Interface Web :** `http://YOUR_COOLIFY_SERVER:8889`
### **Métriques :** `http://YOUR_COOLIFY_SERVER:8889/metrics`

---

## 🎯 Utilisation Quotidienne

### **Surveillance Quotidienne :**

1. **Vérifiez Grafana** (5 min/jour) :
   - Dashboard système : CPU, RAM, disque
   - Dashboard application : requêtes, erreurs, latence

2. **Vérifiez les alertes** :
   - Alertmanager : alertes actives
   - Email : notifications reçues

3. **Métriques clés à surveiller :**
   - **CPU > 80%** pendant > 5 min → Investigate
   - **RAM > 85%** → Risque de swap
   - **Disque < 10%** → Nettoyage urgent
   - **Erreurs 5xx** → Problème application

### **Diagnostic de Problèmes :**

#### **Performance lente :**
```promql
# CPU par processus
topk(10, rate(container_cpu_usage_seconds_total[5m]))

# Conteneurs utilisant le plus de RAM
topk(10, container_memory_usage_bytes)

# Latence des requêtes
histogram_quantile(0.95, rate(nextjs_http_request_duration_seconds_bucket[5m]))
```

#### **Erreurs applicatives :**
```promql
# Taux d'erreur par endpoint
sum by (route) (rate(nextjs_http_requests_total{status_code=~"5.."}[5m]))

# Comparaison avant/après
rate(nextjs_http_requests_total{status_code=~"5.."}[5m] offset 1h)
```

### **Maintenance :**

#### **Hebdomadaire :**
- Nettoyer les métriques anciennes
- Vérifier l'espace disque Prometheus
- Tester les alertes

#### **Mensuelle :**
- Backup des configurations
- Mise à jour des règles d'alertes
- Révision des dashboards

---

## 🚀 Commandes Utiles

### **Debugging :**
```bash
# Restart des services
cd ~/monitoring
docker-compose restart prometheus
docker-compose restart alertmanager
docker-compose restart grafana

# Voir les logs
docker-compose logs prometheus
docker-compose logs -f alertmanager

# Tester la config Prometheus
docker exec prometheus promtool check config /etc/prometheus/prometheus.yml

# Reload config sans restart
curl -X POST http://localhost:9090/-/reload
```

### **Queries PromQL utiles :**
```promql
# Top 10 containers by CPU
topk(10, rate(container_cpu_usage_seconds_total[5m]))

# Memory usage by container
container_memory_usage_bytes / container_spec_memory_limit_bytes * 100

# Network traffic
sum(rate(container_network_receive_bytes_total[5m])) by (name)

# HTTP requests rate
sum(rate(nextjs_http_requests_total[5m])) by (route)
```

---

## 📱 Configuration Notifications

### **Email (Gmail) :**
```yaml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'your-email@gmail.com'
  smtp_auth_username: 'your-email@gmail.com'
  smtp_auth_password: 'your-app-password'

receivers:
- name: 'email-alerts'
  email_configs:
  - to: 'admin@yourdomain.com'
    subject: '🚨 [{{ .Status | toUpper }}] {{ .GroupLabels.alertname }}'
    html: |
      <h2>🚨 Alerte {{ .Status | toUpper }}</h2>
      <p><strong>Alerte:</strong> {{ .GroupLabels.alertname }}</p>
      <p><strong>Sévérité:</strong> {{ .GroupLabels.severity }}</p>
      {{ range .Alerts }}
      <ul>
        <li><strong>Instance:</strong> {{ .Labels.instance }}</li>
        <li><strong>Description:</strong> {{ .Annotations.description }}</li>
        <li><strong>Valeur:</strong> {{ .Annotations.summary }}</li>
      </ul>
      {{ end }}
```

### **Slack :**
```yaml
receivers:
- name: 'slack-alerts'
  slack_configs:
  - api_url: 'YOUR_SLACK_WEBHOOK_URL'
    channel: '#monitoring'
    title: '🚨 {{ .GroupLabels.alertname }}'
    text: |
      {{ range .Alerts }}
      *Instance:* {{ .Labels.instance }}
      *Description:* {{ .Annotations.description }}
      *Severity:* {{ .Labels.severity }}
      {{ end }}
```

---

## 🎯 Prochaines Étapes

1. **Finaliser cAdvisor** - Pour monitorer vos conteneurs
2. **Configurer les notifications** - Email ou Slack
3. **Créer des dashboards personnalisés** - Selon vos besoins
4. **Ajouter plus de métriques applicatives** - Business metrics
5. **Configurer la rétention** - Optimiser l'espace disque
6. **Sécuriser les accès** - HTTPS et authentification

Cette stack vous donne une visibilité complète sur votre infrastructure et application ! 🚀