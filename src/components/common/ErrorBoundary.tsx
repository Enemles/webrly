'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export type ErrorFallbackProps = {
  error?: Error
  message?: string
  onRetry?: () => void
  showRetry?: boolean
  className?: string
}

export function ErrorFallback({ 
  error, 
  message, 
  onRetry, 
  showRetry = true,
  className = "max-w-md mx-auto mt-8"
}: ErrorFallbackProps) {
  const displayMessage = message || error?.message || 'Une erreur inattendue s\'est produite'

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <CardTitle className="text-destructive">Erreur</CardTitle>
        <CardDescription>{displayMessage}</CardDescription>
      </CardHeader>
      {showRetry && onRetry && (
        <CardContent className="text-center">
          <Button
            onClick={onRetry}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

export type AsyncErrorBoundaryProps = {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error) => void
}

// Hook pour gérer les erreurs async dans les composants
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    console.error('Erreur capturée:', error)
    setError(error)
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError
  }
} 