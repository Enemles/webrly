import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Environment et release
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Configuration serveur
  integrations: [
    // Prisma integration si disponible
    ...(process.env.DATABASE_URL ? [
      Sentry.prismaIntegration()
    ] : []),
  ],
  
  // Sampling plus agressif côté serveur
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  // Tags par défaut côté serveur
  initialScope: {
    tags: {
      component: 'server',
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      database: process.env.DATABASE_URL ? 'postgres' : 'unknown',
    },
  },
  
  // Filtrage spécifique au serveur
  beforeSend(event) {
    // Ignorer certaines erreurs serveur communes
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value?.includes('ECONNRESET')) {
        return null; // Connexions réseau interrompues
      }
      if (error?.value?.includes('Request timeout')) {
        return null;
      }
    }
    
    // Ajouter contexte serveur MCO
    event.tags = {
      ...event.tags,
      mco_system: 'webrly',
      monitoring_level: 'production',
      server_component: true
    };
    
    // Ajouter des infos de performance si disponible
    if (event.contexts?.runtime) {
      event.contexts.mco = {
        memory_usage: process.memoryUsage().heapUsed,
        uptime: process.uptime(),
        node_version: process.version,
      };
    }
    
    return event;
  },
});
