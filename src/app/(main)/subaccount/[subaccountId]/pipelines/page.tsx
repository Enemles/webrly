import { redirect } from 'next/navigation'
import React from 'react'
import { getPipelinesAction, createPipelineAction } from '@/lib/actions/pipeline'

type Props = {
  params: {
    subaccountId: string
  }
}

const Pipelines = async ({ params }: Props) => {
  // Le layout gère déjà l'auth, plus besoin de vérifications redondantes
  
  // Utilisation du service d'action au lieu d'accès direct à la DB
  const existingPipelines = await getPipelinesAction(params.subaccountId)

  if (existingPipelines.length > 0) {
    return redirect(
      `/subaccount/${params.subaccountId}/pipelines/${existingPipelines[0].id}`
    )
  }

  // Création du premier pipeline via l'action
  const response = await createPipelineAction({ 
    name: 'First Pipeline', 
    subAccountId: params.subaccountId 
  })

  return redirect(
    `/subaccount/${params.subaccountId}/pipelines/${response.id}`
  )
}

export default Pipelines
