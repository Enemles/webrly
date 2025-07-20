import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/utils';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    stripe: ServiceHealth;
    uploadthing: ServiceHealth;
  };
  metrics: {
    memory: number;
    responseTime: number;
  };
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
}

async function checkDatabase(): Promise<ServiceHealth> {
  const start = performance.now();
  try {
    await db.$queryRaw`SELECT 1`;
    const responseTime = performance.now() - start;
    
    logger.debug('Database health check passed', {
      component: 'health-check',
      action: 'database-check',
      metadata: { responseTime: `${responseTime.toFixed(2)}ms` }
    });
    
    return {
      status: responseTime > 1000 ? 'degraded' : 'up',
      responseTime: Number(responseTime.toFixed(2))
    };
  } catch (error) {
    logger.error('Database health check failed', {
      component: 'health-check',
      action: 'database-check',
      error: error as Error
    });
    
    return {
      status: 'down',
      error: (error as Error).message
    };
  }
}

async function checkStripe(): Promise<ServiceHealth> {
  const start = performance.now();
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return { status: 'down', error: 'Stripe key not configured' };
    }
    
    // Test simple de l'API Stripe
    const response = await fetch('https://api.stripe.com/v1/customers?limit=1', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const responseTime = performance.now() - start;
    
    if (response.ok) {
      return {
        status: responseTime > 2000 ? 'degraded' : 'up',
        responseTime: Number(responseTime.toFixed(2))
      };
    } else {
      return {
        status: 'down',
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'down',
      error: (error as Error).message
    };
  }
}

async function checkUploadThing(): Promise<ServiceHealth> {
  try {
    if (!process.env.UPLOADTHING_SECRET) {
      return { status: 'down', error: 'UploadThing key not configured' };
    }
    
    // On considère que si la clé est configurée, le service est up
    // Un vrai check nécessiterait un appel API
    return { status: 'up' };
  } catch (error) {
    return {
      status: 'down',
      error: (error as Error).message
    };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const start = performance.now();
  
  try {
    logger.info('Health check requested', {
      component: 'health-check',
      action: 'check-start'
    });

    // Vérifications en parallèle
    const [database, stripe, uploadthing] = await Promise.all([
      checkDatabase(),
      checkStripe(),
      checkUploadThing()
    ]);

    // Métriques système
    const memory = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const responseTime = performance.now() - start;

    // Déterminer le statut global
    const services = { database, stripe, uploadthing };
    const hasDown = Object.values(services).some(s => s.status === 'down');
    const hasDegraded = Object.values(services).some(s => s.status === 'degraded');
    
    let status: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (hasDown) status = 'unhealthy';
    else if (hasDegraded) status = 'degraded';

    const healthCheck: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      uptime: process.uptime(),
      services,
      metrics: {
        memory: Number(memory.toFixed(2)),
        responseTime: Number(responseTime.toFixed(2))
      }
    };

    logger.info('Health check completed', {
      component: 'health-check',
      action: 'check-complete',
      metadata: { status, responseTime: `${responseTime.toFixed(2)}ms` }
    });

    // Code de statut HTTP selon le résultat
    const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 206 : 503;
    
    return NextResponse.json(healthCheck, { status: httpStatus });

  } catch (error) {
    logger.critical('Health check endpoint failed', {
      component: 'health-check',
      action: 'check-error',
      error: error as Error
    });

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 });
  }
}

// Endpoint simple pour les load balancers
export async function HEAD(): Promise<NextResponse> {
  try {
    // Check rapide de la DB seulement
    await db.$queryRaw`SELECT 1`;
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
