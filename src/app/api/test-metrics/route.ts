import { NextRequest, NextResponse } from 'next/server';
import { withMetrics } from '@/lib/metrics-middleware';
import { trackActiveUsers, trackAuthAttempt } from '@/lib/metrics-helpers';

async function handleGet(request: NextRequest) {
  // Simuler quelques métriques
  trackActiveUsers(Math.floor(Math.random() * 20) + 1); // 1-20 utilisateurs
  trackAuthAttempt('success', 'clerk');
  
  // Simuler différents types de réponses
  const responses = [
    { status: 200, message: 'Succès' },
    { status: 200, message: 'OK' },
    { status: 404, message: 'Non trouvé' },
    { status: 500, message: 'Erreur serveur' }
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  return NextResponse.json({
    ...response,
    timestamp: new Date().toISOString(),
    metrics_generated: true
  }, { status: response.status });
}

async function handlePost(request: NextRequest) {
  trackAuthAttempt('failure', 'clerk');
  trackActiveUsers(5);
  
  return NextResponse.json({
    message: 'POST traité',
    timestamp: new Date().toISOString()
  });
}

// Exporter avec le wrapper de métriques
export const GET = withMetrics(handleGet);
export const POST = withMetrics(handlePost); 