import { NextRequest, NextResponse } from 'next/server';
import { updateRealMetrics } from '@/lib/real-metrics';

/**
 * Endpoint pour déclencher manuellement la mise à jour des métriques business
 * Utilisé pour les tests et la maintenance du système de monitoring
 */
export async function GET(req: NextRequest) {
  try {
    // Mettre à jour toutes les métriques business depuis la base de données
    await updateRealMetrics();
    
    return NextResponse.json({
      status: 'success',
      message: 'Métriques business mises à jour avec succès',
      timestamp: new Date().toISOString(),
      endpoint: '/api/monitoring',
      description: 'Déclenche la mise à jour manuelle des métriques Prometheus'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des métriques:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Erreur lors de la mise à jour des métriques business',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint pour forcer un refresh complet des métriques
 * Utilisé en cas de problème ou après des changements importants en DB
 */
export async function POST(req: NextRequest) {
  try {
    // Force un refresh complet des métriques
    await updateRealMetrics();
    
    return NextResponse.json({
      status: 'success',
      message: 'Refresh complet des métriques effectué',
      timestamp: new Date().toISOString(),
      action: 'force_refresh'
    });
  } catch (error) {
    console.error('Erreur lors du refresh des métriques:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Erreur lors du refresh des métriques',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
} 