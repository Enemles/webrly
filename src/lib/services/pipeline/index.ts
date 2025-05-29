'use server'

import { db } from '@/lib/db'
import { convertDecimalToNumber } from '@/lib/utils'
import { Pipeline, Lane, Ticket, Prisma, Tag } from '@prisma/client'
import { v4 } from 'uuid'


export const getPipelineDetails = async (pipelineId: string) => {
  const response = await db.pipeline.findUnique({
    where: {
      id: pipelineId,
    },
  })
  return response
}

export const getLanesWithTicketsAndTags = async (
  pipelineId: string
) => {
  const response = await db.lane.findMany({
    where: {
      pipelineId,
    },
    orderBy: {
      order: 'asc',
    },
    include: {
      Tickets: {
        orderBy: {
          order: 'asc',
        },
        include: {
          Tags: true,
          Assigned: true,
          Customer: true,
        },
      },
    },
  })
  return convertDecimalToNumber(response)
}

export const upsertPipeline = async (
  pipeline: Prisma.PipelineUncheckedCreateWithoutLaneInput
) => {
  const response = await db.pipeline.upsert({
    where: { id: pipeline.id || v4() },
    update: pipeline,
    create: pipeline,
  })

  return response
}

export const deletePipeline = async (pipelineId: string) => {
  const response = await db.pipeline.delete({
    where: { id: pipelineId },
  })
  return response
}

export const updateLanesOrder = async (lanes: Lane[]) => {
  try {
    const updateTrans = lanes.map((lane) =>
      db.lane.update({
        where: {
          id: lane.id
        },
        data: {
          order: lane.order
        },
      })
    )
    await db.$transaction(updateTrans)
    console.log('Lanes order updated')
  } catch (error) {
    console.error('Error updating lanes order:', error)
    throw new Error('Failed to update lanes order')
  }
}

export const updateTicketOrder = async (tickets: Ticket[]) => {
  try {
    const updateTrans = tickets.map((ticket) =>
      db.ticket.update({
        where: { id: ticket.id },
        data: { order: ticket.order, laneId: ticket.laneId },
      })
    )
    await db.$transaction(updateTrans)
    console.log('Tickets order updated')
  } catch (error) {
    console.error('Error updating tickets order:', error)
    throw new Error('Failed to update tickets order')
  }
}

export const upsertLane = async (lane: Prisma.LaneUncheckedCreateInput) => {
  let order: number

  if (!lane.order) {
    const lanes = await db.lane.findMany({
      where: {
        pipelineId: lane.pipelineId,
      }
    })
    order = lanes.length
  } else {
    order = lane.order
  }

  const response = await db.lane.upsert({
    where: { id: lane.id || v4() },
    update: lane,
    create: {
      ...lane,
      order,
    },
  })

  return response
}

export const deleteLane = async (laneId: string) => {
  const response = await db.lane.delete({
    where: { id: laneId },
  })
  return response
}

export const getTicketsWithTags = async (pipelineId: string) => {
  const response = await db.ticket.findMany({
    where: {
      Lane: {
        pipelineId,
      },
    },
    include: {
      Tags: true,
      Assigned: true,
      Customer: true,
    },
  })
  return convertDecimalToNumber(response)
}

export const _getTicketsWithAllRelations = async (laneId: string) => {
  const response = await db.ticket.findMany({
    where: {
      laneId,
    },
    include: {
      Assigned: true,
      Customer: true,
      Lane: true,
      Tags: true,
    },
  })
  return convertDecimalToNumber(response)
}

export const upsertTicket = async (
  ticket: Prisma.TicketUncheckedCreateInput,
  tags: Tag[]
) => {
  let order: number
  if (!ticket.order) {
    const tickets = await db.ticket.findMany({
      where: { laneId: ticket.laneId },
    })
    order = tickets.length
  } else {
    order = ticket.order
  }

  const response = await db.ticket.upsert({
    where: {
      id: ticket.id || v4(),
    },
    update: { ...ticket, Tags: { set: tags } },
    create: { ...ticket, Tags: { connect: tags }, order },
    include: {
      Assigned: true,
      Customer: true,
      Tags: true,
      Lane: true,
    },
  })

  return convertDecimalToNumber(response)
}

export const deleteTicket = async (ticketId: string) => {
  const response = await db.ticket.delete({
    where: {
      id: ticketId,
    },
  })

  return convertDecimalToNumber(response)
}

export const upsertTag = async (
  subaccountId: string,
  tag: Prisma.TagUncheckedCreateInput
) => {
  const response = await db.tag.upsert({
    where: { id: tag.id || v4(), subAccountId: subaccountId },
    update: tag,
    create: { ...tag, subAccountId: subaccountId },
  })

  return response
}

export const getTagsForSubaccount = async (subaccountId: string) => {
  const response = await db.subAccount.findUnique({
    where: { id: subaccountId },
    select: { Tags: true },
  })
  return response
}

export const deleteTag = async (tagId: string) => {
  const response = await db.tag.delete({ where: { id: tagId } })
  return response
}

export const getPipelines = async (subaccountId: string) => {
  const response = await db.pipeline.findMany({
    where: { subAccountId: subaccountId },
    include: {
      Lane: {
        include: { Tickets: true },
      },
    },
  })
  return convertDecimalToNumber(response)
}
