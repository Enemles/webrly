import { Prisma } from '@prisma/client'
import { getFunnels } from '../../services/funnel'

export type FunnelsForSubAccount = Prisma.PromiseReturnType<
  typeof getFunnels
>[0]

export type UpsertFunnelPage = Prisma.FunnelPageCreateWithoutFunnelInput 