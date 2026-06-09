import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    switch (type) {
      case 'database-error':
        // Simuler une erreur de base de données
        throw new Error('Database connection failed - MCO test error');
      
      case 'timeout':
        // Simuler un timeout
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Request timeout after 5000ms - MCO test'));
          }, 100); // Court pour le test
        });
        break;
      
      case 'validation':
        // Simuler une erreur de validation
        throw new Error('Validation failed: required field missing');
      
      default:
        // Erreur générique
        throw new Error('Generic server error for Sentry testing');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Sentry test API error', {
      component: 'sentry-test-api',
      action: 'trigger-error',
      error: error as Error,
      metadata: { errorType: type }
    });

    return NextResponse.json(
      { 
        error: 'Test error triggered successfully',
        type: type,
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    if (body.test === 'server-error') {
      // @ts-ignore - Erreur intentionnelle pour test Sentry
      undefinedServerFunction();
    }

    // Simuler d'autres types d'erreurs serveur
    if (body.test === 'async-error') {
      await Promise.reject(new Error('Server-side async error test'));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.critical('Sentry POST test error', {
      component: 'sentry-test-api',
      action: 'post-error',
      error: error as Error,
      metadata: { 
        testType: 'server-post-error',
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') ?? 'unknown'
      }
    });

    return NextResponse.json(
      { 
        error: 'Server POST error triggered',
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
