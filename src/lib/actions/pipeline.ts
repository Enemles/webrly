'use server'

import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { saveActivityLogsNotification } from '@/lib/services/notification'

export type PipelineWithLanesAndTickets = Prisma.PipelineGetPayload<{
  include: {
    Lane: {
      include: {
        Tickets: {
          include: {
            Tags: true
            Assigned: true
            Customer: true
          }
        }
      }
    }
  }
}>

export async function getPipelinesAction(subaccountId: string): Promise<PipelineWithLanesAndTickets[]> {
  const pipelines = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
    include: {
      Lane: {
        include: {
          Tickets: {
            include: {
              Tags: true,
              Assigned: true,
              Customer: true
            }
          }
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return pipelines
}

export async function createPipelineAction(data: { name: string; subAccountId: string }) {
  const pipeline = await db.pipeline.create({
    data: {
      name: data.name,
      subAccountId: data.subAccountId
    }
  })

  revalidatePath(`/subaccount/${data.subAccountId}/pipelines`)
  return pipeline
}

export async function deletePipelineAction(pipelineId: string) {
  const pipeline = await db.pipeline.findUnique({
    where: { id: pipelineId },
    select: { subAccountId: true }
  })

  if (!pipeline) {
    throw new Error('Pipeline non trouvé')
  }
  
  await db.pipeline.delete({
    where: { id: pipelineId }
  })

  revalidatePath(`/subaccount/${pipeline.subAccountId}/pipelines`)
}

export async function updatePipelineAction(pipelineId: string, data: { name?: string }) {
  const pipeline = await db.pipeline.findUnique({
    where: { id: pipelineId },
    select: { subAccountId: true }
  })

  if (!pipeline) {
    throw new Error('Pipeline non trouvé')
  }
  
  const updatedPipeline = await db.pipeline.update({
    where: { id: pipelineId },
    data
  })

  revalidatePath(`/subaccount/${pipeline.subAccountId}/pipelines`)
  return updatedPipeline
}

// Nouvelle action pour la mise à jour du goal d'agence
export async function updateAgencyGoalAction(agencyId: string, goal: number) {
  const updatedAgency = await db.agency.update({
    where: { id: agencyId },
    data: { goal }
  })

  // Ajouter log d'activité
  await saveActivityLogsNotification({
    agencyId,
    description: `Updated the agency goal to | ${goal} Sub Account`,
    subaccountId: undefined,
  })

  // Revalider plusieurs chemins pour s'assurer que le changement est visible partout
  revalidatePath(`/agency/${agencyId}`) // Dashboard
  revalidatePath(`/agency/${agencyId}/settings`) // Page settings
  revalidatePath('/agency') // Page principale agency
  
  return updatedAgency
} 