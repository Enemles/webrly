import { NextRequest, NextResponse } from 'next/server';
import { httpRequestTotal, httpRequestDuration } from '@/lib/metrics';

export async function POST(req: NextRequest) {
  try {
    const { method, route, statusCode, duration } = await req.json();
    
    // Enregistrer les métriques HTTP
    if (method && route && statusCode) {
      httpRequestTotal
        .labels(method, route, statusCode.toString())
        .inc();
    }
    
    if (duration && method && route && statusCode) {
      httpRequestDuration
        .labels(method, route, statusCode.toString())
        .observe(duration / 1000); // Convertir ms en secondes
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur dans analytics:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement des métriques' },
      { status: 500 }
    );
  }
} 