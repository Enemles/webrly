import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

export async function GET(request: NextRequest) {
  try {
    const metrics = await register.metrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la génération des métriques:', error);
    return NextResponse.json(
      { error: 'Échec de la génération des métriques' }, 
      { status: 500 }
    );
  }
}

// Bloquer les autres méthodes HTTP
export async function POST() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' }, 
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' }, 
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' }, 
    { status: 405 }
  );
} 