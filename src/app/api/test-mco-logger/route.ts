import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Route de test pour valider l'intégration MCO Logger + Sentry
export function GET(request: NextRequest) {
  const testType = request.nextUrl.searchParams.get('type') || 'info';
  
  try {
    switch (testType) {
      case 'info':
        logger.info('Test MCO Logger - Info level', {
          component: 'mco-test',
          action: 'logger-validation',
          userId: 'test-user-123',
          metadata: { testType: 'info', timestamp: Date.now() }
        });
        break;
        
      case 'error':
        const testError = new Error('Test error for MCO validation');
        logger.error('Test MCO Logger - Error level', {
          component: 'mco-test',
          action: 'logger-validation',
          error: testError,
          userId: 'test-user-123',
          metadata: { testType: 'error', timestamp: Date.now() }
        });
        break;
        
      case 'critical':
        const criticalError = new Error('Critical system failure simulation');
        logger.critical('Test MCO Logger - Critical level', {
          component: 'mco-test',
          action: 'logger-validation',
          error: criticalError,
          userId: 'test-user-123',
          metadata: { 
            testType: 'critical', 
            timestamp: Date.now(),
            severity: 'high',
            affectedSystems: ['database', 'payment']
          }
        });
        break;
        
      default:
        return NextResponse.json({ 
          error: 'Invalid test type. Use: info, error, or critical' 
        }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: `MCO Logger test completed - ${testType} level`,
      testType,
      sentryIntegration: !!process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.critical('MCO Logger test endpoint failed', {
      component: 'mco-test',
      action: 'endpoint-error',
      error: error as Error,
      metadata: { testType, timestamp: Date.now() }
    });
    
    return NextResponse.json({
      error: 'Test endpoint failed',
      message: (error as Error).message
    }, { status: 500 });
  }
}
