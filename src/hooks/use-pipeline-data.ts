import { useState, useEffect } from 'react'
import { useAsyncOperation } from './use-async-operation'
import { 
  getPipelinesAction,
  createPipelineAction, 
  deletePipelineAction,
  type PipelineWithLanesAndTickets
} from '@/lib/actions/pipeline'

export function usePipelineData(subaccountId: string) {
  const [pipelines, setPipelines] = useState<PipelineWithLanesAndTickets[]>([])
  const [currentPipeline, setCurrentPipeline] = useState<PipelineWithLanesAndTickets | null>(null)
  const { execute, isLoading, error } = useAsyncOperation()

  const fetchPipelines = async () => {
    return execute(
      async () => {
        const result = await getPipelinesAction(subaccountId)
        setPipelines(result)
        return result
      },
      { 
        errorMessage: 'Erreur lors du chargement des pipelines',
        showToast: false 
      }
    )
  }

  const createPipeline = async (name: string) => {
    return execute(
      async () => {
        const result = await createPipelineAction({ name, subAccountId: subaccountId })
        await fetchPipelines() // Refresh list
        return result
      },
      { 
        successMessage: 'Pipeline créé avec succès',
        errorMessage: 'Erreur lors de la création du pipeline'
      }
    )
  }

  const deletePipeline = async (pipelineId: string) => {
    return execute(
      async () => {
        await deletePipelineAction(pipelineId)
        await fetchPipelines() // Refresh list
        
        // Reset current pipeline if it was deleted
        if (currentPipeline?.id === pipelineId) {
          setCurrentPipeline(null)
        }
      },
      { 
        successMessage: 'Pipeline supprimé avec succès',
        errorMessage: 'Erreur lors de la suppression du pipeline'
      }
    )
  }

  const selectPipeline = (pipeline: PipelineWithLanesAndTickets) => {
    setCurrentPipeline(pipeline)
  }

  useEffect(() => {
    if (subaccountId) {
      fetchPipelines()
    }
  }, [subaccountId])

  // Auto-select first pipeline if none selected
  useEffect(() => {
    if (pipelines.length > 0 && !currentPipeline) {
      setCurrentPipeline(pipelines[0])
    }
  }, [pipelines, currentPipeline])

  return {
    pipelines,
    currentPipeline,
    isLoading,
    error,
    fetchPipelines,
    createPipeline,
    deletePipeline,
    selectPipeline
  }
}

// Export du type pour réutilisation
export type { PipelineWithLanesAndTickets } 