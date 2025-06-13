import { NextRequest, NextResponse } from 'next/server';
import { activeUsers, authenticationAttempts } from '@/lib/metrics';

export async function GET(req: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Erreur dans test-metrics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération des métriques de test' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    authenticationAttempts.labels('failure', 'clerk').inc();
    activeUsers.set(Math.floor(Math.random() * 50) + 5);
    
    return NextResponse.json({
      message: 'POST traité avec métriques',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur dans test-metrics POST:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement POST' },
      { status: 500 }
    );
  }
} 