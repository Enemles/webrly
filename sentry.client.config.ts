import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Environment et release
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  // Configuration pour Next.js
  integrations: [
    Sentry.replayIntegration({
      // Configuration du replay de session (optionnel)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Sampling - ajustez selon vos besoins
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Replay de session pour debug (gratuit jusqu'à 1K replays/mois)
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Tags par défaut
  initialScope: {
    tags: {
      component: 'client',
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    },
  },
  
  // Filtrage des erreurs non critiques
  beforeSend(event) {
    // Ignorer certaines erreurs communes
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
        return null; // Ignorer cette erreur commune
      }
      if (error?.value?.includes('Non-Error promise rejection')) {
        return null;
      }
    }
    
    // Ajouter le contexte MCO
    event.tags = {
      ...event.tags,
      mco_system: 'webrly',
      monitoring_level: 'production'
    };
    
    return event;
  },
});
