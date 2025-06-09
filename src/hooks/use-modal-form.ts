import { useModal } from '@/providers/modal-provider'
import { useFormSubmit, type SubmitOptions, type SubmitHandler } from './use-form-submit'

export function useModalForm<T = any>() {
  const { setClose } = useModal()
  const { handleSubmit, isSubmitting } = useFormSubmit<T>()

  const handleModalSubmit = async (
    handler: SubmitHandler<T>,
    data: T,
    options: SubmitOptions & { closeOnSuccess?: boolean } = {}
  ) => {
    const { closeOnSuccess = true, ...submitOptions } = options

    try {
      const result = await handleSubmit(handler, data, submitOptions)
      
      if (closeOnSuccess) {
        setClose()
      }
      
      return result
    } catch (error) {
      // L'erreur est déjà gérée par handleSubmit
      throw error
    }
  }

  return {
    handleModalSubmit,
    isSubmitting,
    closeModal: setClose
  }
} 