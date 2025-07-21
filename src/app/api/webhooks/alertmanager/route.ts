import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils';

interface AlertmanagerAlert {
  status: 'firing' | 'resolved';
  labels: {
    alertname: string;
    instance?: string;
    job?: string;
    severity: 'critical' | 'warning' | 'info';
    component?: string;
    [key: string]: string | undefined;
  };
  annotations: {
    summary: string;
    description?: string;
    runbook_url?: string;
    [key: string]: string | undefined;
  };
  startsAt: string;
  endsAt?: string;
  generatorURL: string;
  fingerprint: string;
}

interface AlertmanagerPayload {
  receiver: string;
  status: string;
  alerts: AlertmanagerAlert[];
  groupLabels: Record<string, string>;
  commonLabels: Record<string, string>;
  commonAnnotations: Record<string, string>;
  externalURL: string;
  version: string;
  groupKey: string;
  truncatedAlerts?: number;
}

// Mapping sévérité → priorité GitHub
const SEVERITY_TO_PRIORITY = {
  critical: 'priority/critical',
  warning: 'priority/high',
  info: 'priority/medium'
} as const;

// Mapping composant → label GitHub
const COMPONENT_MAPPING = {
  database: 'component/database',
  api: 'component/backend', 
  frontend: 'component/frontend',
  auth: 'component/auth',
  payments: 'component/payments',
  monitoring: 'component/monitoring'
} as const;

async function createGitHubIssue(alert: AlertmanagerAlert) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || 'Enemles/webrly';
  
  if (!githubToken) {
    logger.warn('GitHub token not configured, skipping issue creation');
    return null;
  }

  const severity = alert.labels.severity;
  const component = alert.labels.component;
  const alertname = alert.labels.alertname;
  
  // Construction du titre
  const title = `[ALERT] ${alertname} - ${alert.annotations.summary}`;
  
  // Construction du corps de l'issue
  const body = `## 🚨 Alert Prometheus Auto-Generated

**Status:** ${alert.status === 'firing' ? '🔴 FIRING' : '✅ RESOLVED'}
**Severity:** ${severity.toUpperCase()}
**Component:** ${component || 'Unknown'}
**Instance:** ${alert.labels.instance || 'N/A'}

### 📊 Details
- **Alert Name:** ${alertname}
- **Job:** ${alert.labels.job || 'N/A'}
- **Started At:** ${new Date(alert.startsAt).toLocaleString('fr-FR')}
${alert.endsAt ? `- **Ended At:** ${new Date(alert.endsAt).toLocaleString('fr-FR')}` : ''}

### 📝 Description
${alert.annotations.description || alert.annotations.summary}

### 🔗 Links
- **Prometheus:** [View Alert](${alert.generatorURL})
${alert.annotations.runbook_url ? `- **Runbook:** [Troubleshooting Guide](${alert.annotations.runbook_url})` : ''}

### 🏷️ Alert Labels
${Object.entries(alert.labels).map(([key, value]) => `- **${key}:** ${value}`).join('\n')}

---
*Cette issue a été créée automatiquement par le système MCO Webrly.*
*Fingerprint: \`${alert.fingerprint}\`*`;

  // Construction des labels
  const labels = [
    'type/maintenance',
    'status/needs-triage',
    SEVERITY_TO_PRIORITY[severity] || 'priority/medium'
  ];
  
  if (component && COMPONENT_MAPPING[component as keyof typeof COMPONENT_MAPPING]) {
    labels.push(COMPONENT_MAPPING[component as keyof typeof COMPONENT_MAPPING]);
  }
  
  if (alert.status === 'firing') {
    labels.push('incident');
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Webrly-MCO-Bot/1.0'
      },
      body: JSON.stringify({
        title,
        body,
        labels
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API error: ${response.status} ${errorText}`);
    }

    const issue = await response.json();
    
    logger.info('GitHub issue created from alert', {
      component: 'alertmanager-webhook',
      action: 'create-issue',
      metadata: {
        issueNumber: issue.number,
        issueUrl: issue.html_url,
        alertname,
        severity,
        fingerprint: alert.fingerprint
      }
    });

    return issue;
  } catch (error) {
    logger.error('Failed to create GitHub issue', {
      component: 'alertmanager-webhook',
      action: 'create-issue',
      error: error as Error,
      metadata: { alertname, severity }
    });
    throw error;
  }
}

async function closeGitHubIssue(alert: AlertmanagerAlert) {
  // TODO: Implémenter la fermeture automatique des issues résolues
  // Nécessite de stocker la relation alert fingerprint → issue number
  logger.info('Alert resolved, should close corresponding GitHub issue', {
    component: 'alertmanager-webhook',
    action: 'close-issue',
    metadata: { fingerprint: alert.fingerprint, alertname: alert.labels.alertname }
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérification de l'authentification webhook
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ALERTMANAGER_WEBHOOK_SECRET;
    
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      logger.warn('Unauthorized alertmanager webhook attempt', {
        component: 'alertmanager-webhook',
        action: 'auth-failed'
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: AlertmanagerPayload = await request.json();
    
    logger.info('Alertmanager webhook received', {
      component: 'alertmanager-webhook',
      action: 'webhook-received',
      metadata: {
        receiver: payload.receiver,
        status: payload.status,
        alertsCount: payload.alerts.length,
        groupKey: payload.groupKey
      }
    });

    const results = [];
    
    for (const alert of payload.alerts) {
      try {
        if (alert.status === 'firing') {
          // Créer une issue pour les alertes en cours
          const issue = await createGitHubIssue(alert);
          results.push({ alert: alert.labels.alertname, action: 'created', issue: issue?.number });
        } else if (alert.status === 'resolved') {
          // Marquer les alertes résolues (TODO: fermer les issues)
          await closeGitHubIssue(alert);
          results.push({ alert: alert.labels.alertname, action: 'resolved' });
        }
      } catch (error) {
        logger.error('Failed to process alert', {
          component: 'alertmanager-webhook',
          action: 'process-alert',
          error: error as Error,
          metadata: { alertname: alert.labels.alertname }
        });
        results.push({ 
          alert: alert.labels.alertname, 
          action: 'error', 
          error: (error as Error).message 
        });
      }
    }

    logger.info('Alertmanager webhook processed', {
      component: 'alertmanager-webhook',
      action: 'webhook-processed',
      metadata: { processedAlerts: results.length }
    });

    return NextResponse.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    logger.critical('Alertmanager webhook failed', {
      component: 'alertmanager-webhook',
      action: 'webhook-error',
      error: error as Error
    });

    return NextResponse.json({
      error: 'Webhook processing failed',
      message: (error as Error).message
    }, { status: 500 });
  }
}

// Support GET pour des tests
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    service: 'Alertmanager Webhook',
    status: 'ready',
    endpoints: {
      webhook: 'POST /api/webhooks/alertmanager',
      authentication: 'Bearer token via ALERTMANAGER_WEBHOOK_SECRET'
    },
    features: [
      'Auto-create GitHub issues from firing alerts',
      'Auto-close issues from resolved alerts (planned)',
      'Severity-based priority labeling',
      'Component-based labeling'
    ]
  });
}
