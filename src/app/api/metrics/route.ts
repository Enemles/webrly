import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { register } from '@/lib/metrics';
import { updateRealMetrics } from '@/lib/real-metrics';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const UNAUTHORIZED = NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401 }
);

function isAuthorized(request: NextRequest, expectedToken: string): boolean {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return false;
  const provided = header.slice('Bearer '.length).trim();
  if (provided.length !== expectedToken.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expectedToken));
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const expected = process.env.METRICS_TOKEN;
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd && !expected) {
    return NextResponse.json(
      { error: 'Metrics endpoint not configured' },
      { status: 503 }
    );
  }

  if (expected && !isAuthorized(request, expected)) {
    return UNAUTHORIZED;
  }

  try {
    await updateRealMetrics();
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
