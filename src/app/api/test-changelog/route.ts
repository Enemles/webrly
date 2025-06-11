import { NextRequest, NextResponse } from 'next/server';

// Route de test pour valider le système de changelog
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test du système de changelog automatique',
    timestamp: new Date().toISOString(),
    version: '1.0.0-test'
  });
} 