import { Contact, Lane, Prisma, Tag, Ticket, User } from '@prisma/client'
import { _getTicketsWithAllRelations, getPipelineDetails, getTicketsWithTags } from '../../services/pipeline'

export type TicketAndTags = Ticket & {
  Tags: Tag[]
  Assigned: User | null
  Customer: Contact | null
}

export type LaneDetail = Lane & {
  Tickets: TicketAndTags[]
}

export type PipelineDetailsWithLanesCardsTagsTickets = Prisma.PromiseReturnType<
  typeof getPipelineDetails
>

export type TicketWithTags = Prisma.PromiseReturnType<typeof getTicketsWithTags>

export type TicketDetails = Prisma.PromiseReturnType<
  typeof _getTicketsWithAllRelations
>

export const LaneColors = ['BLUE', 'ORANGE', 'ROSE', 'PURPLE', 'GREEN'] as const
export type LaneColor = (typeof LaneColors)[number] 