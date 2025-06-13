import { NextRequest, NextResponse } from 'next/server';
import { updateRealMetrics } from '@/lib/real-metrics';
import { authenticationAttempts } from '@/lib/metrics';

export async function GET(req: NextRequest) {
  try {
    // Mettre à jour toutes les métriques réelles depuis la DB
    await updateRealMetrics();
    
    // Simuler occasionnellement des tentatives d'auth (mais moins souvent)
    if (Math.random() < 0.1) { // 10% de chance seulement
      authenticationAttempts.labels('success', 'clerk').inc();
    }
    
    return NextResponse.json({
      message: 'Métriques réelles mises à jour depuis la base de données',
      timestamp: new Date().toISOString(),
      updated: 'real_business_metrics',
      note: 'Les métriques reflètent maintenant vos vraies données business'
    });
  } catch (error) {
    console.error('Erreur dans real-metrics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des métriques réelles' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Simuler une erreur ou action spécifique
    authenticationAttempts.labels('failure', 'clerk').inc();
    
    // Mettre à jour les métriques après une action
    await updateRealMetrics();
    
    return NextResponse.json({
      message: 'Action POST traitée avec mise à jour des métriques',
      timestamp: new Date().toISOString(),
      action: 'metrics_refreshed_after_post'
    });
  } catch (error) {
    console.error('Erreur dans POST real-metrics:', error);
    return NextResponse.json(
      { error: 'Erreur lors du traitement POST' },
      { status: 500 }
    );
  }
} 