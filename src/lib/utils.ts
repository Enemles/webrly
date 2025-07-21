import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Fonction pour convertir les objets Decimal en nombre
//pour éviter ce prisma warning : Warning: Only plain objects can be passed to Client Components from Server Components. Decimal objects are not supported.
// {id: ..., name: ..., createdAt: Date, updatedAt: ..., laneId: ..., order: ..., value: Decimal, description: ..., customerId: ..., assignedUserId: ..., Tags: ..., Assigned: ..., Customer: ...}
export function convertDecimalToNumber<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'object') {
    // Vérifie si l'objet est un Decimal (a une méthode toNumber)
    if (obj && typeof (obj as any).toNumber === 'function') {
      return (obj as any).toNumber() as unknown as T;
    }
    
    // Si c'est une date, on la laisse telle quelle
    if (obj instanceof Date) {
      return obj;
    }
    
    // Si c'est un tableau, on convertit chaque élément
    if (Array.isArray(obj)) {
      return obj.map(item => convertDecimalToNumber(item)) as unknown as T;
    }
    
    // Pour les objets classiques, on convertit récursivement chaque propriété
    const result = {} as Record<string, any>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = convertDecimalToNumber((obj as Record<string, any>)[key]);
      }
    }
    return result as unknown as T;
  }
  
  // Pour les types primitifs, on les retourne tels quels
  return obj;
}

// === SYSTÈME DE LOGGING STRUCTURÉ ===

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
type LogContext = {
  component?: string;
  userId?: string;
  sessionId?: string;
  action?: string;
  metadata?: Record<string, any>;
  error?: Error;
};

interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  environment: string;
  version?: string;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private version = process.env.NEXT_PUBLIC_APP_VERSION || 'unknown';
  
  private formatLog(level: LogLevel, message: string, context: LogContext = {}): StructuredLog {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      environment: process.env.NODE_ENV || 'unknown',
      version: this.version
    };
  }
  
  private output(log: StructuredLog) {
    const { level, message, context, timestamp } = log;
    
    if (this.isDev) {
      // Logging coloré pour le développement
      const colors = {
        debug: 'color: #6b7280; background: #f3f4f6',
        info: 'color: #059669; background: #d1fae5', 
        warn: 'color: #d97706; background: #fef3c7',
        error: 'color: #dc2626; background: #fee2e2',
        critical: 'color: #ffffff; background: #dc2626; font-weight: bold'
      };
      
      console.group(`%c[${level.toUpperCase()}] ${message}`, colors[level]);
      console.log('⏰ Time:', timestamp);
      if (context.component) console.log('🧩 Component:', context.component);
      if (context.userId) console.log('👤 User:', context.userId);
      if (context.action) console.log('🎯 Action:', context.action);
      if (context.metadata) console.log('📊 Metadata:', context.metadata);
      if (context.error) {
        console.log('❌ Error:', context.error.message);
        console.log('📋 Stack:', context.error.stack);
      }
      console.groupEnd();
    } else {
      // JSON structuré pour la production
      console.log(JSON.stringify(log));
    }
    
    // Envoi vers monitoring externe si configuré
    this.sendToExternal(log);
  }
  
  private sendToExternal(log: StructuredLog) {
    // Intégration Sentry - maintenant activée
    if (process.env.SENTRY_DSN && (log.level === 'error' || log.level === 'critical')) {
      try {
        // Import dynamique pour éviter les erreurs si Sentry n'est pas disponible
        import('@sentry/nextjs').then((Sentry) => {
          const error = log.context.error || new Error(log.message);
          
          Sentry.captureException(error, {
            extra: {
              structuredLog: log,
              timestamp: log.timestamp,
              environment: log.environment
            },
            tags: {
              component: log.context.component,
              action: log.context.action,
              level: log.level,
              mco_system: 'webrly'
            },
            user: log.context.userId ? { id: log.context.userId } : undefined,
            contexts: {
              mco: {
                version: log.version,
                metadata: log.context.metadata
              }
            },
            level: log.level === 'critical' ? 'fatal' : 'error'
          });
        }).catch(() => {
          // Sentry non disponible, fallback vers console
          if (this.isDev) {
            console.log('🔍 [SENTRY] Module not available, error logged to console only');
          }
        });
      } catch (error) {
        // Fallback silencieux
        if (this.isDev) {
          console.warn('Failed to send to Sentry:', error);
        }
      }
    }

    // Monitoring externe - seulement si configuré  
    if (process.env.MONITORING_ENDPOINT && process.env.MONITORING_API_KEY) {
      // TODO Phase 3: Intégration DataDog/New Relic
      if (this.isDev) {
        console.log('📊 [MONITORING] Would send to external:', log.message);
      }
    }
  }
  
  debug(message: string, context?: LogContext) {
    this.output(this.formatLog('debug', message, context));
  }
  
  info(message: string, context?: LogContext) {
    this.output(this.formatLog('info', message, context));
  }
  
  warn(message: string, context?: LogContext) {
    this.output(this.formatLog('warn', message, context));
  }
  
  error(message: string, context?: LogContext) {
    this.output(this.formatLog('error', message, context));
  }
  
  critical(message: string, context: LogContext = {}) {
    this.output(this.formatLog('critical', message, context));
    
    // Alertes critiques - seulement si webhook configuré
    if (!this.isDev && process.env.WEBHOOK_CRITICAL_ALERTS) {
      this.triggerCriticalAlert(message, context);
    } else if (this.isDev) {
      // En développement, simulation de l'alerte
      console.warn('🚨 [ALERT SIMULATION] Critical alert would be sent:', message);
    }
  }
  
  private async triggerCriticalAlert(message: string, context: LogContext) {
    if (!process.env.WEBHOOK_CRITICAL_ALERTS) {
      console.warn('WEBHOOK_CRITICAL_ALERTS not configured, skipping alert');
      return;
    }

    try {
      const payload = {
        text: `🚨 CRITICAL ALERT - Webrly Production`,
        attachments: [{
          color: 'danger',
          title: message,
          fields: [
            { title: 'Environment', value: process.env.NODE_ENV, short: true },
            { title: 'Timestamp', value: new Date().toISOString(), short: true },
            { title: 'Component', value: context.component || 'Unknown', short: true },
            { title: 'Version', value: process.env.NEXT_PUBLIC_APP_VERSION || 'Unknown', short: true }
          ],
          footer: 'Webrly MCO System'
        }]
      };

      const response = await fetch(process.env.WEBHOOK_CRITICAL_ALERTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Failed to send critical alert:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending critical alert:', error);
      // Fallback: au moins logger l'erreur
      console.error('CRITICAL UNDELIVERED:', { message, context });
    }
  }
}

export const logger = new Logger();

// Helper pour tracer les performances
export const withPerfLog = <T extends (...args: any[]) => any>(
  fn: T,
  fnName: string,
  component?: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;
    
    logger.debug(`Performance: ${fnName}`, {
      component,
      action: 'performance',
      metadata: { duration: `${duration.toFixed(2)}ms` }
    });
    
    return result;
  }) as T;
};


export function getStripeOAuthLink(
  accountType: 'agency' | 'subaccount',
  state: string
) {
  return `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID}&scope=read_write&redirect_uri=${process.env.NEXT_PUBLIC_URL}/${accountType}&state=${state}`
}
