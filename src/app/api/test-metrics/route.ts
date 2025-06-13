import { NextRequest, NextResponse } from 'next/server';
import { withMetrics } from '@/lib/metrics-middleware';
import { activeUsers, authenticationAttempts } from '@/lib/metrics';

async function handler(req: NextRequest) {
  // Simuler quelques métriques
  activeUsers.set(Math.floor(Math.random() * 100) + 10);
  authenticationAttempts.labels('success', 'clerk').inc();
  
  // Simuler une latence variable
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  
  return NextResponse.json({
    message: 'Route de test pour les métriques',
    timestamp: new Date().toISOString(),
    activeUsers: Math.floor(Math.random() * 100) + 10
  });
}

export const GET = withMetrics(handler);
export const POST = withMetrics(handler); 