'use client'

import React from 'react'
import { usePipelineData } from '@/hooks/use-pipeline-data'
import { ErrorFallback } from '@/components/common/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import Loading from '@/components/global/loading'

type PipelineManagerProps = {
  subaccountId: string
}

export function PipelineManager({ subaccountId }: PipelineManagerProps) {
  const {
    pipelines,
    currentPipeline,
    isLoading,
    error,
    createPipeline,
    deletePipeline,
    selectPipeline,
    fetchPipelines
  } = usePipelineData(subaccountId)

  const handleCreatePipeline = async () => {
    const name = prompt('Nom du nouveau pipeline:')
    if (name) {
      await createPipeline(name)
    }
  }

  const handleDeletePipeline = async (pipelineId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pipeline ?')) {
      await deletePipeline(pipelineId)
    }
  }

  if (error) {
    return (
      <ErrorFallback
        error={error}
        onRetry={fetchPipelines}
        message="Erreur lors du chargement des pipelines"
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Pipelines</h2>
        <Button onClick={handleCreatePipeline} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Pipeline
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loading />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipelines.map((pipeline) => (
          <Card 
            key={pipeline.id}
            className={`cursor-pointer transition-colors ${
              currentPipeline?.id === pipeline.id 
                ? 'ring-2 ring-primary' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => selectPipeline(pipeline)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{pipeline.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {pipeline.Lane?.length || 0} colonnes
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeletePipeline(pipeline.id)
                  }}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pipelines.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun pipeline trouvé</p>
          <Button onClick={handleCreatePipeline} className="mt-4">
            Créer votre premier pipeline
          </Button>
        </div>
      )}
    </div>
  )
} 