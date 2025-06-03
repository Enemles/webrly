import { useState, useCallback } from 'react'
import { useToast } from './use-toast'

export type AsyncOperationOptions = {
  successMessage?: string
  errorMessage?: string
  onSuccess?: (result: any) => void | Promise<void>
  onError?: (error: any) => void
  showToast?: boolean
}

export function useAsyncOperation() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const execute = useCallback(async (
    operation: () => Promise<any>,
    options: AsyncOperationOptions = {}
  ) => {
    const {
      successMessage,
      errorMessage = 'Une erreur est survenue',
      onSuccess,
      onError,
      showToast = true
    } = options

    setIsLoading(true)
    setError(null)

    try {
      const result = await operation()

      if (successMessage && showToast) {
        toast({
          title: successMessage,
          variant: 'default'
        })
      }

      if (onSuccess) {
        await onSuccess(result)
      }

      return result
    } catch (err) {
      const error = err as Error
      setError(error)

      if (showToast) {
        toast({
          title: errorMessage,
          variant: 'destructive'
        })
      }

      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    execute,
    isLoading,
    error,
    reset
  }
} 