import { useState } from 'react'
import { useToast } from './use-toast'
import { useRouter } from 'next/navigation'

export type SubmitOptions = {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void | Promise<void>
  onError?: (error: any) => void
  shouldRefresh?: boolean
  redirectTo?: string
}

export type SubmitHandler<T> = (data: T) => Promise<any>

export function useFormSubmit<T = any>() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (
    handler: SubmitHandler<T>,
    data: T,
    options: SubmitOptions = {}
  ) => {
    const {
      successMessage = 'Opération réussie',
      errorMessage = 'Une erreur est survenue',
      onSuccess,
      onError,
      shouldRefresh = false,
      redirectTo
    } = options

    setIsSubmitting(true)

    try {
      const result = await handler(data)

      toast({
        title: successMessage,
        variant: 'default'
      })

      if (onSuccess) {
        await onSuccess()
      }

      if (shouldRefresh) {
        router.refresh()
      }

      if (redirectTo) {
        router.push(redirectTo)
      }

      return result
    } catch (error) {
      console.error('Form submission error:', error)
      
      toast({
        title: errorMessage,
        variant: 'destructive'
      })

      if (onError) {
        onError(error)
      }

      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    handleSubmit,
    isSubmitting
  }
} 