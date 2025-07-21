'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SentryTestPage() {
  const triggerClientError = () => {
    // @ts-ignore - Erreur intentionnelle pour test Sentry
    myUndefinedFunction();
  };

  const triggerServerError = async () => {
    try {
      const response = await fetch('/api/sentry-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'server-error' })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to trigger server error:', error);
    }
  };

  const triggerCustomError = () => {
    throw new Error('Test error from Sentry test page - MCO monitoring test');
  };

  const triggerAsyncError = async () => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Async error test - Promise rejection'));
      }, 1000);
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">🔍 Sentry Error Tracking Test</h1>
          <p className="text-muted-foreground mt-2">
            Page de test pour valider l&apos;intégration Sentry MCO
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🖥️ Client-Side Errors
              </CardTitle>
              <CardDescription>
                Test des erreurs côté client (browser)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={triggerClientError}
                variant="destructive" 
                className="w-full"
              >
                Déclencher Erreur Client
              </Button>
              
              <Button 
                onClick={triggerCustomError}
                variant="outline" 
                className="w-full"
              >
                Erreur Custom avec Message
              </Button>

              <Button 
                onClick={() => triggerAsyncError().catch(console.error)}
                variant="secondary" 
                className="w-full"
              >
                Erreur Promise Async
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🖥️ Server-Side Errors
              </CardTitle>
              <CardDescription>
                Test des erreurs côté serveur (API routes)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={triggerServerError}
                variant="destructive" 
                className="w-full"
              >
                Déclencher Erreur Serveur
              </Button>
              
              <Button 
                onClick={() => fetch('/api/sentry-test?type=database-error')}
                variant="outline" 
                className="w-full"
              >
                Erreur Base de Données
              </Button>

              <Button 
                onClick={() => fetch('/api/sentry-test?type=timeout')}
                variant="secondary" 
                className="w-full"
              >
                Erreur Timeout
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>📊 Informations MCO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Environment:</strong><br/>
                {process.env.NODE_ENV}
              </div>
              <div>
                <strong>Sentry DSN:</strong><br/>
                {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ Configuré' : '❌ Manquant'}
              </div>
              <div>
                <strong>Component:</strong><br/>
                sentry-test-page
              </div>
              <div>
                <strong>MCO Phase:</strong><br/>
                Short-term
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center p-6 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            🔗 <strong>Vérification:</strong> Après avoir cliqué sur les boutons, 
            va sur <a href="https://sentry.io" target="_blank" className="underline text-primary">
              ton dashboard Sentry
            </a> pour voir les erreurs remontées.
          </p>
        </div>
      </div>
    </div>
  );
}
