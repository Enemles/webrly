# SLA/SLO Webrly - Service Level Agreements & Objectives

## 📋 Vue d'ensemble

Cette documentation définit les **Service Level Objectives (SLO)** et **Service Level Agreements (SLA)** pour la plateforme Webrly dans le cadre du système MCO (Maintenance in Operational Condition).

## 🎯 Service Level Objectives (SLO)

### 🚀 Disponibilité (Availability)

| Service | SLO | Mesure | Période | Impact Business |
|---------|-----|--------|---------|-----------------|
| **Site Web Principal** | 99.5% | `up{job="webrly-web"}` | Mensuel | Critique - Acquisition clients |
| **API Backend** | 99.7% | `up{job="webrly-api"}` | Mensuel | Critique - Fonctionnalités core |
| **Base de Données** | 99.9% | `pg_up` | Mensuel | Critique - Données persistantes |
| **Authentification** | 99.5% | `auth_service_up` | Mensuel | Élevé - Accès utilisateur |
| **Paiements Stripe** | 99.8% | `stripe_api_up` | Mensuel | Critique - Revenus |

### ⚡ Performance

| Métrique | SLO | Mesure Prometheus | Seuil d'Alerte | Impact |
|----------|-----|-------------------|----------------|---------|
| **Temps de réponse P95** | < 2 secondes | `histogram_quantile(0.95, http_request_duration_seconds_bucket)` | > 1.5s | UX dégradée |
| **Temps de réponse P99** | < 5 secondes | `histogram_quantile(0.99, http_request_duration_seconds_bucket)` | > 3s | UX critique |
| **TTFB (Time To First Byte)** | < 500ms | `http_request_duration_seconds{handler="/"} - http_response_body_duration` | > 400ms | SEO impact |
| **Database Query Time P95** | < 100ms | `histogram_quantile(0.95, pg_stat_statements_mean_time_bucket)` | > 80ms | Performance API |

### 🎯 Qualité & Fiabilité

| Métrique | SLO | Mesure | Tolérance d'Erreur | Action |
|----------|-----|--------|-------------------|---------|
| **Taux d'Erreur HTTP** | < 1% | `rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100` | 0.5% | Investigation immédiate |
| **Taux d'Erreur Paiements** | < 2% | `rate(stripe_payment_failed_total[5m]) / rate(stripe_payment_total[5m]) * 100` | 1.5% | Alerte Business |
| **Taux d'Échec Authentification** | < 5% | `rate(auth_failed_total[5m]) / rate(auth_attempts_total[5m]) * 100` | 3% | Sécurité à vérifier |

## 📊 Service Level Agreements (SLA)

### 🏢 Engagements Clients

#### **Plan Gratuit**
- **Disponibilité:** 99.0% mensuelle
- **Support:** Documentation uniquement
- **Temps de réponse:** Meilleur effort
- **Compensation:** Aucune

#### **Plan Pro (€29/mois)**
- **Disponibilité:** 99.5% mensuelle
- **Temps de réponse API:** P95 < 2 secondes
- **Support:** Email sous 48h
- **Compensation:** Extension gratuite en cas de non-respect

#### **Plan Enterprise (€199/mois)**
- **Disponibilité:** 99.8% mensuelle
- **Temps de réponse API:** P95 < 1 seconde
- **Support:** Email sous 4h, téléphone
- **Compensation:** Remboursement proportionnel

### 📈 Calcul des SLA

```prometheus
# Disponibilité mensuelle
(
  sum(up{job="webrly-api"} * on() group_left() (time() - time() % 86400)) / 
  sum(time() - time() % 86400)
) * 100

# Temps de réponse moyen sur 30 jours  
avg_over_time(
  histogram_quantile(0.95, 
    rate(http_request_duration_seconds_bucket[5m])
  )[30d:1h]
)
```

## 🚨 Niveaux d'Incident

### Severity 1 - CRITIQUE
- **Définition:** Service complètement indisponible
- **SLA:** Résolution sous 2h
- **Notification:** Immédiate (SMS + Email)
- **Escalation:** CTO + Équipe DevOps
- **Exemples:**
  - Site web totalement down
  - Base de données inaccessible
  - Paiements bloqués

### Severity 2 - MAJEUR  
- **Définition:** Fonctionnalités principales dégradées
- **SLA:** Résolution sous 8h
- **Notification:** Email + Slack
- **Escalation:** Lead Dev + DevOps
- **Exemples:**
  - Lenteurs significatives (P95 > 5s)
  - Taux d'erreur > 5%
  - Authentification intermittente

### Severity 3 - MINEUR
- **Définition:** Fonctionnalités secondaires impactées
- **SLA:** Résolution sous 72h
- **Notification:** Slack uniquement
- **Escalation:** Équipe de développement
- **Exemples:**
  - Fonctionnalités non-critiques indisponibles
  - Lenteurs légères
  - Problèmes cosmétiques

## 📊 Monitoring & Alerting

### Règles d'Alerte SLA

```yaml
# Exemple de règles Prometheus pour SLA
groups:
  - name: sla-monitoring
    rules:
      - alert: SLABreachAvailability
        expr: |
          (
            avg_over_time(up{job="webrly-api"}[24h]) * 100
          ) < 99.5
        for: 5m
        labels:
          severity: critical
          sla: availability
        annotations:
          summary: "SLA Disponibilité en danger - {{ $value }}%"
          
      - alert: SLABreachResponseTime
        expr: |
          histogram_quantile(0.95, 
            avg_over_time(
              rate(http_request_duration_seconds_bucket[5m])[24h:5m]
            )
          ) > 2
        for: 10m
        labels:
          severity: warning  
          sla: performance
        annotations:
          summary: "SLA Temps de réponse dépassé - {{ $value }}s"
```

### Dashboard SLA

Le dashboard Grafana inclut:
- **Burn Rate Graphs:** Vitesse de consommation du budget d'erreur
- **SLA Status:** Statut temps réel des SLA
- **Error Budget:** Budget d'erreur restant ce mois
- **Historical Trends:** Évolution sur 3-6 mois

## 🔄 Process de Review

### Révision Mensuelle SLA
1. **Calcul des métriques** réelles vs objectifs
2. **Analyse des incidents** et leur impact SLA  
3. **Mise à jour** des seuils si nécessaire
4. **Communication** aux parties prenantes

### Révision Trimestrielle SLO
1. **Évaluation** de la pertinence des objectifs
2. **Ajustement** basé sur les retours utilisateurs
3. **Amélioration** des processus de monitoring
4. **Formation** équipes sur nouveaux standards

## 📞 Contacts Escalation

| Niveau | Contact | Délai Response | Moyens |
|---------|---------|----------------|---------|
| **L1 - Monitoring** | Grafana/PagerDuty | Immédiat | Webhook |
| **L2 - DevOps** | slack@devops-webrly | < 15 min | Slack + SMS |
| **L3 - Lead Tech** | lead@webrly.com | < 1h | Email + Téléphone |
| **L4 - Management** | cto@webrly.com | < 4h | Escalation formelle |

---
*Cette documentation fait partie du système MCO Webrly et doit être mise à jour à chaque modification d'architecture ou de processus.*
