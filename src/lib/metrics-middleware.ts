import { NextRequest } from 'next/server';
import { httpRequestDuration, httpRequestTotal } from './metrics';

// Interface pour tracker une requête
interface RequestTracker {
  end: (statusCode: number) => void;
}

// Fonction pour commencer le tracking d'une requête
export const startRequestTracking = (req: NextRequest): RequestTracker => {
  const start = Date.now();
  const method = req.method;
  const route = req.nextUrl.pathname;

  return {
    end: (statusCode: number) => {
      try {
        const duration = (Date.now() - start) / 1000;
        
        httpRequestDuration
          .labels(method, route, statusCode.toString())
          .observe(duration);
        
        httpRequestTotal
          .labels(method, route, statusCode.toString())
          .inc();
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des métriques:', error);
      }
    }
  };
};

// Wrapper pour les routes API
export const withMetrics = <T extends any[]>(
  handler: (...args: T) => Promise<Response>
) => {
  return async (...args: T): Promise<Response> => {
    const req = args[0] as NextRequest;
    const tracker = startRequestTracking(req);
    
    try {
      const response = await handler(...args);
      tracker.end(response.status);
      return response;
    } catch (error) {
      tracker.end(500);
      throw error;
    }
  };
}; 